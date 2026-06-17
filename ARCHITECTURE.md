# Creatvo — Architecture & Implementation Guide

## Stack
- **Framework**: Next.js 14 App Router (SSR + RSC)
- **Database**: Supabase (PostgreSQL + RLS + Realtime)
- **Auth**: Supabase Auth (email + Google OAuth)
- **Styling**: TailwindCSS + Radix UI
- **Charts**: Recharts
- **Deployment**: Vercel

---

## Folder Structure

```
creatvo/
├── app/
│   ├── layout.tsx              # Root layout (fonts, global styles)
│   ├── page.tsx                # Home / discover page
│   ├── globals.css
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── not-found.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── callback/route.ts
│   │   └── signout/route.ts
│   ├── feed/page.tsx           # Personalized feed (auth required)
│   ├── trending/page.tsx
│   ├── categories/page.tsx
│   ├── search/page.tsx
│   ├── community/
│   │   ├── page.tsx
│   │   └── new/page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [slug]/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx            # Overview
│   │   ├── content/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── SettingsForm.tsx
│   └── [username]/page.tsx     # Public creator profile
├── components/
│   ├── navbar/Navbar.tsx
│   ├── hero/HeroSection.tsx
│   ├── category-grid/CategoryGrid.tsx
│   ├── creator-card/CreatorCard.tsx
│   ├── content-card/ContentCard.tsx
│   ├── dashboard/DashboardSidebar.tsx
│   └── Footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client (RSC)
│   ├── actions/index.ts        # All server actions
│   ├── hooks/index.ts          # Client-side hooks
│   └── utils/index.ts          # Helpers
├── types/index.ts              # Full TypeScript types
├── supabase/migrations/
│   └── 001_full_schema.sql     # Complete DB schema
├── middleware.ts               # Auth route protection
└── tailwind.config.ts
```

---

## Feed Ranking Algorithm

```
score =
  likes * 2 +
  comments * 3 +
  saves * 5 +
  shares * 4 +
  views * 0.1 +
  recency_boost (decays over time)
```

**Scaling path:**
1. MVP: Simple DB query with ORDER BY engagement_score
2. 10K users: Materialized views, precomputed feeds per category
3. 100K users: Redis cache for hot feeds, background jobs for score updates
4. 1M+ users: Dedicated recommendation service (collaborative filtering)

---

## Security Implementation

### RLS (Row Level Security)
- Every table has RLS enabled
- Public content: SELECT for all, mutations only for owner
- Private data (notifications, saves): restricted to owner
- Auth-based INSERT policies for all user-generated content

### Rate Limiting
- Implement via Vercel middleware or Upstash Redis
- 100 req/min for anonymous, 1000 req/min for authenticated
- Separate limits for content creation (prevent spam)

### Input Validation
- Server Actions validate all inputs before DB operations
- Username regex enforced at DB level via CHECK constraint
- URL validation before storing external links
- Content length limits enforced at DB level

---

## SEO Strategy

### Dynamic metadata
- Creator pages: `@username | CreatoHub`
- Articles: `{title} by {creator}`
- Categories: `{category} Resources | CreatoHub`

### Technical SEO
- Sitemap generated from DB (profiles + articles)
- robots.ts blocks private routes
- OpenGraph images for all major pages
- Schema.org markup for articles (Article, Person, BreadcrumbList)

### Content SEO
- Creator pages as evergreen resource hubs
- Article slugs from title (SEO-friendly)
- Category pages optimized for discovery keywords
- Public knowledge pages for long-tail keywords

---

## Scaling Roadmap

### Phase 1 — MVP (0–1K users)
- Current architecture works perfectly
- Direct DB queries, SSR
- Supabase free tier (500MB)

### Phase 2 — Growth (1K–50K users)
- Add Redis caching (Upstash) for feeds
- Implement ISR for category/creator pages
- Add DB read replicas
- Background jobs for engagement score updates
- Image CDN (Cloudflare)

### Phase 3 — Scale (50K–500K users)
- Dedicated feed service
- Search upgrade to Typesense or Meilisearch
- Real-time with Supabase Realtime channels
- Content moderation queue
- Paid tier infrastructure (dedicated Supabase)

### Phase 4 — Hyper-scale (500K–1M+ users)
- Recommendation ML model (collaborative filtering)
- Edge functions for feed personalization
- Multi-region Supabase
- CDN for all static assets
- Analytics pipeline (Clickhouse or BigQuery)

---

## Performance Checklist

- [ ] next/image for all images with proper sizes
- [ ] Lazy loading for below-fold content
- [ ] Suspense boundaries for all data fetching
- [ ] ISR for public pages (60s revalidation)
- [ ] unstable_cache for expensive queries
- [ ] Pagination (cursor-based for feeds)
- [ ] Proper DB indexes (all on schema)
- [ ] Connection pooling via Supabase

---

## Monetization Architecture

### Creator Revenue Streams
1. **Ad Revenue** — CPM ads shown on creator pages
2. **Affiliate Links** — Creator-tagged referral links
3. **Premium Content** — Gated posts for subscribers
4. **Sponsored Posts** — Brand partnerships
5. **Merchandise** — Product listings

### Platform Revenue
1. **Pro Creator** — ₹499/mo for advanced analytics, custom domain
2. **Brand Accounts** — ₹4,999/mo for promoted content slots
3. **Ad Network** — Direct CPM ads across platform

---

## Production Readiness Checklist

### Security
- [x] RLS on all tables
- [x] Server-side validation in actions
- [x] Input sanitization
- [x] Auth middleware
- [ ] Rate limiting (Upstash)
- [ ] CORS configuration
- [ ] CSP headers

### Performance
- [x] Proper DB indexes
- [x] SSR with server components
- [ ] Image optimization pipeline
- [ ] Caching strategy (Redis)
- [ ] CDN setup

### Observability
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Custom analytics pipeline
- [ ] Uptime monitoring

### DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Preview deployments
- [ ] Environment variables management
- [ ] Database backups
- [ ] Migration strategy
