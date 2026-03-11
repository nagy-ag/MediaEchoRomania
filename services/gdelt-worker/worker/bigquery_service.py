from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from worker.config import Settings, parse_service_account
from worker.gdelt import source_file_from_url
from worker.models import JobResult, MasterfileEntry
from worker.outlet_registry import load_outlet_seed


class BigQueryService:
    def __init__(self, settings: Settings, client: Any | None = None) -> None:
        self.settings = settings
        self.client = client or self._build_client()

    def _build_client(self) -> Any:
        from google.cloud import bigquery
        from google.oauth2 import service_account

        service_account_info = parse_service_account()
        if service_account_info:
            credentials = service_account.Credentials.from_service_account_info(service_account_info)
            return bigquery.Client(
                project=self.settings.gcp_project_id,
                credentials=credentials,
                location=self.settings.gcp_location,
            )
        return bigquery.Client(project=self.settings.gcp_project_id, location=self.settings.gcp_location)

    def table_ref(self, dataset: str, table: str) -> str:
        return f"{self.settings.gcp_project_id}.{dataset}.{table}"

    def _render_template(self, sql: str, extra_replacements: dict[str, str] | None = None) -> str:
        rendered = sql.replace("{{ project_id }}", self.settings.gcp_project_id)
        if extra_replacements:
            for key, value in extra_replacements.items():
                rendered = rendered.replace(f"{{{{ {key} }}}}", value)
        return rendered

    def run_sql(self, sql: str) -> None:
        self.client.query(sql).result()

    def run_sql_file(self, path: Path, extra_replacements: dict[str, str] | None = None) -> None:
        sql = path.read_text(encoding="utf-8")
        self.run_sql(self._render_template(sql, extra_replacements))

    def query_rows(self, sql: str, parameters: list[Any] | None = None) -> list[dict[str, Any]]:
        from google.cloud import bigquery

        job_config = bigquery.QueryJobConfig(query_parameters=parameters or [])
        rows = self.client.query(sql, job_config=job_config).result()
        return [dict(row.items()) for row in rows]

    def query_scalar(self, sql: str) -> Any:
        rows = self.query_rows(sql)
        if not rows:
            return None
        return next(iter(rows[0].values()))

    def load_rows(self, dataset: str, table: str, rows: list[dict[str, Any]], write_disposition: str | None = None) -> int:
        from google.cloud import bigquery

        if not rows:
            return 0
        job_config = bigquery.LoadJobConfig(
            write_disposition=write_disposition or bigquery.WriteDisposition.WRITE_APPEND
        )
        self.client.load_table_from_json(rows, self.table_ref(dataset, table), job_config=job_config).result()
        return len(rows)

    def ensure_warehouse(self) -> None:
        ddl_dir = Path(__file__).resolve().parent / "sql" / "ddl"
        for sql_path in sorted(ddl_dir.glob("*.sql")):
            self.run_sql_file(sql_path)
        self.seed_outlets_if_empty()

    def seed_outlets_if_empty(self) -> int:
        outlets_table = self.table_ref(self.settings.datasets.norm, self.settings.outlet_registry_table)
        current_count = self.query_scalar(f"SELECT COUNT(*) AS count FROM `{outlets_table}`")
        if int(current_count or 0) > 0:
            return 0
        payload = load_outlet_seed(self.settings.seed_outlets_path)
        now = datetime.now(timezone.utc).isoformat()
        outlet_rows: list[dict[str, Any]] = []
        alias_rows: list[dict[str, Any]] = []
        for outlet in payload.get("outlets", []):
            outlet_rows.append(
                {
                    "outlet_id": outlet["outlet_id"],
                    "canonical_domain": outlet["canonical_domain"],
                    "canonical_name": outlet["canonical_name"],
                    "is_romanian": outlet["is_romanian"],
                    "is_local": outlet["is_local"],
                    "is_national": outlet["is_national"],
                    "region": outlet["region"],
                    "media_type": outlet["media_type"],
                    "source_class": outlet["source_class"],
                    "status": outlet["status"],
                    "created_at": now,
                    "updated_at": now,
                }
            )
            for alias in outlet.get("aliases", []):
                alias_rows.append(
                    {
                        "alias_domain": alias,
                        "outlet_id": outlet["outlet_id"],
                        "confidence_score": 1.0,
                        "review_status": "approved",
                        "is_primary": alias == outlet["canonical_domain"],
                        "created_at": now,
                        "updated_at": now,
                    }
                )
        self.load_rows(self.settings.datasets.norm, self.settings.outlet_registry_table, outlet_rows)
        self.load_rows(self.settings.datasets.norm, self.settings.outlet_alias_table, alias_rows)
        return len(outlet_rows)

    def approved_domain_rows(self) -> list[dict[str, Any]]:
        alias_table = self.table_ref(self.settings.datasets.norm, self.settings.outlet_alias_table)
        sql = f"SELECT alias_domain, outlet_id, review_status FROM `{alias_table}` WHERE review_status = 'approved'"
        return self.query_rows(sql)

    def existing_source_files(self, source_files: Iterable[str]) -> set[str]:
        from google.cloud import bigquery

        candidates = sorted({item for item in source_files if item})
        if not candidates:
            return set()
        sql = (
            f"SELECT source_file FROM `{self.table_ref(self.settings.datasets.raw, 'ingest_registry')}` "
            "WHERE source_file IN UNNEST(@source_files)"
        )
        rows = self.query_rows(sql, [bigquery.ArrayQueryParameter("source_files", "STRING", candidates)])
        return {str(row["source_file"]) for row in rows}

    def raw_file_already_loaded(self, source_file: str, checksum: str) -> bool:
        from google.cloud import bigquery

        sql = f"""
        SELECT COUNT(*) AS count
        FROM `{self.table_ref(self.settings.datasets.raw, 'raw_files')}`
        WHERE source_file = @source_file AND checksum = @checksum AND status = 'loaded'
        """
        count = self.query_rows(
            sql,
            [
                bigquery.ScalarQueryParameter("source_file", "STRING", source_file),
                bigquery.ScalarQueryParameter("checksum", "STRING", checksum),
            ],
        )[0]["count"]
        return int(count) > 0

    def insert_masterfile_entries(self, entries: list[MasterfileEntry]) -> int:
        existing = self.existing_source_files(source_file_from_url(entry.url) for entry in entries)
        now = datetime.now(timezone.utc).isoformat()
        rows = []
        for entry in entries:
            source_file = source_file_from_url(entry.url)
            if source_file in existing:
                continue
            rows.append(
                {
                    "source_file": source_file,
                    "feed_type": entry.feed_type,
                    "published_at": entry.published_at.isoformat(),
                    "size_bytes": entry.size_bytes,
                    "url": entry.url,
                    "checksum": None,
                    "status": "pending",
                    "rows_loaded": 0,
                    "first_seen_at": now,
                    "last_attempt_at": None,
                    "last_completed_at": None,
                    "error_message": None,
                }
            )
        return self.load_rows(self.settings.datasets.raw, "ingest_registry", rows)

    def list_pending_entries(self, limit: int) -> list[MasterfileEntry]:
        sql = f"""
        SELECT published_at, size_bytes, url, feed_type
        FROM `{self.table_ref(self.settings.datasets.raw, 'ingest_registry')}`
        WHERE status = 'pending'
        ORDER BY published_at ASC, feed_type ASC
        LIMIT {limit}
        """
        rows = self.query_rows(sql)
        return [
            MasterfileEntry(
                published_at=row["published_at"],
                size_bytes=int(row["size_bytes"]),
                url=str(row["url"]),
                feed_type=str(row["feed_type"]),
            )
            for row in rows
        ]

    def update_ingest_registry(
        self,
        source_file: str,
        status: str,
        checksum: str | None,
        rows_loaded: int,
        error_message: str | None = None,
    ) -> None:
        from google.cloud import bigquery

        table = self.table_ref(self.settings.datasets.raw, "ingest_registry")
        checksum_sql = f"'{checksum}'" if checksum else "NULL"
        error_sql = "NULL" if error_message is None else "@error_message"
        query_parameters: list[Any] = []
        if error_message is not None:
            query_parameters.append(bigquery.ScalarQueryParameter("error_message", "STRING", error_message))
        sql = f"""
        UPDATE `{table}`
        SET status = '{status}',
            checksum = {checksum_sql},
            rows_loaded = {rows_loaded},
            last_attempt_at = CURRENT_TIMESTAMP(),
            last_completed_at = IF('{status}' = 'error', last_completed_at, CURRENT_TIMESTAMP()),
            error_message = {error_sql}
        WHERE source_file = @source_file
        """
        query_parameters.append(bigquery.ScalarQueryParameter("source_file", "STRING", source_file))
        job_config = bigquery.QueryJobConfig(query_parameters=query_parameters)
        self.client.query(sql, job_config=job_config).result()

    def record_ingest_error(self, source_file: str, stage: str, error_message: str, payload_json: str) -> None:
        self.load_rows(
            self.settings.datasets.raw,
            "ingest_errors",
            [
                {
                    "source_file": source_file,
                    "occurred_at": datetime.now(timezone.utc).isoformat(),
                    "stage": stage,
                    "error_message": error_message,
                    "payload_json": payload_json,
                }
            ],
        )

    def append_discovery_domains(self, domains: set[str], source_file: str, sample_url: str) -> int:
        from google.cloud import bigquery

        if not domains:
            return 0
        merged = 0
        table = self.table_ref(self.settings.datasets.ops, self.settings.outlet_discovery_table)
        for domain in sorted(domains):
            sql = f"""
            MERGE `{table}` AS target
            USING (
              SELECT @alias_domain AS alias_domain, @sample_source_url AS sample_source_url, @source_file AS source_file
            ) AS source
            ON target.alias_domain = source.alias_domain
            WHEN MATCHED THEN
              UPDATE SET
                last_seen_at = CURRENT_TIMESTAMP(),
                sample_source_url = source.sample_source_url,
                source_file = source.source_file,
                source_count = target.source_count + 1,
                status = IF(target.status = 'approved', target.status, 'pending_review')
            WHEN NOT MATCHED THEN
              INSERT (alias_domain, first_seen_at, last_seen_at, sample_source_url, source_file, source_count, status)
              VALUES (source.alias_domain, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), source.sample_source_url, source.source_file, 1, 'pending_review')
            """
            config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("alias_domain", "STRING", domain),
                    bigquery.ScalarQueryParameter("sample_source_url", "STRING", sample_url),
                    bigquery.ScalarQueryParameter("source_file", "STRING", source_file),
                ]
            )
            self.client.query(sql, job_config=config).result()
            merged += 1
        return merged

    def append_event_universe(
        self,
        event_ids: set[int],
        window_key: str,
        window_start: str,
        window_end: str,
        scope: str,
    ) -> int:
        existing_ids = self.event_ids_for_window(window_key, scope)
        new_event_ids = sorted(event_ids - existing_ids)
        if not new_event_ids:
            return 0
        now = datetime.now(timezone.utc).isoformat()
        rows = [
            {
                "window_key": window_key,
                "window_start": window_start,
                "window_end": window_end,
                "scope": scope,
                "global_event_id": event_id,
                "created_at": now,
            }
            for event_id in new_event_ids
        ]
        return self.load_rows(self.settings.datasets.ops, self.settings.event_universe_table, rows)

    def recent_event_ids(self, repair_window_hours: int) -> set[int]:
        sql = f"""
        SELECT DISTINCT global_event_id
        FROM `{self.table_ref(self.settings.datasets.ops, self.settings.event_universe_table)}`
        WHERE window_end >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL {repair_window_hours} HOUR)
        """
        return {int(row["global_event_id"]) for row in self.query_rows(sql)}

    def event_ids_for_window(self, window_key: str, scope: str) -> set[int]:
        from google.cloud import bigquery

        sql = f"""
        SELECT DISTINCT global_event_id
        FROM `{self.table_ref(self.settings.datasets.ops, self.settings.event_universe_table)}`
        WHERE window_key = @window_key AND scope = @scope
        """
        rows = self.query_rows(
            sql,
            [
                bigquery.ScalarQueryParameter("window_key", "STRING", window_key),
                bigquery.ScalarQueryParameter("scope", "STRING", scope),
            ],
        )
        return {int(row["global_event_id"]) for row in rows}

    def update_freshness_watermark(self, dataset_name: str, table_name: str, watermark_value: str) -> None:
        from google.cloud import bigquery

        table = self.table_ref(self.settings.datasets.ops, self.settings.freshness_table)
        sql = f"""
        MERGE `{table}` AS target
        USING (
          SELECT @dataset_name AS dataset_name, @table_name AS table_name, TIMESTAMP(@watermark_value) AS watermark_value
        ) AS source
        ON target.dataset_name = source.dataset_name AND target.table_name = source.table_name
        WHEN MATCHED THEN
          UPDATE SET watermark_value = source.watermark_value, updated_at = CURRENT_TIMESTAMP()
        WHEN NOT MATCHED THEN
          INSERT (dataset_name, table_name, watermark_value, updated_at)
          VALUES (source.dataset_name, source.table_name, source.watermark_value, CURRENT_TIMESTAMP())
        """
        config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("dataset_name", "STRING", dataset_name),
                bigquery.ScalarQueryParameter("table_name", "STRING", table_name),
                bigquery.ScalarQueryParameter("watermark_value", "STRING", watermark_value),
            ]
        )
        self.client.query(sql, job_config=config).result()

    def upsert_backfill_tracker(
        self,
        month_key: str,
        feed_type: str,
        status: str,
        range_start: str,
        range_end: str,
        rows_accepted: int,
        rows_rejected: int,
        discovered_domains: int,
    ) -> None:
        from google.cloud import bigquery

        table = self.table_ref(self.settings.datasets.ops, self.settings.backfill_tracker_table)
        sql = f"""
        MERGE `{table}` AS target
        USING (
          SELECT
            @month_key AS month_key,
            @feed_type AS feed_type,
            DATE(@range_start) AS range_start,
            DATE(@range_end) AS range_end,
            @status AS status,
            @rows_accepted AS rows_accepted,
            @rows_rejected AS rows_rejected,
            @discovered_domains AS discovered_domains
        ) AS source
        ON target.month_key = source.month_key AND target.feed_type = source.feed_type
        WHEN MATCHED THEN
          UPDATE SET
            status = source.status,
            rows_accepted = source.rows_accepted,
            rows_rejected = source.rows_rejected,
            discovered_domains = source.discovered_domains,
            completed_at = CURRENT_TIMESTAMP()
        WHEN NOT MATCHED THEN
          INSERT (month_key, feed_type, range_start, range_end, status, rows_accepted, rows_rejected, discovered_domains, started_at, completed_at)
          VALUES (source.month_key, source.feed_type, source.range_start, source.range_end, source.status, source.rows_accepted, source.rows_rejected, source.discovered_domains, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
        """
        config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("month_key", "STRING", month_key),
                bigquery.ScalarQueryParameter("feed_type", "STRING", feed_type),
                bigquery.ScalarQueryParameter("range_start", "STRING", range_start),
                bigquery.ScalarQueryParameter("range_end", "STRING", range_end),
                bigquery.ScalarQueryParameter("status", "STRING", status),
                bigquery.ScalarQueryParameter("rows_accepted", "INT64", rows_accepted),
                bigquery.ScalarQueryParameter("rows_rejected", "INT64", rows_rejected),
                bigquery.ScalarQueryParameter("discovered_domains", "INT64", discovered_domains),
            ]
        )
        self.client.query(sql, job_config=config).result()

    def record_job_start(
        self,
        job_name: str,
        request_id: str,
        summary: str,
        progress_total_steps: int | None = None,
        progress_message: str | None = None,
    ) -> None:
        from google.cloud import bigquery

        started_at = datetime.now(timezone.utc).isoformat()
        progress_step = 0

        runs_table = self.table_ref(self.settings.datasets.ops, "job_runs")
        runs_sql = f"""
        MERGE `{runs_table}` AS target
        USING (
          SELECT
            @job_name AS job_name,
            @request_id AS request_id,
            TIMESTAMP(@started_at) AS started_at,
            @summary AS summary,
            @progress_step AS progress_step,
            @progress_total_steps AS progress_total_steps,
            @progress_message AS progress_message
        ) AS source
        ON target.request_id = source.request_id
        WHEN MATCHED THEN
          UPDATE SET
            job_name = source.job_name,
            started_at = COALESCE(target.started_at, source.started_at),
            status = 'running',
            summary = source.summary,
            progress_step = source.progress_step,
            progress_total_steps = source.progress_total_steps,
            progress_message = source.progress_message,
            is_complete = FALSE
        WHEN NOT MATCHED THEN
          INSERT (job_name, request_id, started_at, finished_at, status, summary, payload_json, progress_step, progress_total_steps, progress_message, is_complete)
          VALUES (source.job_name, source.request_id, source.started_at, NULL, 'running', source.summary, NULL, source.progress_step, source.progress_total_steps, source.progress_message, FALSE)
        """
        runs_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("job_name", "STRING", job_name),
                bigquery.ScalarQueryParameter("request_id", "STRING", request_id),
                bigquery.ScalarQueryParameter("started_at", "STRING", started_at),
                bigquery.ScalarQueryParameter("summary", "STRING", summary),
                bigquery.ScalarQueryParameter("progress_step", "INT64", progress_step),
                bigquery.ScalarQueryParameter("progress_total_steps", "INT64", progress_total_steps),
                bigquery.ScalarQueryParameter("progress_message", "STRING", progress_message),
            ]
        )
        self.client.query(runs_sql, job_config=runs_config).result()

        status_table = self.table_ref(self.settings.datasets.ops, "job_status")
        status_sql = f"""
        MERGE `{status_table}` AS target
        USING (
          SELECT
            @job_name AS job_name,
            @request_id AS request_id,
            @summary AS summary,
            @progress_step AS progress_step,
            @progress_total_steps AS progress_total_steps,
            @progress_message AS progress_message
        ) AS source
        ON target.job_name = source.job_name
        WHEN MATCHED THEN
          UPDATE SET
            stale_after_minutes = {self.settings.job_stale_after_minutes},
            notes = source.summary,
            active_request_id = source.request_id,
            in_progress = TRUE,
            progress_step = source.progress_step,
            progress_total_steps = source.progress_total_steps,
            progress_message = source.progress_message,
            progress_updated_at = CURRENT_TIMESTAMP()
        WHEN NOT MATCHED THEN
          INSERT (job_name, last_success_at, last_error_at, stale_after_minutes, status, notes, active_request_id, in_progress, progress_step, progress_total_steps, progress_message, progress_updated_at)
          VALUES (source.job_name, NULL, NULL, {self.settings.job_stale_after_minutes}, 'healthy', source.summary, source.request_id, TRUE, source.progress_step, source.progress_total_steps, source.progress_message, CURRENT_TIMESTAMP())
        """
        status_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("job_name", "STRING", job_name),
                bigquery.ScalarQueryParameter("request_id", "STRING", request_id),
                bigquery.ScalarQueryParameter("summary", "STRING", summary),
                bigquery.ScalarQueryParameter("progress_step", "INT64", progress_step),
                bigquery.ScalarQueryParameter("progress_total_steps", "INT64", progress_total_steps),
                bigquery.ScalarQueryParameter("progress_message", "STRING", progress_message),
            ]
        )
        self.client.query(status_sql, job_config=status_config).result()

    def update_job_progress(
        self,
        job_name: str,
        request_id: str,
        progress_step: int,
        progress_total_steps: int,
        progress_message: str,
    ) -> None:
        from google.cloud import bigquery

        runs_table = self.table_ref(self.settings.datasets.ops, "job_runs")
        runs_sql = f"""
        MERGE `{runs_table}` AS target
        USING (
          SELECT
            @job_name AS job_name,
            @request_id AS request_id,
            @progress_step AS progress_step,
            @progress_total_steps AS progress_total_steps,
            @progress_message AS progress_message
        ) AS source
        ON target.request_id = source.request_id
        WHEN MATCHED THEN
          UPDATE SET
            status = IF(target.is_complete, target.status, 'running'),
            progress_step = source.progress_step,
            progress_total_steps = source.progress_total_steps,
            progress_message = source.progress_message,
            is_complete = FALSE
        WHEN NOT MATCHED THEN
          INSERT (job_name, request_id, started_at, finished_at, status, summary, payload_json, progress_step, progress_total_steps, progress_message, is_complete)
          VALUES (source.job_name, source.request_id, CURRENT_TIMESTAMP(), NULL, 'running', source.progress_message, NULL, source.progress_step, source.progress_total_steps, source.progress_message, FALSE)
        """
        runs_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("job_name", "STRING", job_name),
                bigquery.ScalarQueryParameter("request_id", "STRING", request_id),
                bigquery.ScalarQueryParameter("progress_step", "INT64", progress_step),
                bigquery.ScalarQueryParameter("progress_total_steps", "INT64", progress_total_steps),
                bigquery.ScalarQueryParameter("progress_message", "STRING", progress_message),
            ]
        )
        self.client.query(runs_sql, job_config=runs_config).result()

        status_table = self.table_ref(self.settings.datasets.ops, "job_status")
        status_sql = f"""
        MERGE `{status_table}` AS target
        USING (
          SELECT
            @job_name AS job_name,
            @request_id AS request_id,
            @progress_step AS progress_step,
            @progress_total_steps AS progress_total_steps,
            @progress_message AS progress_message
        ) AS source
        ON target.job_name = source.job_name
        WHEN MATCHED THEN
          UPDATE SET
            stale_after_minutes = {self.settings.job_stale_after_minutes},
            active_request_id = source.request_id,
            in_progress = TRUE,
            progress_step = source.progress_step,
            progress_total_steps = source.progress_total_steps,
            progress_message = source.progress_message,
            progress_updated_at = CURRENT_TIMESTAMP()
        WHEN NOT MATCHED THEN
          INSERT (job_name, last_success_at, last_error_at, stale_after_minutes, status, notes, active_request_id, in_progress, progress_step, progress_total_steps, progress_message, progress_updated_at)
          VALUES (source.job_name, NULL, NULL, {self.settings.job_stale_after_minutes}, 'healthy', source.progress_message, source.request_id, TRUE, source.progress_step, source.progress_total_steps, source.progress_message, CURRENT_TIMESTAMP())
        """
        status_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("job_name", "STRING", job_name),
                bigquery.ScalarQueryParameter("request_id", "STRING", request_id),
                bigquery.ScalarQueryParameter("progress_step", "INT64", progress_step),
                bigquery.ScalarQueryParameter("progress_total_steps", "INT64", progress_total_steps),
                bigquery.ScalarQueryParameter("progress_message", "STRING", progress_message),
            ]
        )
        self.client.query(status_sql, job_config=status_config).result()

    def record_job_result(self, result: JobResult) -> None:
        from google.cloud import bigquery

        started_at = result.started_at or datetime.now(timezone.utc).isoformat()
        finished_at = result.finished_at or datetime.now(timezone.utc).isoformat()
        payload_json = json.dumps(result.asdict(), sort_keys=True)

        runs_table = self.table_ref(self.settings.datasets.ops, "job_runs")
        runs_sql = f"""
        MERGE `{runs_table}` AS target
        USING (
          SELECT
            @job_name AS job_name,
            @request_id AS request_id,
            TIMESTAMP(@started_at) AS started_at,
            TIMESTAMP(@finished_at) AS finished_at,
            @status AS status,
            @summary AS summary,
            @payload_json AS payload_json
        ) AS source
        ON target.request_id = source.request_id
        WHEN MATCHED THEN
          UPDATE SET
            job_name = source.job_name,
            started_at = COALESCE(target.started_at, source.started_at),
            finished_at = source.finished_at,
            status = source.status,
            summary = source.summary,
            payload_json = source.payload_json,
            progress_step = COALESCE(target.progress_total_steps, target.progress_step),
            progress_total_steps = target.progress_total_steps,
            progress_message = IF(source.status = 'success', 'completed', 'failed'),
            is_complete = TRUE
        WHEN NOT MATCHED THEN
          INSERT (job_name, request_id, started_at, finished_at, status, summary, payload_json, progress_step, progress_total_steps, progress_message, is_complete)
          VALUES (source.job_name, source.request_id, source.started_at, source.finished_at, source.status, source.summary, source.payload_json, NULL, NULL, IF(source.status = 'success', 'completed', 'failed'), TRUE)
        """
        runs_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("job_name", "STRING", result.job_name),
                bigquery.ScalarQueryParameter("request_id", "STRING", result.request_id),
                bigquery.ScalarQueryParameter("started_at", "STRING", started_at),
                bigquery.ScalarQueryParameter("finished_at", "STRING", finished_at),
                bigquery.ScalarQueryParameter("status", "STRING", result.status),
                bigquery.ScalarQueryParameter("summary", "STRING", result.summary),
                bigquery.ScalarQueryParameter("payload_json", "STRING", payload_json),
            ]
        )
        self.client.query(runs_sql, job_config=runs_config).result()

        table = self.table_ref(self.settings.datasets.ops, "job_status")
        sql = f"""
        MERGE `{table}` AS target
        USING (
          SELECT @job_name AS job_name, @status AS status, TIMESTAMP(@finished_at) AS finished_at
        ) AS source
        ON target.job_name = source.job_name
        WHEN MATCHED THEN
          UPDATE SET
            last_success_at = IF(source.status = 'success', source.finished_at, target.last_success_at),
            last_error_at = IF(source.status = 'error', source.finished_at, target.last_error_at),
            stale_after_minutes = {self.settings.job_stale_after_minutes},
            status = IF(source.status = 'success', 'healthy', 'critical'),
            notes = @summary,
            active_request_id = NULL,
            in_progress = FALSE,
            progress_step = COALESCE(target.progress_total_steps, target.progress_step),
            progress_total_steps = target.progress_total_steps,
            progress_message = IF(source.status = 'success', 'completed', 'failed'),
            progress_updated_at = source.finished_at
        WHEN NOT MATCHED THEN
          INSERT (job_name, last_success_at, last_error_at, stale_after_minutes, status, notes, active_request_id, in_progress, progress_step, progress_total_steps, progress_message, progress_updated_at)
          VALUES (
            source.job_name,
            IF(source.status = 'success', source.finished_at, NULL),
            IF(source.status = 'error', source.finished_at, NULL),
            {self.settings.job_stale_after_minutes},
            IF(source.status = 'success', 'healthy', 'critical'),
            @summary,
            NULL,
            FALSE,
            NULL,
            NULL,
            IF(source.status = 'success', 'completed', 'failed'),
            source.finished_at
          )
        """
        config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("job_name", "STRING", result.job_name),
                bigquery.ScalarQueryParameter("status", "STRING", result.status),
                bigquery.ScalarQueryParameter("finished_at", "STRING", finished_at),
                bigquery.ScalarQueryParameter("summary", "STRING", result.summary),
            ]
        )
        self.client.query(sql, job_config=config).result()
