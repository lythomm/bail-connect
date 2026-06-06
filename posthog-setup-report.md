<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into BailConnect — a Next.js 16 App Router application built on Convex. PostHog is initialised via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+) with the EU data region, exception capture enabled, and a reverse proxy configured in `next.config.ts` to route events through `/ingest`. The `providers.tsx` was updated to remove the duplicate `posthog.init()` call while retaining the `PHProvider` wrapper for React hooks and the SPA pageview tracker. Environment variables are stored in `.env.local`.

Eleven business-critical events were identified and instrumented across six files, covering the full landlord and tenant lifecycle: sign-up/sign-in with user identification, rental listing creation, revenue upgrade intents, tenant application submission, and visit scheduling.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | Landlord successfully signs in; calls `posthog.identify()` | `app/(auth)/signin/page.tsx` |
| `sign_in_failed` | Sign-in attempt fails (wrong credentials / unknown account) | `app/(auth)/signin/page.tsx` |
| `user_signed_up` | New landlord completes registration; calls `posthog.identify()` | `app/(auth)/register/page.tsx` |
| `sign_up_failed` | Registration attempt fails | `app/(auth)/register/page.tsx` |
| `application_submitted` | Tenant submits a rental application — key conversion event | `app/apply/[slug]/page.tsx` |
| `campaign_created` | Landlord creates a new rental listing | `app/dashboard/campaigns/new/page.tsx` |
| `upgrade_to_pass_initiated` | Landlord starts Stripe checkout for the 19 € Pass Annonce | `app/dashboard/campaigns/new/page.tsx` |
| `upgrade_to_pro_initiated` | Landlord starts Stripe checkout for the PRO subscription | `app/dashboard/campaigns/new/page.tsx` |
| `visit_booked` | Tenant books a visit slot with the landlord | `app/calendar/book/page.tsx` |
| `visit_cancelled` | Tenant cancels a booked visit slot | `app/calendar/book/page.tsx` |
| `candidate_status_updated` | Landlord accepts or rejects a tenant candidate (individual or bulk) | `app/dashboard/campaigns/[id]/page.tsx` |

## Next steps

We've built a dashboard and five insights for you to monitor user behaviour:

- **Dashboard — Analytics basics (wizard):** https://eu.posthog.com/project/195300/dashboard/729637
- **Nouvelles inscriptions bailleurs:** https://eu.posthog.com/project/195300/insights/fAme6c8X
- **Logements créés vs Candidatures soumises:** https://eu.posthog.com/project/195300/insights/jBL8I5Xa
- **Événements de revenus (Pass & PRO):** https://eu.posthog.com/project/195300/insights/Cim6GeKn
- **Entonnoir d'activation bailleur (inscription → logement créé):** https://eu.posthog.com/project/195300/insights/s5BP68JS
- **Entonnoir de conversion locataire (candidature → visite réservée):** https://eu.posthog.com/project/195300/insights/9AzIrhUZ

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
