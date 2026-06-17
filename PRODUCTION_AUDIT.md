# Creatvo Production Audit

## Broken Features

- Login could redirect back to `/auth/login` because middleware, server routes, and browser auth were not consistently synchronizing Supabase cookies.
- Production build failed from incomplete Supabase table typing and server-side Recharts imports.
- Dashboard analytics imported browser-only chart primitives in Server Components.
- Profile and feed pages still contain mock/demo content paths that should be replaced with paginated database queries.
- Upload UI existed visually but did not perform validation, compression, storage upload, or preview persistence.

## Missing Backend Logic

- Article edit/delete/autosave/scheduling APIs are incomplete.
- Likes, saves, comments, follows, notifications, reports, and shares need transactional counter triggers across every supported content type.
- Admin workflows need real moderation queues, analytics queries, and role-aware server actions.
- Feed needs a real ranking query for following, trending, discover, and infinite-scroll cursors.

## Auth And Session Issues

- Auth helpers used environment variables directly and failed silently if config was missing.
- Protected routes were too narrow and did not include creation routes.
- Redirect targets did not preserve query strings.
- Signout existed, but route protection and browser session refresh were not normalized.

## Route Protection Issues

- `/dashboard`, `/feed`, `/blog/new`, and `/community/new` are now protected in middleware.
- Admin routes should be added once the admin UI exists and should check the `profiles.role` value server-side.

## Database Design Flaws

- `profiles` had no role column.
- `articles` lacked `scheduled` status plus canonical/scheduled metadata.
- Existing polymorphic tables (`likes`, `saves`, `comments`, `reports`) cannot enforce foreign keys to every target table.
- RPCs referenced by server actions (`increment_likes`, `decrement_likes`) were missing.

## Security Issues

- Storage accepted larger article images and GIFs despite the 1MB jpg/png/webp requirement.
- Public read policies are appropriate for public creator content, but moderation/report/admin select policies need stricter role-gated access.
- Notification insert policy is permissive and should be moved behind SECURITY DEFINER functions only.

## Scalability And Performance

- Search vectors and core indexes exist, but feed queries need cursor pagination and composite indexes.
- Recharts increased server bundle risk and broke SSR; analytics now uses server-safe CSS visualization.
- Mock arrays should be replaced with paginated Supabase queries to avoid shipping fake data.

## UI And SEO

- UI is visually cohesive but uses several corrupted encoded glyphs in copy.
- Metadata exists globally, but article/profile pages need canonical URLs, OpenGraph images, and structured data from real records.
- Upload surfaces need accessible inputs and progress/error states.

## Changes Applied

- Centralized env validation in `lib/env.ts`.
- Stabilized Supabase server/browser helpers and middleware cookie synchronization.
- Expanded protected route coverage and fixed redirect preservation.
- Added `.env.example`.
- Extended the SQL schema for roles, scheduled articles, canonical metadata, missing like RPCs, admin policies, and 1MB image buckets.
- Removed server-side Recharts usage from dashboard pages.
- Restored passing TypeScript and production Next build.

