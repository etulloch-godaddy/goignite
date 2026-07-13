# GoIgnite — Achievements Catalog

Achievements are auto-generated from mission completion events — no manual entry required. Every time a user completes a mission, the backend writes an `Achievement` record. The `AccomplishmentsBoard` renders these directly; completing missions is all it takes to keep the dashboard current.

---

## Data Model

```json
{
  "achievement_id": "uuid",
  "user_id": "uuid",
  "title": "Published First Pricing Page",
  "date": "ISO8601",
  "impact": "Unlocked Builder stage · +50 XP",
  "category": "business_setup | funding | monetization | stage_milestone"
}
```

---

## Categories

| Category | Description |
|----------|-------------|
| `stage_milestone` | Awarded automatically when XP threshold is crossed and stage is promoted |
| `business_setup` | Brand, profile, domain, and email setup tasks |
| `funding` | Funding discovery and grant application tasks |
| `monetization` | Pricing, products, and revenue tasks |

---

## Impact String Format

All impact strings follow this pattern:

```
"{action} · +{xp} XP"
```

Examples:
- `"Unlocked Builder stage · +50 XP"`
- `"Applied for first grant · +100 XP"`
- `"Revenue milestone reached · +150 XP"`

Stage milestones omit the XP component and instead surface the GoDaddy gate:
- `"Unlocked Builder stage · Domain registration unlocked"`

---

## Achievement Catalog

### Stage Milestones

Triggered automatically by `xp_service.py` when the XP threshold is crossed.

| Title | Trigger | GoDaddy Gate |
|-------|---------|--------------|
| Reached Builder Stage | 300 XP accumulated | Domain registration |
| Reached Brand Stage | 700 XP accumulated | Professional email |
| Reached Investor-Ready Stage | 1500 XP accumulated | Full business suite |

---

### Starter Stage

#### business_setup

| Title | Trigger Mission | XP Reward |
|-------|----------------|-----------|
| Crafted Your First Pitch | Write your 1-sentence pitch | +50 |
| Named Your Brand | Define your brand name | +50 |
| Published Creator Bio | Write your bio | +25 |
| Nailed Your Niche | Define your content niche | +50 |
| Launched Social Presence | Link your social profile | +50 |

---

### Builder Stage

#### business_setup

| Title | Trigger Mission | XP Reward |
|-------|----------------|-----------|
| Published First Pricing Page | Set up pricing page | +50 |
| Secured Your Domain | Register domain via GoDaddy | +100 |
| Built Media Kit | Create shareable media kit | +75 |
| Created First Product | Define first digital product or offer | +75 |

#### monetization

| Title | Trigger Mission | XP Reward |
|-------|----------------|-----------|
| Payment Ready | Set up payment method | +75 |
| First Offer Live | Publish first offer | +75 |
| First Dollar Earned | Log first revenue | +150 |

#### funding

| Title | Trigger Mission | XP Reward |
|-------|----------------|-----------|
| Found Your First 5 Funding Leads | Discover 5 opportunities in Funding Engine | +50 |
| Funding Profile Complete | Complete eligibility profile | +75 |
| Applied for First Grant | Submit first grant application | +100 |

---

### Brand Stage

#### business_setup

| Title | Trigger Mission | XP Reward |
|-------|----------------|-----------|
| Launched Business Email | Set up professional email via GoDaddy | +100 |
| Business Profile Complete | Fill all business profile fields | +75 |
| Pitch Deck Generated | Trigger Claude pitch deck generation | +100 |
| Professional Media Kit | Publish polished media kit | +100 |

---

### Investor-Ready Stage

#### business_setup / funding

| Title | Trigger Mission | XP Reward |
|-------|----------------|-----------|
| Funding Goal Set | Define revenue and funding goal | +75 |
| Investor Pitch Ready | Generate investor-facing pitch deck | +150 |
| Applied to Accelerator | Submit accelerator application | +150 |

---

## XP Summary

| Stage | XP to unlock | Achievements available | XP available |
|-------|-------------|----------------------|-------------|
| Starter | 0 | 5 | 225 XP |
| Builder | 300 XP | 10 | 750 XP |
| Brand | 700 XP | 4 | 375 XP |
| Investor-Ready | 1500 XP | 4 | 575 XP |

Total achievable XP across all missions: **1,925 XP** — enough to reach Investor-Ready (1,500 XP) with room to spare.
