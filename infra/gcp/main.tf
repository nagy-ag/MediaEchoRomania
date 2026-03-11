terraform {
  required_version = ">= 1.6.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_storage_bucket" "gdelt_stage" {
  name                        = var.stage_bucket_name
  location                    = var.bucket_location
  force_destroy               = false
  uniform_bucket_level_access = true
}

resource "google_service_account" "gdelt_pipeline" {
  account_id   = "gdelt-pipeline"
  display_name = "Media Echo GDELT pipeline"
}

resource "google_project_iam_member" "bigquery_job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.gdelt_pipeline.email}"
}

resource "google_project_iam_member" "bigquery_data_editor" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.gdelt_pipeline.email}"
}

resource "google_project_iam_member" "storage_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.gdelt_pipeline.email}"
}

resource "google_cloud_run_v2_job" "manifest_sync" {
  name     = "gdelt-manifest-sync"
  location = var.region
  template {
    template {
      service_account = google_service_account.gdelt_pipeline.email
      containers {
        image = var.worker_image
        args  = ["python", "-m", "worker.cli", "manifest-sync"]
        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }
        env {
          name  = "GCP_LOCATION"
          value = var.bucket_location
        }
        env {
          name  = "GCS_GDELT_STAGE_BUCKET"
          value = google_storage_bucket.gdelt_stage.name
        }
      }
    }
  }
}

resource "google_cloud_run_v2_job" "live_range" {
  name     = "gdelt-live-range"
  location = var.region
  template {
    template {
      service_account = google_service_account.gdelt_pipeline.email
      containers {
        image = var.worker_image
        args  = ["python", "-m", "worker.cli", "live-range"]
        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }
        env {
          name  = "GCP_LOCATION"
          value = var.bucket_location
        }
        env {
          name  = "GCS_GDELT_STAGE_BUCKET"
          value = google_storage_bucket.gdelt_stage.name
        }
      }
    }
  }
}

resource "google_workflows_workflow" "backfill" {
  name            = "gdelt-backfill"
  region          = var.region
  service_account = google_service_account.gdelt_pipeline.email
  source_contents = file("${path.module}/workflows/backfill.yaml")
}
