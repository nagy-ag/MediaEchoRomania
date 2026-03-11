variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "europe-west4"
}

variable "bucket_location" {
  type    = string
  default = "EU"
}

variable "stage_bucket_name" {
  type = string
}

variable "worker_image" {
  type = string
}
