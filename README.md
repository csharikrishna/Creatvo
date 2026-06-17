# Creatvo

> The creator ecosystem for AI, business, coding, design, and high-value knowledge.

![CreatoHub](./public/og-image.png)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | TailwindCSS |
| UI Primitives | Radix UI |
| Charts | Recharts |
| Deployment | Vercel |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/creatohub
cd creatohub

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Fill in your Supabase credentials

# 4. Run DB migration
# Go to Supabase dashboard > SQL editor
# Run: supabase/migrations/001_full_schema.sql

# 5. Start dev server
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Features

### For Creators
- 📄 Content pages with categories
- 📊 Real analytics dashboard
- 💰 Earnings tracking
- ✍️ Blog / Article editor
- 🔗 Resource & link sharing
- 📱 Mobile-first design

### For Readers
- 🔍 Personalized feed
- 🏷️ Category-based discovery
- 📈 Trending content
- 🔖 Save & bookmark
- 💬 Community discussions
- 🔎 Full-text search

### Platform
- 🔒 Row Level Security (RLS)
- ⚡ SSR + ISR performance
- 🎨 Dark-first, modern UI
- 📱 Mobile responsive
- 🗺️ SEO optimized (sitemap, metadata)
- 🔔 Real-time notifications

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system design documentation.

## Database

Full PostgreSQL schema with:
- 15 tables with proper relations
- Full-text search indexes
- Row Level Security policies
- Automated triggers (follow counts, engagement scores)
- Storage bucket configuration

## Deployment

```bash
# Deploy to Vercel
vercel --prod

# Set env vars in Vercel dashboard
# Run DB migration on Supabase
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run `npm run dev` and make changes
4. Submit a PR

## License

MIT License — free to use, modify, and distribute.

---

Built with ❤️ for the creator economy.
