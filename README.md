# GoIgnite

## Context

A step-by-step platform that helps young entrepreneurs launch new businesses or scale existing ideas, powered by GoDaddy's full suite of business tools.

Users progress through four stages — Starter → Builder → Brand → Investor-Ready — completing daily missions that build their business piece by piece. Each stage unlocks the next tier of GoDaddy tools and surfaces AI-powered guidance tailored to where they are. The platform is designed to pre-qualify and onboard new entrepreneurs into GoDaddy's ecosystem through a structured, gamified on-ramp.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 16 + React 19 + TypeScript | GoDaddy `@ux/*` component library; Tailwind CSS |
| Backend | Python + FastAPI | Async, lightweight; `uvicorn` server |
| AI | Claude API (`claude-sonnet-4-6`) | Powers the Q&A business advisor, pitch deck generation, social content ideas, growth plans, SEO optimisation |
| Data | JSON file store (`users.json`) + SQLite pilot | Users are migrated one at a time into SQLite via `scripts/migrate_user_to_db.py`; unmigrated users still live in `users.json`. See [Database](#database) below. |
| Auth | JWT (no Cognito for hackathon) | — |
| GoDaddy | Domains API (real) + Airo LLC tool | `httpx` async wrapper; `sso-key` auth; OTE test env via `GODADDY_OTE=true` |

---

## Project Structure

```
hackathon2026/
├── ACHIEVEMENTS.md              # Achievement catalog — 23 achievements, XP values, trigger missions
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, CORS, router registration
│   │   ├── routes/
│   │   │   ├── users.py             # Onboarding, profile               ✓
│   │   │   ├── missions.py          # Daily missions + completion        ✓
│   │   │   ├── achievements.py      # Accomplishments dashboard          ✓
│   │   │   ├── domains.py           # GoDaddy Domains API routes         ✓
│   │   │   ├── funding.py           # Funding discovery engine           ✓
│   │   │   ├── chat.py              # Claude-powered Q&A business advisor ✓
│   │   │   └── social_media.py      # Social growth + SEO toolkit        ✓
│   │   ├── services/
│   │   │   ├── store.py             # Shared in-memory state             ✓
│   │   │   ├── user_store.py        # JSON-file user persistence         ✓
│   │   │   ├── xp_service.py        # XP calculation + stage promotion   ✓
│   │   │   ├── domains.py           # GoDaddy async httpx client         ✓
│   │   │   ├── social_media_service.py  # Social + SEO service layer     ✓
│   │   │   └── qnabot/
│   │   │       ├── prompts.py       # System prompt + context headers    ✓
│   │   │       └── tools/
│   │   │           ├── ai_tool.py   # Claude API call wrapper            ✓
│   │   │           └── retrieval.py # GoDaddy KB retrieval               ✓
│   │   ├── models/
│   │   │   ├── user.py              # User, Stage, CreatorType           ✓
│   │   │   ├── mission.py           # Mission model                      ✓
│   │   │   ├── achievement.py       # Achievement model                  ✓
│   │   │   ├── funding.py           # FundingOpportunity model           ✓
│   │   │   └── domains.py           # Domain contact, record, purchase   ✓
│   │   └── data/
│   │       ├── missions.json        # 23 mission templates per stage     ✓
│   │       └── funding.json         # 15 funding opportunities           ✓
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── package.json                 # Next.js 16 + React 19
│   └── src/
│       ├── app/
│       │   ├── page.tsx             # Landing / home
│       │   ├── dashboard/page.tsx   # Main dashboard
│       │   └── questionnaire/page.tsx
│       ├── components/
│       │   ├── dashboard/           # Shell, header, sidebar, missions, achievements, roadmap
│       │   ├── questionnaire/       # Multi-step onboarding quiz
│       │   └── home-hero.tsx
│       ├── hooks/
│       │   └── use-dashboard.ts     # Data fetching + mission completion logic
│       ├── lib/
│       │   ├── dashboard-data.ts    # Types + nav builders + demo data
│       │   ├── map-dashboard.ts     # API response → dashboard types
│       │   └── stages.ts            # Stage config + unlock logic
│       └── services/
│           └── api.ts               # Centralised fetch wrapper
│
└── README.md
```

---

## Core Data Models

### User
```json
{
  "user_id": "uuid",
  "creator_type": "fashion|gaming|fitness|art|food",
  "stage": "starter|builder|brand|investor_ready",
  "xp_total": 0,
  "completed_missions": [],
  "business_profile": { "bio": "", "pitch": "", "revenue_goal": "" },
  "godaddy_domain": null,
  "created_at": "ISO8601"
}
```

### Mission
```json
{
  "mission_id": "investor-llc",
  "stage": "investor_ready",
  "creator_types": ["all"],
  "title": "Register your LLC via GoDaddy",
  "description": "...",
  "xp_reward": 200,
  "completion_prompt": "Confirm your LLC has been registered",
  "achievement_title": "Official Business Entity",
  "achievement_category": "business_setup"
}
```

### Achievement (auto-generated on mission completion)
```json
{
  "achievement_id": "uuid",
  "user_id": "uuid",
  "title": "Official Business Entity",
  "date": "ISO8601",
  "impact": "Official Business Entity · +200 XP",
  "category": "business_setup|funding|monetization|stage_milestone"
}
```

### Funding Opportunity
```json
{
  "id": "ycombinator",
  "name": "Y Combinator",
  "type": "accelerator",
  "description": "...",
  "amount": "$500,000 for 7% equity",
  "deadline": "Cohort-based (Jan / Sep)",
  "eligibility_stages": ["investor_ready"],
  "creator_types": ["all"],
  "requirements": ["..."],
  "application_url": "https://www.ycombinator.com/apply",
  "tags": ["accelerator", "equity", "top-tier"]
}
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/users/onboard` | Create user with creator type, get roadmap |
| GET | `/api/users/{id}` | Get user profile + XP + stage |
| GET | `/api/missions/today/{user_id}` | Get today's personalised missions |
| POST | `/api/missions/{id}/complete` | Mark complete, award XP, check stage promotion |
| GET | `/api/users/{id}/business-profile` | Auto-built profile (Claude-powered) |
| GET | `/api/users/{id}/achievements` | Accomplishments dashboard data |
| GET | `/api/funding` | Funding opportunities (query by stage + creator_type) |
| GET | `/api/monetization/toolkit` | Guides + templates |
| POST | `/api/ai/generate-pitch` | Claude generates pitch deck from user data |
| GET | `/api/godaddy/stage-gate/{user_id}` | GoDaddy upgrade recommendation for current stage |
| GET | `/api/social/connect/{platform}` | OAuth authorization URL for instagram/tiktok/facebook |
| GET | `/api/social/callback/{platform}` | OAuth code exchange + redirect to frontend |
| GET | `/api/social/mock-oauth/{platform}` | Instant mock connect — returns fake stats, no redirect needed |
| GET | `/api/social/stats/{user_id}` | Connected platform follower/engagement stats |
| GET | `/api/social/missions/{user_id}` | Social missions filtered by stage + creator_type |
| POST | `/api/social/missions/{mission_id}/complete` | Complete social mission and write achievement |
| GET | `/api/social/templates` | Outreach templates filtered by stage + platform |
| GET | `/api/social/guides` | Platform guides (IG/TikTok/FB/LinkedIn) filtered by stage |
| GET | `/api/social/stage-gate/{stage}` | Social visibility prompt shown at each stage unlock |
| POST | `/api/social/content-ideas` | Claude-generated 7-day content plan |
| GET | `/api/social/outreach/{user_id}` | Brand outreach pipeline log + summary stats |
| POST | `/api/social/outreach/{user_id}` | Log a new brand outreach entry |
| PATCH | `/api/social/outreach/{user_id}/{entry_id}` | Update outreach status; fires achievement on first "deal" |
| GET | `/api/social/achievements/{user_id}` | All social achievements for a user |
| GET | `/api/social/next-action/{user_id}` | Single highest-impact incomplete mission for the user |
| GET | `/api/social/monetization-advice` | Monetization paths by creator type + follower count |
| POST | `/api/social/growth-plan` | Claude-generated 30-day growth plan personalised to user |
| GET | `/api/social/seo/keywords` | Ranked SEO keywords by creator type + platform |
| POST | `/api/social/seo/profile` | Score + rewrite a bio for SEO discoverability |
| POST | `/api/social/seo/content` | Rewrite a caption for maximum platform discoverability |

---

## Social Media & Marketing Module

`social_media_service.py` handles OAuth, platform stats, Claude content generation, and achievement writes. The full hub lives in `SocialMediaHub.jsx` across 6 tabs.

- **Platform Connect**: OAuth flow for Instagram, TikTok, and Facebook — set `MOCK_SOCIAL_APIS=true` in `.env` to bypass all external calls for demo
- **Live Stats**: Follower count, engagement rate, and recent post performance pulled per connected platform
- **Social Missions**: 22 missions across all 4 stages, filtered by creator type — completions write achievements with real milestone impact descriptions
- **AI Content Plan**: `POST /api/social/content-ideas` calls `claude-sonnet-4-6` to generate a 7-day post calendar with hooks, captions, and hashtags; falls back to a static mock if no API key is set
- **Outreach Tracker**: Brand deal pipeline with status tracking across Starter → Investor-Ready; entries 7+ days old with status "sent" surface a follow-up reminder; closing a deal auto-fires an achievement
- **Outreach Templates + Platform Guides**: 9 copy-paste DM/email templates and IG/TikTok/FB/LinkedIn guides, all scoped by stage

Integrator adds one `include_router` call in `main.py` and one `<Route>` in `App.jsx` — no other shared files touched.

---

## XP & Stage Progression

| Stage | XP Required | GoDaddy Gate | Focus |
|---|---|---|---|
| Starter | 0 | — | Brand basics and pitch |
| Builder | 300 XP | Domain registration | Audience, products, first revenue |
| Brand | 700 XP | Professional email | Media kit, pitch deck, revenue growth |
| Investor-Ready | 1500 XP | Full business suite + LLC registration | Funding, accelerators, formal incorporation |

Stage promotion is handled in `xp_service.py`. On promotion:
1. XP threshold crossed → `stage` field updated
2. Achievement auto-created: e.g. "Reached Builder Stage"
3. GoDaddy upgrade prompt surfaced in frontend

See `ACHIEVEMENTS.md` for all 23 achievements (titles, XP values, categories, trigger missions).

---

## AI Layer — Claude Integration

All Claude calls use `claude-sonnet-4-6` via the Anthropic Python SDK.

**1. Q&A Business Advisor** (`qnabot/`) — `POST /api/chat`
- System prompt: warm, direct business advisor persona; plain language; no filler
- Retrieves relevant GoDaddy KB entries and injects them as grounded context
- Only surfaces GoDaddy products when they genuinely fit — never fabricated
- Accepts optional `user_id` to personalise responses based on the user's stage, creator type, and bio

**2. Social content ideas** — `POST /content-ideas`
- Input: niche, audience, platform, creator type
- Output: 5 ready-to-post content concepts with hooks and formats

**3. Growth plan generation** — `POST /growth-plan`
- Input: user stage, creator type, completed missions, social stats
- Output: prioritised 30/60/90-day growth plan

**4. SEO content optimisation** — `POST /seo/content`
- Input: draft content + target keywords
- Output: SEO-optimised rewrite with metadata suggestions

**5. Pitch deck generation** — `POST /api/ai/generate-pitch` *(planned)*
- Input: user's completed missions, creator type, revenue goal
- Output: JSON with named sections (bio, problem, product, traction, ask) → `PitchDeck` component

---

## GoDaddy Integration

`godaddy_service.py` mirrors the real GoDaddy Domains/Email API shape. Frontend shows real upgrade flows:

- **Starter → Builder**: "Your business needs a home. Register `{brand}.com` on GoDaddy"
- **Builder → Brand**: "Go pro with `hello@{brand}.com` — GoDaddy Workspace Email"
- **Brand → Investor-Ready**: "Your pitch is ready. Launch your full site with GoDaddy Website Builder"
- **Investor-Ready (LLC)**: Mission `investor-llc` (+200 XP) directs users to [GoDaddy Airo LLC registration](https://www.godaddy.com/airo/register-llc) to formally incorporate before approaching investors

Full GoDaddy Domains API integrated in `services/domains.py` (async `httpx`). Auth via `sso-key` header; OTE test environment via `GODADDY_OTE=true`.

**Required env vars:**
```
GODADDY_API_KEY=
GODADDY_API_SECRET=
GODADDY_OTE=true
ANTHROPIC_API_KEY=
```

---

## Build Order

### Phase 1 — Foundation ✓
1. ✓ FastAPI scaffold + user + mission routes
2. ✓ Next.js frontend + global styles + `api.ts` fetch wrapper

### Phase 2 — Core Loop ✓
3. ✓ Onboarding quiz → creator type → user created
4. ✓ Mission list + completion + XP bar
5. ✓ Stage promotion logic (`xp_service.py`)

### Phase 3 — AI + Growth ✓
6. ✓ Claude Q&A business advisor (`qnabot/` + `POST /api/chat`)
7. ✓ Social growth toolkit (content ideas, growth plan, SEO, outreach tracker)
8. ✓ Accomplishments dashboard (achievement writes on mission complete)

### Phase 4 — Discovery + Funding ✓
9. ✓ Funding Engine — `funding.json` (15 opportunities) + `GET /api/funding` with stage + creator_type filtering
10. ✓ LLC mission — GoDaddy Airo integration at Investor-Ready stage (+200 XP)

### Phase 5 — GoDaddy + Polish
11. ✓ GoDaddy Domains API (`services/domains.py`, `routes/domains.py`)
12. Pitch deck generation (`POST /api/ai/generate-pitch`)
13. Shareable accomplishments link (`/share/{user_id}`)
14. Demo seed data + walkthrough script

---

## Database

User data currently lives in two places at once, on purpose (an in-progress migration, one user at a time):

- **`backend/data/users.json`** — the original flat-file store. Most users still live here.
- **`backend/data/goignite.db`** — a local SQLite database, created automatically the first time the backend starts. A small number of pilot users have been moved here.

You don't need to configure anything — `app/services/user_store.py` reads/writes both sources transparently, so every route (`load_users()` / `save_users()`) works the same regardless of which backend a given user is in.

**First-time setup:**

```bash
cd backend
python3 -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt   # Windows
# source .venv/bin/activate && pip install -r requirements.txt  # macOS/Linux
```

> **Windows without Visual C++ Build Tools:** if `pip install -r requirements.txt` fails trying to compile `greenlet` from source, run `pip install --only-binary=:all: greenlet` first (grabs a prebuilt wheel), then re-run the requirements install.

**Run the backend as usual** — `goignite.db` is created automatically on first run, no manual DB setup step:

```bash
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

**Move a user into the database** (optional — only needed if you're working on the DB migration itself):

```bash
.venv\Scripts\python.exe -m scripts.migrate_user_to_db <user_id>
```

This pops that user out of `users.json` and inserts them as a row in `goignite.db`. It's one-way and one user at a time — safe to run against any user_id currently in `users.json`.

`goignite.db` and `.venv/` are gitignored — each teammate generates their own local copy; only `users.json` is checked into git.

---

## Verification

```bash
# Backend
cd backend
python3 -m uvicorn app.main:app --reload

# Health check
curl http://localhost:8000/health

# Create a user
curl -X POST http://localhost:8000/api/users/create-new-user

# Get today's missions
curl http://localhost:8000/api/missions/today/{user_id}

# Complete a mission
curl -X POST http://localhost:8000/api/missions/starter-pitch/complete \
  -H "Content-Type: application/json" \
  -d '{"user_id": "{user_id}"}'

# Funding Engine
curl http://localhost:8000/api/funding
curl "http://localhost:8000/api/funding?stage=investor_ready"
curl "http://localhost:8000/api/funding?stage=investor_ready&creator_type=fashion"
curl "http://localhost:8000/api/funding?stage=builder&creator_type=gaming"

# Q&A Business Advisor
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I register an LLC?", "session_id": "demo", "user_id": "{user_id}"}'

# Check achievements
curl http://localhost:8000/api/users/{user_id}/achievements

# Frontend
cd frontend
npm run dev
# Open http://localhost:3000
```
