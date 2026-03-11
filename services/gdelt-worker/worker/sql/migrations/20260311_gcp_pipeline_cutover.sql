-- Run this once during cutover after the new GCP pipeline assets are deployed.
-- Preserve these curated registry tables:
--   `{{ project_id }}.gdelt_norm.outlets_norm`
--   `{{ project_id }}.gdelt_norm.outlet_domain_aliases`

DROP TABLE IF EXISTS `{{ project_id }}.gdelt_raw.ingest_registry`;
DROP TABLE IF EXISTS `{{ project_id }}.gdelt_raw.raw_files`;
DROP TABLE IF EXISTS `{{ project_id }}.gdelt_raw.ingest_errors`;
DROP TABLE IF EXISTS `{{ project_id }}.gdelt_ops.backfill_tracker`;
DROP TABLE IF EXISTS `{{ project_id }}.gdelt_ops.outlet_discovery_queue`;
DROP TABLE IF EXISTS `{{ project_id }}.gdelt_ops.event_universe`;

TRUNCATE TABLE `{{ project_id }}.gdelt_raw.raw_mentions`;
TRUNCATE TABLE `{{ project_id }}.gdelt_raw.raw_gkg`;
TRUNCATE TABLE `{{ project_id }}.gdelt_raw.raw_events`;
TRUNCATE TABLE `{{ project_id }}.gdelt_norm.mentions_ro`;
TRUNCATE TABLE `{{ project_id }}.gdelt_norm.gkg_ro`;
TRUNCATE TABLE `{{ project_id }}.gdelt_norm.events_ro`;
TRUNCATE TABLE `{{ project_id }}.gdelt_norm.entities_norm`;
TRUNCATE TABLE `{{ project_id }}.gdelt_norm.theme_maps`;
TRUNCATE TABLE `{{ project_id }}.gdelt_derived.coverage_episodes`;
TRUNCATE TABLE `{{ project_id }}.gdelt_derived.event_clusters`;
TRUNCATE TABLE `{{ project_id }}.gdelt_derived.outlet_metrics_daily`;
TRUNCATE TABLE `{{ project_id }}.gdelt_derived.outlet_metrics_monthly`;
TRUNCATE TABLE `{{ project_id }}.gdelt_derived.entity_metrics_daily`;
TRUNCATE TABLE `{{ project_id }}.gdelt_derived.entity_metrics_monthly`;
TRUNCATE TABLE `{{ project_id }}.gdelt_derived.theme_metrics_monthly`;
TRUNCATE TABLE `{{ project_id }}.gdelt_derived.propagation_edges`;
TRUNCATE TABLE `{{ project_id }}.gdelt_derived.ghosting_flags`;
TRUNCATE TABLE `{{ project_id }}.gdelt_derived.divergence_flags`;
TRUNCATE TABLE `{{ project_id }}.gdelt_derived.local_vs_national_monthly`;
TRUNCATE TABLE `{{ project_id }}.gdelt_derived.seasonality_rollups`;
TRUNCATE TABLE `{{ project_id }}.gdelt_serving.overview_current`;
TRUNCATE TABLE `{{ project_id }}.gdelt_serving.top_events_current`;
TRUNCATE TABLE `{{ project_id }}.gdelt_serving.top_entities_current`;
TRUNCATE TABLE `{{ project_id }}.gdelt_serving.morning_brief_candidates`;
TRUNCATE TABLE `{{ project_id }}.gdelt_serving.outlet_compare_cache`;
TRUNCATE TABLE `{{ project_id }}.gdelt_serving.outlet_detail_cache`;
TRUNCATE TABLE `{{ project_id }}.gdelt_serving.entity_trend_cache`;
TRUNCATE TABLE `{{ project_id }}.gdelt_serving.status_summary`;
TRUNCATE TABLE `{{ project_id }}.gdelt_ops.job_runs`;
TRUNCATE TABLE `{{ project_id }}.gdelt_ops.job_status`;
TRUNCATE TABLE `{{ project_id }}.gdelt_ops.backfill_runs`;
TRUNCATE TABLE `{{ project_id }}.gdelt_ops.backfill_steps`;
TRUNCATE TABLE `{{ project_id }}.gdelt_ops.file_manifest`;
TRUNCATE TABLE `{{ project_id }}.gdelt_ops.file_manifest_buffer`;
TRUNCATE TABLE `{{ project_id }}.gdelt_ops.load_audit`;
TRUNCATE TABLE `{{ project_id }}.gdelt_ops.domain_review_queue`;
TRUNCATE TABLE `{{ project_id }}.gdelt_ops.freshness_watermarks`;
TRUNCATE TABLE `{{ project_id }}.gdelt_stage.stage_mentions`;
TRUNCATE TABLE `{{ project_id }}.gdelt_stage.stage_gkg`;
TRUNCATE TABLE `{{ project_id }}.gdelt_stage.stage_events`;
