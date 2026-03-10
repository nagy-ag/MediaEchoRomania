CREATE SCHEMA IF NOT EXISTS `{{ project_id }}.gdelt_norm`;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_norm.outlets_norm` (
  outlet_id STRING,
  canonical_domain STRING,
  canonical_name STRING,
  is_romanian BOOL,
  is_local BOOL,
  is_national BOOL,
  region STRING,
  media_type STRING,
  source_class STRING,
  status STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
CLUSTER BY outlet_id, canonical_domain;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_norm.outlet_domain_aliases` (
  alias_domain STRING,
  outlet_id STRING,
  confidence_score FLOAT64,
  review_status STRING,
  is_primary BOOL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
CLUSTER BY alias_domain, outlet_id;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_norm.mentions_ro` (
  mention_row_id STRING,
  source_file STRING,
  checksum STRING,
  published_at TIMESTAMP,
  ingested_at TIMESTAMP,
  global_event_id INT64,
  mention_time TIMESTAMP,
  mention_type STRING,
  source_name STRING,
  source_domain STRING,
  outlet_id STRING,
  source_url STRING,
  confidence INT64,
  mention_doc_tone FLOAT64
)
PARTITION BY DATE(mention_time)
CLUSTER BY global_event_id, outlet_id;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_norm.gkg_ro` (
  gkg_row_id STRING,
  source_file STRING,
  checksum STRING,
  published_at TIMESTAMP,
  ingested_at TIMESTAMP,
  gkg_record_id STRING,
  date TIMESTAMP,
  source_common_name STRING,
  source_domain STRING,
  outlet_id STRING,
  document_identifier STRING,
  themes STRING,
  persons STRING,
  organizations STRING,
  gcam STRING,
  v2tone STRING
)
PARTITION BY DATE(date)
CLUSTER BY outlet_id, source_domain;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_norm.events_ro` (
  event_row_id STRING,
  source_file STRING,
  checksum STRING,
  published_at TIMESTAMP,
  ingested_at TIMESTAMP,
  global_event_id INT64,
  event_date DATE,
  event_root_code STRING,
  action_geo_country_code STRING,
  goldstein_scale FLOAT64,
  avg_tone FLOAT64,
  source_url STRING
)
PARTITION BY event_date
CLUSTER BY global_event_id, event_root_code;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_norm.entities_norm` (
  entity_label STRING,
  entity_type STRING,
  normalized_label STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
CLUSTER BY normalized_label;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_norm.theme_maps` (
  theme_label STRING,
  theme_family STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
CLUSTER BY theme_label;
