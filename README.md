# Southland Modern Site

Static website refresh for Southland Building and Remodel, based on the public content structure and contact details from the existing site.

## Files

- `index.html` - full single-page website
- `assets/css/styles.css` - responsive visual design
- `assets/js/main.js` - navigation, filters, and project preview modal
- `assets/img/` - optimized local project images

## Deploy to S3 + CloudFront

1. Create an S3 bucket for static hosting.
2. Upload the full contents of this folder, keeping paths intact.
3. Set CloudFront origin to the S3 bucket.
4. Set default root object to `index.html`.
5. Add these cache behaviors:
   - `index.html`: short TTL, for easy content updates.
   - `assets/*`: long TTL, because images/CSS/JS are versionable.
6. Point your domain to the CloudFront distribution with Route 53 or your DNS provider.

## Notes

The contact CTA uses the public phone and email listed in the original site metadata:

- Phone: `(323) 819-0945`
- Email: `SLBR323@GMAIL.COM`
- Location: `Los Angeles, CA 90222`
