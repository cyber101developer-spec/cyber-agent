# Cyber Regulatory TLDR Briefing Agent

Automated daily cybersecurity regulatory intelligence briefings for financial institutions. Built on Next.js 14, Supabase, Resend, and OpenAI.

**Monthly cost: ~$8–12/month (OpenAI only — everything else is free)**

---

## What It Does

- Scrapes 6+ regulatory sources daily (FFIEC, FDIC, Federal Reserve, OCC, Federal Register, NYDFS)
- Summarizes articles using GPT-4o-mini
- Filters by relevance score (configurable threshold)
- Sends a branded HTML email to your configured recipients
- Deduplicates — never sends the same article twice
- Runs automatically on a weekday schedule via Vercel Cron

---

## Quick Start (Non-Technical)

### Step 1 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project named `cyber-briefing`
3. Go to **SQL Editor** and paste + run the entire contents of `supabase/migration.sql`
4. Go to **Authentication → Users** and click **Add User** to create your login account
5. Go to **Settings → API** and copy your **Project URL** and **anon public** key

### Step 2 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and create a free account
2. Click **Add New Project** → Import this GitHub repository
3. Add these **3 Environment Variables** in Vercel's settings:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `CRON_SECRET` | Any random string (run `openssl rand -hex 32` to generate one) |

4. Click **Deploy** — takes about 2 minutes

### Step 3 — Configure via the Settings UI

1. Visit your Vercel URL → you'll be redirected to `/login`
2. Log in with the account you created in Supabase
3. Go to **Settings → API Keys** → paste your OpenAI and Resend keys → Save
4. Go to **Settings → Recipients** → add email addresses → Save
5. Go to **Dashboard** → click **"Send Briefing Now"** → check your inbox

That's it. The briefing now runs automatically every weekday at 6 AM EST.

---

## Environment Variables

Only 3 variables needed in Vercel. Everything else is configured via the UI.

```bash
NEXT_PUBLIC_SUPABASE_URL=       # From Supabase Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # From Supabase Settings → API
CRON_SECRET=                    # Any random secret string
```

---

## Tech Stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend + Hosting | Next.js 14 + Vercel | Free |
| Database + Auth | Supabase | Free |
| Email Delivery | Resend | Free (3k/mo) |
| AI Summarization | OpenAI gpt-4o-mini | ~$8–12/month |
| Web Scraping | Native fetch | Free |

---

## Default Sources

- Federal Register (Cybersecurity) — RSS
- FFIEC Cybersecurity Awareness — HTML
- FDIC Cybersecurity Resources — HTML
- Federal Reserve IT Guidance — HTML
- OCC Bank Technology Publications — HTML
- NYDFS Cybersecurity Guidance — HTML

Add custom sources at any time from the Settings → Sources tab.

---

## Manual Trigger (Testing)

From the Dashboard, click **Send Briefing Now** to run immediately.

Or via curl (replace values):

```bash
curl -X GET https://your-project.vercel.app/api/briefing \
  -H "Authorization: Bearer your_cron_secret"
```
