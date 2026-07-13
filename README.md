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
| Data | JSON file store (`users.json`) | DynamoDB Local ready via `store.py` |
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

### Users
| Method | Route | Description | Status |
|---|---|---|---|
| POST | `/api/users/create-new-user` | Create user, return user_id | ✓ |
| GET | `/api/users/{id}` | Get user profile + XP + stage | ✓ |
| GET | `/api/users/{id}/onboarding-data` | Get onboarding answers | ✓ |
| PATCH | `/api/users/{id}/onboarding-data` | Save onboarding answers | ✓ |
| GET | `/api/users/{id}/achievements` | Accomplishments dashboard data | ✓ |

### Missions
| Method | Route | Description | Status |
|---|---|---|---|
| GET | `/api/missions/today/{user_id}` | Get today's personalised missions (filtered by stage + creator type) | ✓ |
| POST | `/api/missions/{id}/complete` | Mark complete, award XP, trigger stage promotion check | ✓ |

### Funding
| Method | Route | Description | Status |
|---|---|---|---|
| GET | `/api/funding` | All funding opportunities | ✓ |
| GET | `/api/funding?stage=investor_ready` | Filter to investor-ready stage (accelerators, angels) | ✓ |
| GET | `/api/funding?stage=builder&creator_type=fashion` | Filter by stage and creator type | ✓ |

### Chat (AI Business Advisor)
| Method | Route | Description | Status |
|---|---|---|---|
| POST | `/api/chat` | Claude-powered Q&A — answers business questions, surfaces relevant GoDaddy products from KB | ✓ |

### Social & Growth
| Method | Route | Description | Status |
|---|---|---|---|
| GET | `/connect/{platform}` | OAuth connect for Instagram / TikTok | ✓ |
| GET | `/callback/{platform}` | OAuth callback handler | ✓ |
| GET | `/mock-oauth/{platform}` | Mock OAuth for demo | ✓ |
| GET | `/stats/{user_id}` | Social platform stats for user | ✓ |
| GET | `/missions/{user_id}` | Social missions filtered by stage + creator type | ✓ |
| POST | `/missions/{mission_id}/complete` | Complete social mission, award XP, write achievement | ✓ |
| GET | `/templates` | Content templates by stage + creator type | ✓ |
| GET | `/guides` | Platform growth guides | ✓ |
| POST | `/content-ideas` | Claude generates content ideas from niche + audience | ✓ |
| GET | `/outreach/{user_id}` | Brand outreach tracker | ✓ |
| POST | `/outreach/{user_id}` | Log a new outreach entry | ✓ |
| PATCH | `/outreach/{user_id}/{entry_id}` | Update outreach status | ✓ |
| GET | `/stage-gate/{stage}` | GoDaddy upgrade prompt for stage | ✓ |
| GET | `/achievements/{user_id}` | Social-specific achievements | ✓ |
| POST | `/growth-plan` | Claude generates personalised growth plan | ✓ |
| GET | `/next-action/{user_id}` | Single highest-impact incomplete mission | ✓ |
| GET | `/monetization-advice` | Monetisation recommendations by creator type + stage | ✓ |
| POST | `/seo/profile` | Analyse SEO profile | ✓ |
| GET | `/seo/keywords` | SEO keyword suggestions by niche | ✓ |
| POST | `/seo/content` | Claude optimises content for SEO | ✓ |

### GoDaddy Domains
| Method | Route | Description | Status |
|---|---|---|---|
| GET | `/api/domains/available` | Check single domain availability | ✓ |
| POST | `/api/domains/available/bulk` | Bulk availability check (up to 500) | ✓ |
| GET | `/api/domains/suggest` | Suggest domain names from keyword | ✓ |
| GET | `/api/domains/tlds` | List supported TLDs | ✓ |
| GET | `/api/domains/` | List registered domains | ✓ |
| GET | `/api/domains/{domain}` | Get domain details | ✓ |
| POST | `/api/domains/purchase` | Purchase a domain | ✓ |
| POST | `/api/domains/{domain}/renew` | Renew a domain | ✓ |
| GET | `/api/domains/{domain}/records` | Get DNS records | ✓ |
| PATCH | `/api/domains/{domain}/records` | Add DNS records | ✓ |
| PUT | `/api/domains/{domain}/records/{type}` | Replace DNS records by type | ✓ |
| DELETE | `/api/domains/{domain}/records/{type}/{name}` | Delete DNS records | ✓ |

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
