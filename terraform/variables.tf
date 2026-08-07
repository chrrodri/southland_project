variable "project_name" {
  description = "Name used to tag and name AWS resources."
  type        = string
  default     = "southland-modern-site"
}

variable "aws_region" {
  description = "AWS region for S3 and supporting resources."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name."
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Optional custom domain, for example www.example.com. Leave empty to use the CloudFront domain."
  type        = string
  default     = ""
}

variable "hosted_zone_id" {
  description = "Optional Route 53 hosted zone ID. Required only when create_dns_record is true."
  type        = string
  default     = ""
}

variable "create_dns_record" {
  description = "Create a Route 53 A alias record for domain_name."
  type        = bool
  default     = false
}

variable "acm_certificate_arn" {
  description = "Optional ACM certificate ARN for the custom domain. CloudFront requires this certificate in us-east-1."
  type        = string
  default     = ""
}

variable "price_class" {
  description = "CloudFront price class."
  type        = string
  default     = "PriceClass_100"
}

variable "default_ttl" {
  description = "Default CloudFront cache TTL in seconds."
  type        = number
  default     = 3600
}

variable "tags" {
  description = "Additional tags for AWS resources."
  type        = map(string)
  default     = {}
}
