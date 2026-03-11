CREATE OR REPLACE TABLE `{{ project_id }}.{{ dataset_norm }}.mentions_ro`
PARTITION BY DATE(mention_time)
CLUSTER BY global_event_id, outlet_id AS
WITH alias_candidates AS (
  SELECT
    raw_mentions.*,
    aliases.outlet_id,
    ROW_NUMBER() OVER (
      PARTITION BY raw_mentions.source_file, raw_mentions.checksum, raw_mentions.global_event_id, raw_mentions.mention_time, raw_mentions.source_url
      ORDER BY LENGTH(aliases.alias_domain) DESC
    ) AS alias_rank
  FROM `{{ project_id }}.{{ dataset_raw }}.raw_mentions` raw_mentions
  JOIN `{{ project_id }}.{{ dataset_norm }}.{{ outlet_alias_table }}` aliases
    ON raw_mentions.source_domain = aliases.alias_domain
    OR ENDS_WITH(raw_mentions.source_domain, CONCAT('.', aliases.alias_domain))
  JOIN `{{ project_id }}.{{ dataset_norm }}.{{ outlet_registry_table }}` outlets
    ON aliases.outlet_id = outlets.outlet_id
  WHERE aliases.review_status = 'approved' AND outlets.status = 'active'
)
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
  outlet_id,
  source_url,
  confidence,
  mention_doc_tone
FROM alias_candidates
WHERE alias_rank = 1;

CREATE OR REPLACE TABLE `{{ project_id }}.{{ dataset_norm }}.gkg_ro`
PARTITION BY DATE(date)
CLUSTER BY outlet_id, source_domain AS
WITH alias_candidates AS (
  SELECT
    raw_gkg.*,
    aliases.outlet_id,
    ROW_NUMBER() OVER (
      PARTITION BY raw_gkg.source_file, raw_gkg.checksum, raw_gkg.gkg_record_id
      ORDER BY LENGTH(aliases.alias_domain) DESC
    ) AS alias_rank
  FROM `{{ project_id }}.{{ dataset_raw }}.raw_gkg` raw_gkg
  JOIN `{{ project_id }}.{{ dataset_norm }}.{{ outlet_alias_table }}` aliases
    ON raw_gkg.source_domain = aliases.alias_domain
    OR ENDS_WITH(raw_gkg.source_domain, CONCAT('.', aliases.alias_domain))
  JOIN `{{ project_id }}.{{ dataset_norm }}.{{ outlet_registry_table }}` outlets
    ON aliases.outlet_id = outlets.outlet_id
  WHERE aliases.review_status = 'approved' AND outlets.status = 'active'
)
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
  outlet_id,
  document_identifier,
  themes,
  persons,
  organizations,
  gcam,
  v2tone
FROM alias_candidates
WHERE alias_rank = 1;

CREATE OR REPLACE TABLE `{{ project_id }}.{{ dataset_norm }}.events_ro`
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
FROM `{{ project_id }}.{{ dataset_raw }}.raw_events`;
