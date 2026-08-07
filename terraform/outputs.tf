output "site_bucket_name" {
  description = "S3 bucket where the static site files are uploaded."
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "site_url" {
  description = "Website URL."
  value       = local.has_custom_domain ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.site.domain_name}"
}
