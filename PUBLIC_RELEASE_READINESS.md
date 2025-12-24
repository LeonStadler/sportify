# Public Release Readiness - Sportify
Date: 2025-12-23 11:21 CET

## Status
NOT READY

## Completed checks
- Secret pattern scan across repo files (rg).
- Verified `.env` is ignored and not tracked by git.
- Searched git history for `.env` path references.
- Reviewed staged changes (license, security policy, CORS, contact info, legal copy, font license).
- Verified Inter fonts are locally hosted and license file added.

## Blocking issues
1) Proof that no secrets exist in git history
   - `.env` contains real credentials locally (DB/JWT/SMTP/VAPID/cron).
   - Action: run a full secret scan (gitleaks/trufflehog) and rotate secrets before public release.

2) Confirm public contact details are intended and correct
   - `.env.example` now contains real contact info for legal pages.
   - Action: verify values (address/postal code/phone/email) and confirm they are OK to publish.

## Resolved since last review
- CORS is now allowlisted in `server.js`; permissive Vercel CORS headers removed.
- License updated to source-available; README and package metadata aligned.
- Security contact is no longer a placeholder.
- Contact info moved to environment config; privacy copy now uses placeholders.
- Inter font license added (`public/fonts/OFL.txt`).
- Screenshots removed (`assets/` directory no longer present).
- Production env vars for legal pages/CORS set (user-confirmed).

## Recommended (non-blocking) improvements
- Tighten CSP in `vercel.json` by removing `unsafe-inline`/`unsafe-eval` where possible.
- Add rate limiting for auth and sensitive endpoints.
- Add dependency vulnerability scanning (npm audit/OSV) to CI.
- Add secret scanning (gitleaks/trufflehog) to CI.
- Add a third-party notices file if you want a single attribution place for assets.
- Review `public/robots.txt` if the product should be indexable.

## Proof checklist before public release
- [ ] Run a full secret scan including git history (gitleaks/trufflehog) and attach report.
- [ ] Run dependency vulnerability scan and triage CVEs.
- [ ] Verify asset provenance and licensing (fonts, icons).
- [ ] Confirm public contact details and legal-page rendering in production.
- [ ] Validate production CORS/CSP behavior with actual deployed domains.
