# Southland Modern Site

Static website for Southland Building and Remodel, rebuilt on modern browser
APIs while keeping the original content, structure, and visual identity.

## Files

- `index.html` — full single-page website
- `assets/css/styles.css` — responsive visual design (CSS `@layer`, nesting,
  `color-mix()`, container queries)
- `assets/js/main.js` — ES module: navigation, filters, project preview,
  scroll reveals, form handling, service-worker registration
- `manifest.webmanifest` / `sw.js` — installable, offline-capable shell
- `assets/img/` — optimized local project images
- `terraform/` — S3 + CloudFront infrastructure
- `Jenkinsfile` — Jenkins pipeline for Terraform, S3 upload, and CloudFront invalidation

## What changed from the previous version

- **`<dialog>`** replaces the hand-rolled modal for the project preview —
  native focus trapping, `Esc` to close, and a `::backdrop`.
- **Popover API** (`popover` / `popovertarget`) drives the mobile nav menu on
  narrow viewports, with a class-toggle fallback for browsers that don't
  support it yet.
- **View Transitions API** (`document.startViewTransition`) smooths the
  project filter changes, and is skipped automatically when the browser
  doesn't support it or the visitor has `prefers-reduced-motion` set.
- **Scroll-driven animations** (`animation-timeline: view()`) fade sections
  in as they enter the viewport, with an `IntersectionObserver` fallback for
  browsers without the CSS feature.
- **Container queries** resize project-card titles based on the grid's own
  width, not the viewport.
- **Web Share API / Clipboard API** let visitors share or copy a link to a
  project straight from the preview dialog.
- **Service Worker + Cache Storage API + Web App Manifest** make the shell
  installable and available offline after a first visit.
- **`FormData` + Constraint Validation API** build the contact email
  client-side instead of relying on a raw `mailto` form POST.
- A **Google Maps embed** (no API key required) and an **Instagram section**
  linking out live to [instagram.com/slbr323](https://www.instagram.com/slbr323/)
  were added, plus `GeneralContractor` JSON-LD structured data for search
  engines.

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
- Instagram: `@slbr323` (linked live, not scraped — Instagram does not offer
  a keyless way to embed a full profile grid, so the site links out to the
  real profile instead of faking post content)
