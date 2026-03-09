CREATE SCHEMA IF NOT EXISTS `{{ project_id }}.gdelt_norm`;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_norm.outlets_norm` (
  outlet_id STRING,
  canonical_domain STRING,
  canonical_name STRING,
  is_romanian BOOL,
  is_local BOOL,
  is_national BOOL,
  media_type STRING,
  source_class STRING,
  status STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_norm.events_norm` (
  event_id STRING,
  global_event_id INT64,
  event_date DATE,
  event_root_code STRING,
  action_geo_country_code STRING,
  source_url STRING,
  created_at TIMESTAMP
)
PARTITION BY event_date
CLUSTER BY global_event_id, event_root_code;