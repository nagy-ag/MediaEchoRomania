from __future__ import annotations

from worker.config import Settings


def table(project_id: str, dataset: str, name: str) -> str:
    return f"`{project_id}.{dataset}.{name}`"


def build_create_or_replace_table_sql(
    project_id: str,
    dataset: str,
    table_name: str,
    select_sql: str,
    *,
    partition_by: str | None = None,
    cluster_by: str | None = None,
) -> str:
    statements = [f"CREATE OR REPLACE TABLE {table(project_id, dataset, table_name)}"]
    if partition_by:
        statements.append(f"PARTITION BY {partition_by}")
    if cluster_by:
        statements.append(f"CLUSTER BY {cluster_by}")
    statements.append(f"AS\n{select_sql.strip()}")
    return "\n".join(statements)


def normalization_queries(settings: Settings) -> list[tuple[str, str]]:
    project = settings.gcp_project_id
    raw = settings.datasets.raw
    norm = settings.datasets.norm
    ops = settings.datasets.ops
    alias_table = table(project, norm, settings.outlet_alias_table)
    outlet_table = table(project, norm, settings.outlet_registry_table)
    event_universe_table = table(project, ops, settings.event_universe_table)
    return [
        (
            "mentions_ro",
            f"""
            CREATE OR REPLACE TABLE {table(project, norm, 'mentions_ro')}
            PARTITION BY DATE(mention_time)
            CLUSTER BY global_event_id, outlet_id AS
            SELECT
              CONCAT(source_file, ':', CAST(global_event_id AS STRING), ':', FORMAT_TIMESTAMP('%Y%m%d%H%M%S', mention_time), ':', source_url) AS mention_row_id,
              source_file,
              checksum,
              published_at,
              ingested_at,
              global_event_id,
              mention_time,
              mention_type,
              source_name,
              source_domain,
              aliases.outlet_id,
              source_url,
              confidence,
              mention_doc_tone
            FROM {table(project, raw, 'raw_mentions')} raw_mentions
            JOIN {alias_table} aliases ON raw_mentions.source_domain = aliases.alias_domain
            JOIN {outlet_table} outlets ON aliases.outlet_id = outlets.outlet_id
            WHERE aliases.review_status = 'approved' AND outlets.status = 'active'
            """,
        ),
        (
            "gkg_ro",
            f"""
            CREATE OR REPLACE TABLE {table(project, norm, 'gkg_ro')}
            PARTITION BY DATE(date)
            CLUSTER BY outlet_id, source_domain AS
            SELECT
              CONCAT(source_file, ':', gkg_record_id) AS gkg_row_id,
              source_file,
              checksum,
              published_at,
              ingested_at,
              gkg_record_id,
              date,
              source_common_name,
              source_domain,
              aliases.outlet_id,
              document_identifier,
              themes,
              persons,
              organizations,
              gcam,
              v2tone
            FROM {table(project, raw, 'raw_gkg')} raw_gkg
            JOIN {alias_table} aliases ON raw_gkg.source_domain = aliases.alias_domain
            JOIN {outlet_table} outlets ON aliases.outlet_id = outlets.outlet_id
            WHERE aliases.review_status = 'approved' AND outlets.status = 'active'
            """,
        ),
        (
            "events_ro",
            f"""
            CREATE OR REPLACE TABLE {table(project, norm, 'events_ro')}
            PARTITION BY event_date
            CLUSTER BY global_event_id, event_root_code AS
            SELECT
              CONCAT(source_file, ':', CAST(global_event_id AS STRING)) AS event_row_id,
              source_file,
              checksum,
              published_at,
              ingested_at,
              global_event_id,
              sql_date AS event_date,
              event_root_code,
              action_geo_country_code,
              goldstein_scale,
              avg_tone,
              source_url
            FROM {table(project, raw, 'raw_events')} raw_events
            WHERE global_event_id IN (SELECT DISTINCT global_event_id FROM {event_universe_table})
            """,
        ),
    ]


def derived_queries(settings: Settings) -> list[tuple[str, str]]:
    project = settings.gcp_project_id
    norm = settings.datasets.norm
    derived = settings.datasets.derived
    article_context = f"""
    WITH article_context AS (
      SELECT DISTINCT
        mentions.global_event_id,
        mentions.outlet_id,
        mentions.mention_time,
        mentions.source_url,
        gkg.document_identifier,
        gkg.themes,
        gkg.persons,
        gkg.organizations,
        SAFE_CAST(SPLIT(gkg.v2tone, ',')[SAFE_OFFSET(0)] AS FLOAT64) AS tone_value
      FROM {table(project, norm, 'mentions_ro')} mentions
      LEFT JOIN {table(project, norm, 'gkg_ro')} gkg
        ON mentions.source_url = gkg.document_identifier AND mentions.outlet_id = gkg.outlet_id
    )
    """
    return [
        (
            "coverage_episodes",
            build_create_or_replace_table_sql(
                project,
                derived,
                "coverage_episodes",
                f"""
                WITH first_mentions AS (
                  SELECT global_event_id, MIN(mention_time) AS event_first_mention_at
                  FROM {table(project, norm, 'mentions_ro')}
                  GROUP BY global_event_id
                )
                SELECT
                  CONCAT(CAST(mentions.global_event_id AS STRING), ':', mentions.outlet_id) AS episode_id,
                  CAST(mentions.global_event_id AS STRING) AS cluster_id,
                  mentions.outlet_id,
                  MIN(mentions.mention_time) AS first_mention_at,
                  MAX(mentions.mention_time) AS last_mention_at,
                  TIMESTAMP_DIFF(MIN(mentions.mention_time), first_mentions.event_first_mention_at, MINUTE) AS lag_minutes,
                  GREATEST(0.0, 100.0 - LEAST(TIMESTAMP_DIFF(MIN(mentions.mention_time), first_mentions.event_first_mention_at, MINUTE), 600) / 6.0) AS speed_score,
                  GREATEST(0.0, 100.0 - LEAST(ABS(COUNT(*) - 3) * 10.0, 80.0)) AS stability_score
                FROM {table(project, norm, 'mentions_ro')} mentions
                JOIN first_mentions ON mentions.global_event_id = first_mentions.global_event_id
                GROUP BY mentions.global_event_id, mentions.outlet_id, first_mentions.event_first_mention_at
                """,
                partition_by="DATE(first_mention_at)",
                cluster_by="cluster_id, outlet_id",
            ),
        ),
        (
            "event_clusters",
            build_create_or_replace_table_sql(
                project,
                derived,
                "event_clusters",
                f"""
                {article_context}
                , theme_entities AS (
                  SELECT
                    global_event_id,
                    ARRAY_AGG(DISTINCT NULLIF(TRIM(SPLIT(theme_item, ',')[SAFE_OFFSET(0)]), '') IGNORE NULLS LIMIT 5) AS key_themes,
                    ARRAY_AGG(DISTINCT NULLIF(TRIM(entity_item), '') IGNORE NULLS LIMIT 5) AS primary_entities,
                    AVG(tone_value) AS avg_tone,
                    STDDEV_POP(tone_value) AS tone_stddev
                  FROM (
                    SELECT global_event_id, tone_value, theme_item, entity_item
                    FROM article_context
                    LEFT JOIN UNNEST(SPLIT(COALESCE(themes, ''), ';')) AS theme_item
                    LEFT JOIN UNNEST(ARRAY_CONCAT(SPLIT(COALESCE(persons, ''), ';'), SPLIT(COALESCE(organizations, ''), ';'))) AS entity_item
                  )
                  GROUP BY global_event_id
                ),
                outlet_summary AS (
                  SELECT
                    cluster_id,
                    COUNT(DISTINCT outlet_id) AS active_outlets,
                    AVG(speed_score) AS speed_score,
                    AVG(stability_score) AS stability_score,
                    MIN(first_mention_at) AS first_seen_at,
                    MAX(last_mention_at) AS last_seen_at,
                    ARRAY_AGG(outlet_id ORDER BY speed_score DESC LIMIT 5) AS top_outlets
                  FROM {table(project, derived, 'coverage_episodes')}
                  GROUP BY cluster_id
                )
                SELECT
                  outlet_summary.cluster_id,
                  SAFE_CAST(outlet_summary.cluster_id AS INT64) AS global_event_id,
                  COALESCE(ARRAY_TO_STRING(theme_entities.key_themes, ', '), CONCAT('Event ', outlet_summary.cluster_id)) AS cluster_label,
                  outlet_summary.first_seen_at,
                  outlet_summary.last_seen_at,
                  (outlet_summary.active_outlets * 10.0) + COALESCE(ABS(theme_entities.avg_tone), 0.0) AS salience_score,
                  outlet_summary.active_outlets,
                  outlet_summary.speed_score,
                  outlet_summary.stability_score,
                  LEAST(COALESCE(theme_entities.tone_stddev, 0.0) * 10.0, 100.0) AS divergence_score,
                  GREATEST(0.0, 100.0 - (outlet_summary.active_outlets * 3.0)) AS ghosting_score,
                  COALESCE(theme_entities.primary_entities, []) AS primary_entities,
                  COALESCE(outlet_summary.top_outlets, []) AS top_outlets,
                  COALESCE(theme_entities.key_themes, []) AS key_themes,
                  CURRENT_TIMESTAMP() AS generated_at,
                  'derived from mentions coverage episodes and matched GKG article context' AS confidence_notes
                FROM outlet_summary
                LEFT JOIN theme_entities ON SAFE_CAST(outlet_summary.cluster_id AS INT64) = theme_entities.global_event_id
                """,
                cluster_by="cluster_id",
            ),
        ),
        (
            "outlet_metrics_daily",
            build_create_or_replace_table_sql(
                project,
                derived,
                "outlet_metrics_daily",
                f"""
                SELECT
                  DATE(first_mention_at) AS metric_date,
                  coverage.outlet_id,
                  COUNT(*) AS event_count,
                  AVG(coverage.speed_score) AS avg_speed,
                  AVG(coverage.stability_score) AS avg_stability,
                  AVG(clusters.ghosting_score) AS avg_ghosting,
                  AVG(clusters.divergence_score) AS avg_divergence
                FROM {table(project, derived, 'coverage_episodes')} coverage
                JOIN {table(project, derived, 'event_clusters')} clusters ON coverage.cluster_id = clusters.cluster_id
                GROUP BY metric_date, coverage.outlet_id
                """,
                partition_by="metric_date",
                cluster_by="outlet_id",
            ),
        ),
        (
            "outlet_metrics_monthly",
            build_create_or_replace_table_sql(
                project,
                derived,
                "outlet_metrics_monthly",
                f"""
                SELECT
                  DATE_TRUNC(metric_date, MONTH) AS metric_month,
                  outlet_id,
                  SUM(event_count) AS event_count,
                  AVG(avg_speed) AS avg_speed,
                  AVG(avg_stability) AS avg_stability,
                  AVG(avg_ghosting) AS avg_ghosting,
                  AVG(avg_divergence) AS avg_divergence
                FROM {table(project, derived, 'outlet_metrics_daily')}
                GROUP BY metric_month, outlet_id
                """,
                cluster_by="outlet_id",
            ),
        ),
        (
            "entity_metrics_daily",
            build_create_or_replace_table_sql(
                project,
                derived,
                "entity_metrics_daily",
                f"""
                {article_context}
                SELECT
                  DATE(mention_time) AS metric_date,
                  TRIM(entity_item) AS entity_label,
                  COUNT(*) AS mention_count,
                  AVG(tone_value) AS avg_tone
                FROM article_context, UNNEST(ARRAY_CONCAT(SPLIT(COALESCE(persons, ''), ';'), SPLIT(COALESCE(organizations, ''), ';'))) AS entity_item
                WHERE TRIM(entity_item) != ''
                GROUP BY metric_date, entity_label
                """,
                partition_by="metric_date",
                cluster_by="entity_label",
            ),
        ),
        (
            "entity_metrics_monthly",
            build_create_or_replace_table_sql(
                project,
                derived,
                "entity_metrics_monthly",
                f"""
                SELECT
                  DATE_TRUNC(metric_date, MONTH) AS metric_month,
                  entity_label,
                  SUM(mention_count) AS mention_count,
                  AVG(avg_tone) AS avg_tone
                FROM {table(project, derived, 'entity_metrics_daily')}
                GROUP BY metric_month, entity_label
                """,
                cluster_by="entity_label",
            ),
        ),
        (
            "theme_metrics_monthly",
            build_create_or_replace_table_sql(
                project,
                derived,
                "theme_metrics_monthly",
                f"""
                {article_context}
                SELECT
                  DATE_TRUNC(DATE(mention_time), MONTH) AS metric_month,
                  TRIM(SPLIT(theme_item, ',')[SAFE_OFFSET(0)]) AS theme_label,
                  COUNT(*) AS mention_count,
                  AVG(tone_value) AS avg_tone
                FROM article_context, UNNEST(SPLIT(COALESCE(themes, ''), ';')) AS theme_item
                WHERE TRIM(theme_item) != ''
                GROUP BY metric_month, theme_label
                """,
                cluster_by="theme_label",
            ),
        ),
        (
            "propagation_edges",
            build_create_or_replace_table_sql(
                project,
                derived,
                "propagation_edges",
                f"""
                WITH ranked AS (
                  SELECT
                    global_event_id,
                    outlet_id,
                    MIN(mention_time) AS first_mention_at
                  FROM {table(project, norm, 'mentions_ro')}
                  GROUP BY global_event_id, outlet_id
                ),
                ordered AS (
                  SELECT
                    global_event_id,
                    outlet_id AS source_outlet_id,
                    LEAD(outlet_id) OVER (PARTITION BY global_event_id ORDER BY first_mention_at) AS target_outlet_id,
                    first_mention_at,
                    LEAD(first_mention_at) OVER (PARTITION BY global_event_id ORDER BY first_mention_at) AS target_mention_at
                  FROM ranked
                )
                SELECT
                  CONCAT(CAST(global_event_id AS STRING), ':', source_outlet_id, ':', target_outlet_id) AS edge_id,
                  CAST(global_event_id AS STRING) AS cluster_id,
                  source_outlet_id,
                  target_outlet_id,
                  TIMESTAMP_DIFF(target_mention_at, first_mention_at, MINUTE) AS lag_minutes,
                  CURRENT_TIMESTAMP() AS generated_at
                FROM ordered
                WHERE target_outlet_id IS NOT NULL
                """,
                cluster_by="cluster_id",
            ),
        ),
        (
            "ghosting_flags",
            build_create_or_replace_table_sql(
                project,
                derived,
                "ghosting_flags",
                f"""
                SELECT
                  CONCAT(clusters.cluster_id, ':', outlets.outlet_id) AS ghosting_flag_id,
                  clusters.cluster_id,
                  outlets.outlet_id,
                  clusters.ghosting_score AS ghosting_score,
                  CURRENT_TIMESTAMP() AS generated_at
                FROM {table(project, derived, 'event_clusters')} clusters
                CROSS JOIN {table(project, settings.datasets.norm, settings.outlet_registry_table)} outlets
                LEFT JOIN {table(project, derived, 'coverage_episodes')} coverage
                  ON coverage.cluster_id = clusters.cluster_id AND coverage.outlet_id = outlets.outlet_id
                WHERE clusters.active_outlets >= 3 AND outlets.status = 'active' AND coverage.outlet_id IS NULL
                """,
                cluster_by="cluster_id, outlet_id",
            ),
        ),
        (
            "divergence_flags",
            build_create_or_replace_table_sql(
                project,
                derived,
                "divergence_flags",
                f"""
                SELECT
                  CONCAT(cluster_id, ':divergence') AS divergence_flag_id,
                  cluster_id,
                  divergence_score,
                  CURRENT_TIMESTAMP() AS generated_at
                FROM {table(project, derived, 'event_clusters')}
                WHERE divergence_score >= 15.0
                """,
                cluster_by="cluster_id",
            ),
        ),
        (
            "local_vs_national_monthly",
            build_create_or_replace_table_sql(
                project,
                derived,
                "local_vs_national_monthly",
                f"""
                SELECT
                  metrics.metric_month,
                  IF(outlets.is_local, 'local', 'national') AS outlet_scope,
                  SUM(metrics.event_count) AS event_count,
                  AVG(metrics.avg_speed) AS avg_speed,
                  AVG(metrics.avg_stability) AS avg_stability,
                  AVG(metrics.avg_ghosting) AS avg_ghosting
                FROM {table(project, derived, 'outlet_metrics_monthly')} metrics
                JOIN {table(project, settings.datasets.norm, settings.outlet_registry_table)} outlets ON metrics.outlet_id = outlets.outlet_id
                GROUP BY metrics.metric_month, outlet_scope
                """,
                cluster_by="outlet_scope",
            ),
        ),
        (
            "seasonality_rollups",
            build_create_or_replace_table_sql(
                project,
                derived,
                "seasonality_rollups",
                f"""
                SELECT
                  EXTRACT(MONTH FROM metric_month) AS month_of_year,
                  theme_label,
                  AVG(mention_count) AS avg_mentions,
                  AVG(avg_tone) AS avg_tone
                FROM {table(project, derived, 'theme_metrics_monthly')}
                GROUP BY month_of_year, theme_label
                """,
                cluster_by="month_of_year, theme_label",
            ),
        ),
    ]