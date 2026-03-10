WITH latest AS (
  SELECT entity_label, mention_count, avg_tone
  FROM `{{ project_id }}.gdelt_derived.entity_metrics_daily`
  WHERE metric_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
)
SELECT
  CURRENT_TIMESTAMP() AS generated_at,
  'up to 24 hours' AS data_freshness,
  '30d' AS granularity,
  'Top entities are aggregated from normalized GKG person and organization mentions over the trailing 30 days.' AS confidence_notes,
  entity_label,
  SUM(mention_count) AS mention_count,
  AVG(avg_tone) AS avg_tone
FROM latest
GROUP BY entity_label
ORDER BY mention_count DESC, entity_label ASC
LIMIT 100;
