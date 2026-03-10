SELECT
  CURRENT_TIMESTAMP() AS generated_at,
  'up to 24 hours' AS data_freshness,
  'monthly' AS granularity,
  'Entity trend cache exposes monthly pre-aggregated series suitable for multi-year charts.' AS confidence_notes,
  entity_label,
  metric_month,
  mention_count,
  avg_tone
FROM `{{ project_id }}.gdelt_derived.entity_metrics_monthly`
WHERE metric_month >= DATE '2015-01-01';
