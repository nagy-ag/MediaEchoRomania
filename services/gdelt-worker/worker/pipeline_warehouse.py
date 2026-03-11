from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from uuid import uuid4

from worker.bigquery_service import BigQueryService
from worker.config import Settings
from worker.gdelt import source_file_from_url
from worker.models import FeedType, JobResult, MasterfileEntry

SCRIPT_DIR = Path(__file__).resolve().parent / "sql" / "scripts"


class PipelineWarehouse:
    def __init__(self, settings: Settings, warehouse: BigQueryService | None = None) -> None:
        self.settings = settings
        self.warehouse = warehouse or BigQueryService(settings)

    def ensure_pipeline_assets(self) -> None:
        self.warehouse.ensure_warehouse()

    def _render_sql(self, path: Path, extra_replacements: dict[str, str] | None = None) -> str:
        replacements = {
            "dataset_stage": self.settings.datasets.stage,
            "dataset_raw": self.settings.datasets.raw,
            "dataset_norm": self.settings.datasets.norm,
            "dataset_derived": self.settings.datasets.derived,
            "dataset_serving": self.settings.datasets.serving,
            "dataset_ops": self.settings.datasets.ops,
            "outlet_alias_table": self.settings.outlet_alias_table,
            "outlet_registry_table": self.settings.outlet_registry_table,
            "domain_review_table": self.settings.domain_review_table,
        }
        if extra_replacements:
            replacements.update(extra_replacements)
        return self.warehouse._render_template(path.read_text(encoding="utf-8"), replacements)

    def run_script(self, script_name: str, extra_replacements: dict[str, str] | None = None) -> None:
        sql = self._render_sql(SCRIPT_DIR / script_name, extra_replacements)
        self.warehouse.run_sql(sql)

    def merge_file_manifest_entries(self, entries: Iterable[MasterfileEntry]) -> int:
        rows = []
        now = datetime.now(timezone.utc).isoformat()
        for entry in entries:
            rows.append(
                {
                    "source_file": source_file_from_url(entry.url),
                    "feed_type": entry.feed_type,
                    "published_at": entry.published_at.isoformat(),
                    "size_bytes": entry.size_bytes,
                    "source_url": entry.url,
                    "source_checksum": entry.source_checksum,
                    "first_seen_at": now,
                    "last_seen_at": now,
                }
            )
        if not rows:
            return 0
        self.warehouse.load_rows(self.settings.datasets.ops, self.settings.file_manifest_buffer_table, rows, write_disposition="WRITE_TRUNCATE")
        sql = f"""
        MERGE `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.file_manifest_table}` target
        USING `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.file_manifest_buffer_table}` source
        ON target.source_file = source.source_file AND target.source_checksum = source.source_checksum
        WHEN MATCHED THEN
          UPDATE SET
            size_bytes = source.size_bytes,
            source_url = source.source_url,
            last_seen_at = source.last_seen_at
        WHEN NOT MATCHED THEN
          INSERT (source_file, feed_type, published_at, size_bytes, source_url, source_checksum, staged_uri, stage_status, load_status, scoped_status, row_count, first_seen_at, last_seen_at, staged_at, loaded_at, scoped_at, last_error_at, last_error_message)
          VALUES (source.source_file, source.feed_type, source.published_at, source.size_bytes, source.source_url, source.source_checksum, NULL, 'pending', 'pending', 'pending', 0, source.first_seen_at, source.last_seen_at, NULL, NULL, NULL, NULL, NULL)
        """
        self.warehouse.run_sql(sql)
        return len(rows)

    def list_manifest_entries(self, start_ts: datetime, end_ts: datetime, *, feed_type: FeedType | None = None) -> list[dict[str, Any]]:
        feed_filter = "" if not feed_type else f"AND feed_type = '{feed_type}'"
        sql = f"""
        SELECT source_file, feed_type, published_at, size_bytes, source_url, source_checksum, staged_uri, stage_status, load_status, scoped_status, row_count
        FROM `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.file_manifest_table}`
        WHERE published_at >= TIMESTAMP('{start_ts.isoformat()}')
          AND published_at <= TIMESTAMP('{end_ts.isoformat()}')
          {feed_filter}
        ORDER BY published_at ASC, feed_type ASC
        """
        return self.warehouse.query_rows(sql)

    def mark_manifest_staged(self, source_file: str, checksum: str, staged_uri: str, row_count: int) -> None:
        sql = f"""
        UPDATE `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.file_manifest_table}`
        SET staged_uri = @staged_uri,
            stage_status = 'staged',
            row_count = @row_count,
            staged_at = CURRENT_TIMESTAMP(),
            last_error_at = NULL,
            last_error_message = NULL
        WHERE source_file = @source_file AND source_checksum = @checksum
        """
        from google.cloud import bigquery

        config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("staged_uri", "STRING", staged_uri),
                bigquery.ScalarQueryParameter("row_count", "INT64", row_count),
                bigquery.ScalarQueryParameter("source_file", "STRING", source_file),
                bigquery.ScalarQueryParameter("checksum", "STRING", checksum),
            ]
        )
        self.warehouse.client.query(sql, job_config=config).result()

    def mark_manifest_loaded(self, source_files: Iterable[str], checksum: str | None = None) -> None:
        files = sorted(set(source_files))
        if not files:
            return
        checksum_filter = "" if checksum is None else "AND source_checksum = @checksum"
        sql = f"""
        UPDATE `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.file_manifest_table}`
        SET load_status = 'loaded',
            loaded_at = CURRENT_TIMESTAMP(),
            last_error_at = NULL,
            last_error_message = NULL
        WHERE source_file IN UNNEST(@source_files)
          {checksum_filter}
        """
        from google.cloud import bigquery

        params: list[Any] = [bigquery.ArrayQueryParameter("source_files", "STRING", files)]
        if checksum is not None:
            params.append(bigquery.ScalarQueryParameter("checksum", "STRING", checksum))
        config = bigquery.QueryJobConfig(query_parameters=params)
        self.warehouse.client.query(sql, job_config=config).result()

    def mark_manifest_scoped(self, start_ts: datetime, end_ts: datetime) -> None:
        sql = f"""
        UPDATE `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.file_manifest_table}`
        SET scoped_status = 'scoped',
            scoped_at = CURRENT_TIMESTAMP()
        WHERE published_at >= TIMESTAMP('{start_ts.isoformat()}')
          AND published_at <= TIMESTAMP('{end_ts.isoformat()}')
          AND load_status = 'loaded'
        """
        self.warehouse.run_sql(sql)

    def mark_manifest_error(self, source_file: str, checksum: str, error_message: str) -> None:
        sql = f"""
        UPDATE `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.file_manifest_table}`
        SET stage_status = 'error',
            last_error_at = CURRENT_TIMESTAMP(),
            last_error_message = @error_message
        WHERE source_file = @source_file AND source_checksum = @checksum
        """
        from google.cloud import bigquery

        config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("error_message", "STRING", error_message),
                bigquery.ScalarQueryParameter("source_file", "STRING", source_file),
                bigquery.ScalarQueryParameter("checksum", "STRING", checksum),
            ]
        )
        self.warehouse.client.query(sql, job_config=config).result()

    def load_stage_uris(self, feed_type: FeedType, uris: list[str]) -> int:
        if not uris:
            return 0
        from google.cloud import bigquery

        job_config = bigquery.LoadJobConfig(
            source_format=bigquery.SourceFormat.CSV,
            field_delimiter='\t',
            write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
            skip_leading_rows=0,
        )
        target = f"{self.settings.gcp_project_id}.{self.settings.datasets.stage}.stage_{feed_type}"
        self.warehouse.client.load_table_from_uri(uris, target, job_config=job_config).result()
        return len(uris)

    def record_load_audit(self, run_id: str, scope: str, feed_type: FeedType, batch_key: str, uri_count: int, rows_loaded: int, rows_rejected: int, status: str, summary: str) -> None:
        self.warehouse.load_rows(
            self.settings.datasets.ops,
            self.settings.load_audit_table,
            [
                {
                    "audit_id": f"load-audit-{uuid4()}",
                    "run_id": run_id,
                    "scope": scope,
                    "feed_type": feed_type,
                    "batch_key": batch_key,
                    "uri_count": uri_count,
                    "rows_loaded": rows_loaded,
                    "rows_rejected": rows_rejected,
                    "started_at": datetime.now(timezone.utc).isoformat(),
                    "finished_at": datetime.now(timezone.utc).isoformat(),
                    "status": status,
                    "summary": summary,
                }
            ],
        )

    def start_backfill_run(self, run_id: str, scope: str, requested_start: datetime, requested_end: datetime, months_total: int, batch_granularity: str) -> None:
        self.warehouse.load_rows(
            self.settings.datasets.ops,
            self.settings.backfill_runs_table,
            [
                {
                    "run_id": run_id,
                    "scope": scope,
                    "requested_start": requested_start.isoformat(),
                    "requested_end": requested_end.isoformat(),
                    "status": "running",
                    "batch_granularity": batch_granularity,
                    "months_total": months_total,
                    "months_completed": 0,
                    "files_total": 0,
                    "files_completed": 0,
                    "rows_loaded": 0,
                    "rows_rejected": 0,
                    "started_at": datetime.now(timezone.utc).isoformat(),
                    "finished_at": None,
                    "summary": "Pipeline initialized and waiting for staged files.",
                }
            ],
        )

    def upsert_backfill_step(self, run_id: str, step_id: str, scope: str, step_kind: str, month_key: str, feed_type: str, range_start: datetime, range_end: datetime, status: str, files_total: int, files_completed: int, rows_loaded: int, rows_rejected: int, summary: str) -> None:
        sql = f"""
        MERGE `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.backfill_steps_table}` target
        USING (
          SELECT @run_id AS run_id, @step_id AS step_id, @scope AS scope, @step_kind AS step_kind, @month_key AS month_key, @feed_type AS feed_type,
                 TIMESTAMP(@range_start) AS range_start, TIMESTAMP(@range_end) AS range_end, @status AS status,
                 @files_total AS files_total, @files_completed AS files_completed, @rows_loaded AS rows_loaded, @rows_rejected AS rows_rejected,
                 @summary AS summary
        ) source
        ON target.step_id = source.step_id
        WHEN MATCHED THEN
          UPDATE SET status = source.status, files_total = source.files_total, files_completed = source.files_completed,
                     rows_loaded = source.rows_loaded, rows_rejected = source.rows_rejected, finished_at = CURRENT_TIMESTAMP(), summary = source.summary
        WHEN NOT MATCHED THEN
          INSERT (run_id, step_id, scope, step_kind, month_key, feed_type, range_start, range_end, status, files_total, files_completed, rows_loaded, rows_rejected, started_at, finished_at, summary)
          VALUES (source.run_id, source.step_id, source.scope, source.step_kind, source.month_key, source.feed_type, source.range_start, source.range_end, source.status, source.files_total, source.files_completed, source.rows_loaded, source.rows_rejected, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), source.summary)
        """
        from google.cloud import bigquery

        config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("run_id", "STRING", run_id),
                bigquery.ScalarQueryParameter("step_id", "STRING", step_id),
                bigquery.ScalarQueryParameter("scope", "STRING", scope),
                bigquery.ScalarQueryParameter("step_kind", "STRING", step_kind),
                bigquery.ScalarQueryParameter("month_key", "STRING", month_key),
                bigquery.ScalarQueryParameter("feed_type", "STRING", feed_type),
                bigquery.ScalarQueryParameter("range_start", "STRING", range_start.isoformat()),
                bigquery.ScalarQueryParameter("range_end", "STRING", range_end.isoformat()),
                bigquery.ScalarQueryParameter("status", "STRING", status),
                bigquery.ScalarQueryParameter("files_total", "INT64", files_total),
                bigquery.ScalarQueryParameter("files_completed", "INT64", files_completed),
                bigquery.ScalarQueryParameter("rows_loaded", "INT64", rows_loaded),
                bigquery.ScalarQueryParameter("rows_rejected", "INT64", rows_rejected),
                bigquery.ScalarQueryParameter("summary", "STRING", summary),
            ]
        )
        self.warehouse.client.query(sql, job_config=config).result()

    def finalize_backfill_run(self, run_id: str, status: str, summary: str) -> None:
        sql = f"""
        UPDATE `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.backfill_runs_table}` run
        SET months_completed = (SELECT COUNT(*) FROM `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.backfill_steps_table}` steps WHERE steps.run_id = run.run_id AND steps.status = 'success'),
            files_total = (SELECT COALESCE(SUM(files_total), 0) FROM `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.backfill_steps_table}` steps WHERE steps.run_id = run.run_id),
            files_completed = (SELECT COALESCE(SUM(files_completed), 0) FROM `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.backfill_steps_table}` steps WHERE steps.run_id = run.run_id),
            rows_loaded = (SELECT COALESCE(SUM(rows_loaded), 0) FROM `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.backfill_steps_table}` steps WHERE steps.run_id = run.run_id),
            rows_rejected = (SELECT COALESCE(SUM(rows_rejected), 0) FROM `{self.settings.gcp_project_id}.{self.settings.datasets.ops}.{self.settings.backfill_steps_table}` steps WHERE steps.run_id = run.run_id),
            status = @status,
            finished_at = CURRENT_TIMESTAMP(),
            summary = @summary
        WHERE run_id = @run_id
        """
        from google.cloud import bigquery

        config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("status", "STRING", status),
                bigquery.ScalarQueryParameter("summary", "STRING", summary),
                bigquery.ScalarQueryParameter("run_id", "STRING", run_id),
            ]
        )
        self.warehouse.client.query(sql, job_config=config).result()
