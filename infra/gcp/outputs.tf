output "stage_bucket" {
  value = google_storage_bucket.gdelt_stage.name
}

output "pipeline_service_account" {
  value = google_service_account.gdelt_pipeline.email
}
