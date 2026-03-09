SELECT
  outlet_id,
  AVG(speed_score) AS avg_speed,
  AVG(stability_score) AS avg_stability,
  AVG(ghosting_score) AS avg_ghosting,
  AVG(divergence_score) AS avg_divergence
FROM `{{ project_id }}.gdelt_derived.outlet_metrics_daily`
GROUP BY outlet_id;