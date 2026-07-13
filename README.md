# CreatorLevel — Hackathon Build Plan (name is still in progress )
## Context

Building a gamified business-building platform for teen/young adult content creators. The platform mirrors Duolingo's habit loop: users level up their business through daily missions rather than being overwhelmed by a full business plan upfront. As users grow, they graduate into GoDaddy's product ecosystem (domain → email → business suite) — the platform acts as a structured on-ramp that pre-qualifies and onboards small creators into GoDaddy's tooling.

Scope is shaped around a hackathon sprint (~24-48h), so the build prioritises a working demo over completeness.

**Features in scope:**
- Gamified stage roadmap (Starter → Builder → Brand → Investor-Ready)
- Auto-built business profile + pitch deck
- Funding Discovery Engine
- Monetization Toolkit
- Auto-generated accomplishments dashboard
- GoDaddy stage-gate integration (simulated for hackathon)

**Features out of scope:** Audience Growth Challenges, Mentor Matching

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React + CSS + vanilla JS | User-specified; Vite for fast hackathon iteration |
| Backend | Python + FastAPI | User-specified; async, lightweight, fast to scaffold |
| AI | Claude API (`claude-sonnet-4-6`) | Powers pitch deck generation, mission personalisation |
| Data | In-memory dicts (DynamoDB Local planned) | In-memory for hackathon speed; swap to DynamoDB Local via `store.py` |
| Auth | JWT (simple, no Cognito for hackathon) | Fast to wire up |
| GoDaddy | Domains API integrated | Real API keys via `.env`; OTE test env supported via `GODADDY_OTE=true` |

---

## Project Structure

```
hackathon2026/
├── ACHIEVEMENTS.md              # Achievement catalog — all 21 achievements, XP values, triggers
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, CORS, router registration
│   │   ├── routes/
│   │   │   ├── users.py             # Onboarding, profile
│   │   │   ├── missions.py          # Daily missions + completion  ✓ built
│   │   │   ├── achievements.py      # Accomplishments dashboard    ✓ built
│   │   │   ├── domains.py           # GoDaddy Domains API routes   ✓ built
│   │   │   ├── funding.py           # Funding discovery engine
│   │   │   └── monetization.py      # Monetization toolkit
│   │   ├── services/
│   │   │   ├── store.py             # Shared in-memory state (USERS, ACHIEVEMENTS_STORE)  ✓ built
│   │   │   ├── xp_service.py        # XP calculation + stage promotion logic  ✓ built
│   │   │   ├── domains.py           # GoDaddy async HTTP client    ✓ built
│   │   │   ├── ai_service.py        # Claude API calls (pitch deck, bio gen)
│   │   │   └── godaddy_service.py   # Mocked GoDaddy provisioning flow
│   │   ├── models/
│   │   │   ├── user.py              # Pydantic models  ✓ updated
│   │   │   ├── mission.py           # Mission model    ✓ built
│   │   │   ├── achievement.py       # Achievement model  ✓ built
│   │   │   └── domains.py           # Domain contact, record, purchase models  ✓ built
│   │   └── data/
│   │       ├── missions.json        # 21 mission templates per stage  ✓ built
│   │       └── funding.json         # Funding opportunities database
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── package.json                 # Vite + React
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                  # Root + React Router
│       ├── main.jsx
│       ├── components/
│       │   ├── Onboarding/
│       │   │   ├── OnboardingQuiz.jsx    # Creator type quiz
│       │   │   └── RoadmapPreview.jsx    # Post-quiz roadmap reveal
│       │   ├── Dashboard/
│       │   │   ├── XPBar.jsx             # Stage progress bar + level
│       │   │   └── StageRoadmap.jsx      # Visual stage path
│       │   ├── Missions/
│       │   │   ├── MissionCard.jsx       # Individual mission + complete CTA
│       │   │   └── MissionList.jsx       # Today's missions
│       │   ├── BusinessProfile/
│       │   │   ├── PitchDeck.jsx         # AI-generated one-pager
│       │   │   └── MediaKit.jsx          # Shareable media kit
│       │   ├── Achievements/
│       │   │   └── AccomplishmentsBoard.jsx  # Auto-updated presentation dashboard
│       │   ├── Funding/
│       │   │   └── FundingEngine.jsx     # Matched grants + eligibility checklist
│       │   ├── Monetization/
│       │   │   └── MonetizationToolkit.jsx  # Templates + setup guides
│       │   └── GoDaddy/
│       │       └── UpgradePrompt.jsx     # Stage-gate GoDaddy upsell flow
│       ├── hooks/
│       │   ├── useUser.js
│       │   └── useMissions.js
│       ├── services/
│       │   └── api.js               # Centralised fetch wrapper
│       └── styles/
│           ├── main.css             # Global variables, resets
│           └── components.css       # Component-scoped styles
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
  "mission_id": "starter-pitch",
  "stage": "starter",
  "creator_types": ["fashion", "all"],
  "title": "Write your 1-sentence pitch",
  "description": "...",
  "xp_reward": 50,
  "completion_prompt": "Paste your pitch below",
  "achievement_title": "Crafted Your First Pitch",
  "achievement_category": "business_setup"
}
```

### Achievement (auto-generated)
```json
{
  "achievement_id": "uuid",
  "user_id": "uuid",
  "title": "Published First Pricing Page",
  "date": "ISO8601",
  "impact": "Unlocked Builder stage · +50 XP",
  "category": "business_setup|funding|monetization|stage_milestone"
}
```

---

## API Routes

| Method | Route | Description | Status |
|---|---|---|---|
| POST | `/api/users/onboard` | Create user with creator type, get roadmap | ✓ |
| GET | `/api/users/{id}` | Get user profile + XP + stage | ✓ |
| GET | `/api/missions/today/{user_id}` | Get today's personalised missions | ✓ |
| POST | `/api/missions/{id}/complete` | Mark complete, award XP, check stage promotion | ✓ |
| GET | `/api/users/{id}/achievements` | Accomplishments dashboard data | ✓ |
| GET | `/api/users/{id}/business-profile` | Auto-built profile (Claude-powered) | — |
| GET | `/api/funding` | Funding opportunities (query by `stage` + `creator_type`) | ✓ |
| GET | `/api/funding?stage=investor_ready` | Funding filtered to investor-ready stage (accelerators, angels) | ✓ |
| GET | `/api/funding?stage=builder&creator_type=fashion` | Funding filtered by stage and creator type | ✓ |
| GET | `/api/monetization/toolkit` | Guides + templates | — |
| POST | `/api/ai/generate-pitch` | Claude generates pitch deck from user data | — |
| GET | `/api/godaddy/stage-gate/{user_id}` | GoDaddy upgrade recommendation for current stage | — |
| GET | `/api/domains/available` | Check single domain availability | ✓ |
| POST | `/api/domains/available/bulk` | Bulk availability check (up to 500) | ✓ |
| GET | `/api/domains/suggest` | Suggest domain names from a keyword | ✓ |
| GET | `/api/domains/tlds` | List supported TLDs | ✓ |
| GET | `/api/domains/` | List shopper's registered domains | ✓ |
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
| Starter | 0 | — | Set up brand basics |
| Builder | 300 XP | Domain registration | Build audience + products |
| Brand | 700 XP | Professional email | Revenue + media kit |
| Investor-Ready | 1500 XP | Full business suite | Pitch deck + funding apps |

Stage promotion is computed in `xp_service.py`. On promotion:
1. XP threshold crossed → `stage` field updated in store
2. Achievement auto-created: e.g. "Reached Builder Stage"
3. GoDaddy upgrade prompt surfaced in frontend

See `ACHIEVEMENTS.md` for the full catalog of all 21 achievements (titles, XP values, categories, trigger missions).

---

## AI Layer — Claude Integration

`ai_service.py` uses the Anthropic Python SDK. Two primary calls:

**1. Pitch deck generation** — triggered at Brand+ stage
- Input: user's completed missions, creator type, stated revenue goal
- Output: JSON with named sections (bio, problem, product, traction, ask) → rendered in `PitchDeck.jsx`

**2. Bio + mission personalisation** — triggered at onboarding
- Input: creator type + 3 onboarding quiz answers
- Output: personalised welcome bio + first 5 custom mission descriptions

Model: `claude-sonnet-4-6`

---

## Accomplishments Dashboard (Auto-Generated)

Every mission completion writes an achievement record via `POST /api/missions/{id}/complete`. The dashboard at `AccomplishmentsBoard.jsx` renders:

- Timeline of completed missions grouped by stage
- Impact cards (XP earned, stages reached, funding applied to)
- One-click shareable link at `/share/{user_id}` — public read-only view
- No manual updating required — driven entirely by mission completion events

This means presentations never need manual updating. Complete missions → open dashboard → share the link.

---

## GoDaddy Integration (Hackathon-Scoped)

`godaddy_service.py` returns mocked responses that mirror the real GoDaddy Domains/Email API shape. Frontend shows real upgrade flows:

- **Starter → Builder**: "Your business needs a home. Register `{brand}.com` on GoDaddy"
- **Builder → Brand**: "Go pro with `hello@{brand}.com` — GoDaddy Workspace Email"
- **Investor-Ready**: "Your pitch is ready. Launch your full site with GoDaddy Website Builder"

The full GoDaddy Domains API is integrated in `services/domains.py` (async `httpx` wrapper) with 12 endpoints in `routes/domains.py`. Auth via `sso-key` header; OTE test environment controlled by `GODADDY_OTE=true` in `.env`.

**Required env vars:**
```
GODADDY_API_KEY=
GODADDY_API_SECRET=
GODADDY_OTE=true   # set false for production
```

---

## Build Order (Hackathon Sprint)

### Phase 1 — Foundation ✓
1. ✓ Scaffold `backend/` with FastAPI + basic user + mission routes
2. Scaffold `frontend/` with Vite + React Router + global styles
3. Wire `api.js` fetch wrapper (base URL from `VITE_API_URL`)

### Phase 2 — Core Loop ✓
4. ✓ Onboarding quiz → creator type → user created in store
5. ✓ Mission list + completion endpoint + XP bar
6. ✓ Stage promotion logic in `xp_service.py`

### Phase 3 — AI + Profile
7. Claude pitch deck generation (`ai_service.py` + `PitchDeck.jsx`)
8. ✓ Accomplishments dashboard (achievement writes on mission complete)
9. Auto-bio generation at onboarding

### Phase 4 — Discovery + Monetisation
10. ✓ Funding Engine — `funding.json` (15 opportunities) + `GET /api/funding` with stage + creator_type filtering
11. Monetization Toolkit — static guides + template downloads

### Phase 5 — GoDaddy + Polish
12. ✓ GoDaddy Domains API integrated (`services/domains.py`, `routes/domains.py`)
12. GoDaddy stage-gate prompts (frontend)
13. Shareable accomplishments link (`/share/{user_id}`)
14. Demo seed data + walkthrough script for presentation

---

## Verification

```bash
# Backend
cd backend
python3 -m uvicorn app.main:app --reload

# Onboard a user
curl -X POST http://localhost:8000/api/users/onboard \
  -H "Content-Type: application/json" \
  -d '{"creator_type": "fashion", "bio": "Fashion creator", "revenue_goal": "10k"}'

# Get today's missions
curl http://localhost:8000/api/missions/today/{user_id}

# Complete a mission
curl -X POST http://localhost:8000/api/missions/starter-pitch/complete \
  -H "Content-Type: application/json" \
  -d '{"user_id": "{user_id}"}'

# Check achievements
curl http://localhost:8000/api/users/{user_id}/achievements

# Frontend
cd frontend
npm run dev
# Open http://localhost:5173 — complete onboarding quiz end-to-end

# Funding Engine
curl http://localhost:8000/api/funding
curl "http://localhost:8000/api/funding?stage=investor_ready"
curl "http://localhost:8000/api/funding?stage=investor_ready&creator_type=fashion"
curl "http://localhost:8000/api/funding?stage=builder&creator_type=gaming"

# AI layer
# Set ANTHROPIC_API_KEY in .env
# Complete a mission that triggers pitch generation
# Verify pitch deck sections appear in BusinessProfile view

# Accomplishments dashboard
# Complete 3 missions → open AccomplishmentsBoard
# Verify all 3 appear without any manual update

# GoDaddy flow
# Advance to Builder stage → confirm GoDaddy domain prompt appears in UI
```
