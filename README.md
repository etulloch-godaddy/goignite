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
| Data | AWS DynamoDB (local DynamoDB for hackathon) | User-specified AWS tools; DynamoDB Local for zero-cost dev |
| Auth | JWT (simple, no Cognito for hackathon) | Fast to wire up |
| GoDaddy | Simulated API flow (mocked) | Hackathon speed; real API keys drop in via `.env` |

---

## Project Structure

```
hackathon2026/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, CORS, router registration
│   │   ├── routes/
│   │   │   ├── users.py             # Onboarding, profile, XP
│   │   │   ├── missions.py          # Daily missions + completion
│   │   │   ├── achievements.py      # Auto-accomplishments dashboard
│   │   │   ├── funding.py           # Funding discovery engine
│   │   │   └── monetization.py      # Monetization toolkit
│   │   ├── services/
│   │   │   ├── ai_service.py        # Claude API calls (pitch deck, bio gen)
│   │   │   ├── xp_service.py        # XP calculation + stage promotion logic
│   │   │   └── godaddy_service.py   # Mocked GoDaddy provisioning flow
│   │   ├── models/
│   │   │   ├── user.py              # Pydantic models
│   │   │   ├── mission.py
│   │   │   └── achievement.py
│   │   └── data/
│   │       ├── missions.json        # Mission templates per creator type + stage
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
  "mission_id": "uuid",
  "stage": "starter",
  "creator_types": ["fashion", "all"],
  "title": "Write your 1-sentence pitch",
  "description": "...",
  "xp_reward": 50,
  "completion_prompt": "Paste your pitch below"
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
  "category": "business_setup|funding|monetization"
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
| Starter | 0 | — | Set up brand basics |
| Builder | 300 XP | Domain registration | Build audience + products |
| Brand | 700 XP | Professional email | Revenue + media kit |
| Investor-Ready | 1500 XP | Full business suite | Pitch deck + funding apps |

Stage promotion is computed in `xp_service.py`. On promotion:
1. XP threshold crossed → `stage` field updated in DynamoDB
2. Achievement auto-created: e.g. "Reached Builder Stage"
3. GoDaddy upgrade prompt surfaced in frontend

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

Every mission completion writes an achievement record. The dashboard at `AccomplishmentsBoard.jsx` renders:

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

Real API credentials can be dropped into `.env` to go live — the service interface does not change.

---

## Build Order (Hackathon Sprint)

### Phase 1 — Foundation (Hours 1–4)
1. Scaffold `backend/` with FastAPI + basic user + mission routes
2. Scaffold `frontend/` with Vite + React Router + global styles
3. Wire `api.js` fetch wrapper (base URL from `VITE_API_URL`)

### Phase 2 — Core Loop (Hours 5–10)
4. Onboarding quiz → creator type → user created in DynamoDB
5. Mission list + completion endpoint + XP bar
6. Stage promotion logic in `xp_service.py`

### Phase 3 — AI + Profile (Hours 11–16)
7. Claude pitch deck generation (`ai_service.py` + `PitchDeck.jsx`)
8. Accomplishments dashboard (achievement writes on mission complete)
9. Auto-bio generation at onboarding

### Phase 4 — Discovery + Monetisation (Hours 17–20)
10. Funding Engine — static `funding.json` + eligibility filter
11. Monetization Toolkit — static guides + template downloads

### Phase 5 — GoDaddy + Polish (Hours 21–24)
12. GoDaddy stage-gate prompts
13. Shareable accomplishments link (`/share/{user_id}`)
14. Demo seed data + walkthrough script for presentation

---

## Verification

```bash
# Backend
cd backend
uvicorn app.main:app --reload
curl http://localhost:8000/api/missions/today/{user_id}

# Frontend
cd frontend
npm run dev
# Open http://localhost:5173 — complete onboarding quiz end-to-end

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
