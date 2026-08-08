# Southland Modern Site

Static website refresh for Southland Building and Remodel, based on the public content structure and contact details from the existing site.

## Files

- `index.html` - full single-page website
- `assets/css/styles.css` - responsive visual design
- `assets/js/main.js` - navigation, filters, and project preview modal
- `assets/img/` - optimized local project images
- `terraform/` - S3 + CloudFront infrastructure
- `Jenkinsfile` - Jenkins pipeline for Terraform, S3 upload, and CloudFront invalidation

## Deploy to S3 + CloudFront

### Terraform

1. Copy `terraform/terraform.tfvars.example` to `terraform/terraform.tfvars`.
2. Edit the optional domain values if you want a custom domain.
3. Run:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### Jenkins

The pipeline expects these tools on the Jenkins agent:

- `terraform`
- `aws`
- shell utilities

It also expects an AWS credential in Jenkins with ID:

```text
aws-jenkins-credentials
```

The pipeline creates/updates infrastructure, uploads the static files to the private S3 bucket, and invalidates CloudFront.

## Notes

The contact CTA uses the public phone and email listed in the original site metadata:

- Phone: `(323) 819-0945`
- Email: `SLBR323@GMAIL.COM`
- Location: `Los Angeles, CA 90222`
