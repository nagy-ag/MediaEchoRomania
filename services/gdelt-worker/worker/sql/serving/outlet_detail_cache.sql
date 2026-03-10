SELECT
  CURRENT_TIMESTAMP() AS generated_at,
  'up to 24 hours' AS data_freshness,
  '30d' AS granularity,
  'Outlet detail cache summarizes the trailing 30 days of events and quality signals for each outlet.' AS confidence_notes,
  outlet_id,
  SUM(event_count) AS event_count_30d,
  AVG(avg_speed) AS avg_speed,
  AVG(avg_stability) AS avg_stability,
  AVG(avg_ghosting) AS avg_ghosting,
  AVG(avg_divergence) AS avg_divergence
FROM `{{ project_id }}.gdelt_derived.outlet_metrics_daily`
WHERE metric_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY outlet_id;
