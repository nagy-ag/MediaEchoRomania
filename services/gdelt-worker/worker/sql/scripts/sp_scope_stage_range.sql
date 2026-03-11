CREATE TEMP TABLE matched_mentions AS
WITH alias_candidates AS (
  SELECT
    stage.source_file,
    stage.source_checksum,
    stage.published_at,
    stage.staged_at,
    stage.global_event_id,
    stage.mention_time,
    stage.mention_type,
    stage.source_name,
    stage.source_domain,
    stage.source_identifier AS source_url,
    stage.confidence,
    stage.mention_doc_tone,
    aliases.outlet_id,
    aliases.alias_domain,
    ROW_NUMBER() OVER (
      PARTITION BY stage.source_file, stage.source_checksum, stage.global_event_id, stage.mention_time, stage.source_identifier
      ORDER BY LENGTH(aliases.alias_domain) DESC
    ) AS alias_rank
  FROM `{{ project_id }}.{{ dataset_stage }}.stage_mentions` stage
  JOIN `{{ project_id }}.{{ dataset_norm }}.{{ outlet_alias_table }}` aliases
    ON stage.source_domain = aliases.alias_domain
    OR ENDS_WITH(stage.source_domain, CONCAT('.', aliases.alias_domain))
  JOIN `{{ project_id }}.{{ dataset_norm }}.{{ outlet_registry_table }}` outlets
    ON aliases.outlet_id = outlets.outlet_id
  WHERE stage.published_at >= TIMESTAMP('{{ scope_start }}')
    AND stage.published_at <= TIMESTAMP('{{ scope_end }}')
    AND aliases.review_status = 'approved'
    AND outlets.status = 'active'
)
SELECT * EXCEPT(alias_domain, alias_rank)
FROM alias_candidates
WHERE alias_rank = 1;

MERGE `{{ project_id }}.{{ dataset_raw }}.raw_mentions` target
USING matched_mentions source
ON target.source_file = source.source_file
  AND target.checksum = source.source_checksum
  AND target.global_event_id = source.global_event_id
  AND target.mention_time = source.mention_time
  AND target.source_url = source.source_url
WHEN NOT MATCHED THEN
  INSERT (source_file, checksum, published_at, ingested_at, global_event_id, mention_time, mention_type, source_name, source_domain, source_url, confidence, mention_doc_tone)
  VALUES (source.source_file, source.source_checksum, source.published_at, source.staged_at, source.global_event_id, source.mention_time, source.mention_type, source.source_name, source.source_domain, source.source_url, source.confidence, source.mention_doc_tone);

CREATE TEMP TABLE matched_gkg AS
WITH alias_candidates AS (
  SELECT
    stage.source_file,
    stage.source_checksum,
    stage.published_at,
    stage.staged_at,
    stage.gkg_record_id,
    stage.date,
    stage.source_common_name,
    stage.source_domain,
    stage.document_identifier,
    stage.themes,
    stage.persons,
    stage.organizations,
    stage.gcam,
    stage.v2tone,
    aliases.outlet_id,
    aliases.alias_domain,
    ROW_NUMBER() OVER (
      PARTITION BY stage.source_file, stage.source_checksum, stage.gkg_record_id
      ORDER BY LENGTH(aliases.alias_domain) DESC
    ) AS alias_rank
  FROM `{{ project_id }}.{{ dataset_stage }}.stage_gkg` stage
  JOIN `{{ project_id }}.{{ dataset_norm }}.{{ outlet_alias_table }}` aliases
    ON stage.source_domain = aliases.alias_domain
    OR ENDS_WITH(stage.source_domain, CONCAT('.', aliases.alias_domain))
  JOIN `{{ project_id }}.{{ dataset_norm }}.{{ outlet_registry_table }}` outlets
    ON aliases.outlet_id = outlets.outlet_id
  WHERE stage.published_at >= TIMESTAMP('{{ scope_start }}')
    AND stage.published_at <= TIMESTAMP('{{ scope_end }}')
    AND aliases.review_status = 'approved'
    AND outlets.status = 'active'
)
SELECT * EXCEPT(alias_domain, alias_rank)
FROM alias_candidates
WHERE alias_rank = 1;

MERGE `{{ project_id }}.{{ dataset_raw }}.raw_gkg` target
USING matched_gkg source
ON target.source_file = source.source_file
  AND target.checksum = source.source_checksum
  AND target.gkg_record_id = source.gkg_record_id
WHEN NOT MATCHED THEN
  INSERT (source_file, checksum, published_at, ingested_at, gkg_record_id, date, source_common_name, source_domain, document_identifier, themes, persons, organizations, gcam, v2tone)
  VALUES (source.source_file, source.source_checksum, source.published_at, source.staged_at, source.gkg_record_id, source.date, source.source_common_name, source.source_domain, source.document_identifier, source.themes, source.persons, source.organizations, source.gcam, source.v2tone);

CREATE TEMP TABLE accepted_event_ids AS
SELECT DISTINCT global_event_id FROM matched_mentions;

MERGE `{{ project_id }}.{{ dataset_raw }}.raw_events` target
USING (
  SELECT
    stage.source_file,
    stage.source_checksum,
    stage.published_at,
    stage.staged_at,
    stage.global_event_id,
    stage.sql_date,
    stage.event_root_code,
    stage.action_geo_country_code,
    stage.goldstein_scale,
    stage.avg_tone,
    stage.source_url
  FROM `{{ project_id }}.{{ dataset_stage }}.stage_events` stage
  JOIN accepted_event_ids accepted
    ON stage.global_event_id = accepted.global_event_id
  WHERE stage.published_at >= TIMESTAMP('{{ scope_start }}')
    AND stage.published_at <= TIMESTAMP('{{ scope_end }}')
) source
ON target.source_file = source.source_file
  AND target.checksum = source.source_checksum
  AND target.global_event_id = source.global_event_id
WHEN NOT MATCHED THEN
  INSERT (source_file, checksum, published_at, ingested_at, global_event_id, sql_date, event_root_code, action_geo_country_code, goldstein_scale, avg_tone, source_url)
  VALUES (source.source_file, source.source_checksum, source.published_at, source.staged_at, source.global_event_id, source.sql_date, source.event_root_code, source.action_geo_country_code, source.goldstein_scale, source.avg_tone, source.source_url);

MERGE `{{ project_id }}.{{ dataset_ops }}.{{ domain_review_table }}` target
USING (
  WITH candidate_domains AS (
    SELECT source_domain AS alias_domain, source_identifier AS sample_identifier, source_file
    FROM `{{ project_id }}.{{ dataset_stage }}.stage_mentions`
    WHERE published_at >= TIMESTAMP('{{ scope_start }}')
      AND published_at <= TIMESTAMP('{{ scope_end }}')
      AND source_domain IS NOT NULL
      AND source_domain != ''
    UNION ALL
    SELECT source_domain AS alias_domain, document_identifier AS sample_identifier, source_file
    FROM `{{ project_id }}.{{ dataset_stage }}.stage_gkg`
    WHERE published_at >= TIMESTAMP('{{ scope_start }}')
      AND published_at <= TIMESTAMP('{{ scope_end }}')
      AND source_domain IS NOT NULL
      AND source_domain != ''
  ),
  unmatched AS (
    SELECT
      candidate.alias_domain,
      ANY_VALUE(candidate.sample_identifier) AS sample_identifier,
      ANY_VALUE(candidate.source_file) AS source_file,
      COUNT(*) AS source_count
    FROM candidate_domains candidate
    LEFT JOIN `{{ project_id }}.{{ dataset_norm }}.{{ outlet_alias_table }}` aliases
      ON ((candidate.alias_domain = aliases.alias_domain)
      OR ENDS_WITH(candidate.alias_domain, CONCAT('.', aliases.alias_domain)))
         AND aliases.review_status = 'approved'
    WHERE aliases.alias_domain IS NULL
    GROUP BY candidate.alias_domain
  )
  SELECT * FROM unmatched
) source
ON target.alias_domain = source.alias_domain
WHEN MATCHED THEN
  UPDATE SET
    last_seen_at = CURRENT_TIMESTAMP(),
    sample_identifier = source.sample_identifier,
    source_file = source.source_file,
    source_count = target.source_count + source.source_count
WHEN NOT MATCHED THEN
  INSERT (alias_domain, first_seen_at, last_seen_at, sample_identifier, source_file, source_count, status)
  VALUES (source.alias_domain, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), source.sample_identifier, source.source_file, source.source_count, 'pending_review');


