🤖 GoCass Small Business Q&A Chatbot — Build Guidelines
📐 PHASE 1 — Architecture & Tech Stack
Core Components:

LAYER
PURPOSE
SUGGESTED TECH
LLM Engine
Generates answers
GPT-4o / Claude / Gemini via API
GoCass Integration
GoDaddy product knowledge retrieval
GoCass API / internal KB
Business Knowledge Base
Small biz / entrepreneur advice
RAG (Retrieval-Augmented Generation)
Orchestration
Routes queries, blends responses
LangChain / LlamaIndex / custom
Chat Interface
User-facing UI
React, Web Component, or embedded widget
Memory/Session
Tracks conversation context
Redis / in-memory session store


High-Level Flow:


Collapse
Save
Copy
1
2
3
4
5
6
7
8
9
User Question
    ↓
Intent Classifier
    ↓               ↓
GoCass Retrieval   Business KB Retrieval
    ↓               ↓
     Response Blender
          ↓
   Final Answer (advice + optional GD product suggestion)
🔌 PHASE 2 — GoCass Integration (GoDaddy Knowledge)
Goals: Pull accurate, up-to-date GoDaddy product info to ground responses.

Steps:

Connect to GoCass — authenticate and query the GoCass API/data layer for product metadata, features, pricing tiers, and use-case descriptions.
Index GD products — create a searchable vector index (e.g., via Pinecone, Weaviate, or pgvector) of GoDaddy products tagged by:
Category (Domains, Hosting, Website Builder, Email, Security, Commerce, etc.)
Business use case (e.g., "starting a website," "selling online," "professional email")
Keep it fresh — set up a scheduled sync to re-index whenever GoCass data updates.
Retrieval strategy — use semantic search so a question like "How do I look more professional online?" can surface GD Professional Email or Websites + Marketing.
📚 PHASE 3 — Small Business / Entrepreneurial Knowledge Layer
Build a domain-specific knowledge base covering:

🏢 Starting a business — business plans, LLCs vs. sole proprietors, registrations
💰 Finance basics — budgeting, cash flow, invoicing, funding options
📣 Marketing & branding — social media, SEO basics, email marketing, logo/brand identity
🌐 Online presence — why you need a website, domain strategy, SEO
🛒 E-commerce — selling online, payment options, inventory basics
👥 Hiring & operations — first employees, contractors, tools for productivity
📈 Growth strategies — scaling, customer retention, analytics
How to build it:

Curate authoritative sources (SBA.gov, SCORE, Investopedia, HubSpot blogs)
Chunk and embed them into your vector store
Tag each chunk with topic categories for better retrieval filtering
💬 PHASE 4 — Q&A Conversation Flow & Prompt Engineering
Intent Classification — route every query into one of three buckets:


Collapse
Save
Copy
1
2
3
1. PURE BUSINESS QUESTION  →  Answer from Business KB
2. PURE GODADDY QUESTION   →  Answer from GoCass
3. MIXED / APPLICABLE      →  Answer from both, blend naturally
System Prompt Template (example):


Collapse

Run
Save
Copy
1
2
3
4
5
6
7
You are a helpful small business advisor powered by GoDaddy.
Your job is to:
1. Answer the user's business question with clear, practical advice.
2. When a GoDaddy product genuinely helps with their situation,
   naturally recommend it — but never force it.
3. Keep answers concise, friendly, and actionable.
4. Never fabricate product details — only use retrieved GoDaddy data.
Key Prompt Design Rules:

✅ Always lead with the business answer first
✅ Product suggestions come second, framed as "tools that can help"
✅ Use soft language — "You might also consider…" not "You must buy…"
✅ If no GD product is relevant, don't force one in
🎯 PHASE 5 — GoDaddy Product Recommendation Logic
Build a relevance scoring system:


Collapse
Save
Copy
1
2
3
4
User query → extract topics/entities → semantic match against GD product index
→ score each product by relevance (0.0 – 1.0)
→ only surface products scoring above threshold (e.g., 0.65)
→ pass top 1–2 products to the LLM for natural mention
Recommendation trigger examples:

USER SAYS
GD PRODUCT TO SUGGEST
"I need a website for my business"
Website Builder / Managed WordPress
"How do I get a business email?"
Microsoft 365 / GD Professional Email
"I want to sell products online"
WooCommerce / Online Store
"I need a domain name"
Domain Search / Registration
"How do I protect my site?"
SSL Certificate / Website Security
"I need to market my business"
Websites + Marketing / SEO Tools


🔀 PHASE 6 — Response Blending Layer
This is the secret sauce — combining general advice + GD products seamlessly.

Response structure formula:


Collapse

Run
Save
Copy
1
2
3
4
5
6
7
[Empathy / acknowledge the question]
   +
[Core business advice — 2-4 actionable points]
   +
[Optional: "Here's how GoDaddy can help with this…" block]
   +
[Call to action or follow-up question]
Example output:

"Great question! Building credibility as a new business starts with a few key things: a professional online presence, consistent branding, and making it easy for customers to find and contact you.

For your online presence, a custom domain name (like yourname.com) goes a long way — it instantly looks more professional than a free site URL. GoDaddy's domain search can help you find the right one, and pairing it with a professional email (like you@yourname.com ) builds trust fast.

Want help thinking through your branding strategy next?" 

🧪 PHASE 7 — Testing & Quality Guardrails
Test these scenarios:


Pure business questions (no GD product should be forced)

Direct GoDaddy product questions (accurate, GoCass-grounded answers)

Edge cases — off-topic questions, vague questions, very niche industries

Hallucination checks — verify product names, prices, and features match GoCass data
Guardrails to implement:

🚫 No hallucinated product details — LLM must cite only retrieved GoCass data
🚫 No overly salesy tone — use tone scoring or a review prompt
✅ Confidence thresholds — if retrieval confidence is low, say "I'd recommend checking GoDaddy's site for the latest details"
✅ Fallback responses — graceful handling of out-of-scope questions
🚀 PHASE 8 — Deployment & Iteration Plan
Rollout stages:

STAGE
GOAL
MVP (Week 1-3)
Basic Q&A with GoCass data + top 5 business topics
Beta (Week 4-6)
Add full business KB, tune recommendation logic, collect feedback
V1 Launch
Full feature set, UI polished, guardrails active
Ongoing
Monitor unanswered/low-confidence queries → add to KB


Metrics to track:

📊 Answer relevance rating (thumbs up/down)
📊 GD product click-through rate from recommendations
📊 % of questions answered with high confidence
📊 Most common unanswered question topics → knowledge gap alerts
✅ Quick-Start Checklist

GoCass API access confirmed and tested

Vector store chosen and set up (Pinecone / pgvector / Weaviate)

Business knowledge sources identified and chunked

Intent classifier built or prompted

System prompt written and tested

Product relevance threshold tuned

Response blending tested with 20+ sample questions

Guardrails and fallback responses in place

---

## 🛠️ Build Checklist (Current Sprint)

### Phase 1 — Core App
- [x] Create `main.py` — FastAPI app with CORS and router registration
- [x] Create `services/chat_service.py` — loads both JSON data files into memory at startup

**How to test:**
```bash
uvicorn main:app --reload
# Open http://localhost:8000/docs — you should see the FastAPI Swagger UI with a /api/chat route listed
```

---

### Phase 2 — Intent & Retrieval
- [x] Build intent classifier — keyword/semantic routing into 3 buckets: `BUSINESS`, `GODADDY`, `MIXED`
- [x] Build business KB retrieval — keyword match against `business_kb.json` topics
- [x] Build product retrieval — match user query against `use_cases` arrays in `godaddy_products.json` with a relevance threshold

**How to test:**
```python
# Run from backend/QNABOT/
python -c "
from services.chat_service import classify_intent, retrieve_business_chunks, retrieve_products

print(classify_intent('how do I register an LLC'))          # BUSINESS
print(classify_intent('I need a domain name'))              # GODADDY
print(classify_intent('I need a website to sell products')) # MIXED

print(retrieve_business_chunks('how do I start a business'))
print(retrieve_products('I need a domain'))
"
```

---

### Phase 3 — Claude Integration
- [x] Create `services/prompts.py` — system prompt and context header strings
- [x] Create `services/ai_service.py` — send system prompt + retrieved context chunks to Claude API
- [x] Wire the response blending formula: empathy → advice → optional GD product → follow-up CTA

**How to test:**
```python
# Requires ANTHROPIC_API_KEY in .env
python -c "
from services.ai_service import get_reply

print(get_reply('How do I start an LLC?'))
print('---')
print(get_reply('I need a domain name for my bakery'))
print('---')
print(get_reply('I want to sell cakes online, where do I start?'))
"
```

---

### Phase 4 — Route & API
- [ ] Fully implement `routes/chat.py` — `POST /api/chat` endpoint accepting `{ message, session_id }`
- [ ] Add in-memory session store for conversation history (simple dict keyed by `session_id`)

**How to test:**
```bash
uvicorn main:app --reload

curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I start an LLC?", "session_id": "test-123"}'

# Send a follow-up to verify session memory
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What did I just ask about?", "session_id": "test-123"}'
```

---

### Phase 5 — Guardrails
- [ ] Hallucination guard — LLM only mentions products that were retrieved, not invented
- [ ] Fallback response for out-of-scope or low-confidence queries
- [ ] Confidence threshold — surface "check GoDaddy's site for latest details" when retrieval is weak

**How to test:**
```bash
# Out-of-scope query — should get a polite fallback, not a hallucinated answer
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the capital of France?", "session_id": "guard-test"}'

# Vague query — should trigger low-confidence response
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "help", "session_id": "guard-test-2"}'
```

---

### Phase 6 — Test & Validate
- [ ] Test 5 pure business questions (no GD product should be forced)
- [ ] Test 5 direct GoDaddy questions (accurate product names/descriptions)
- [ ] Test 5 mixed questions (natural blend)
- [ ] Edge case: vague question, off-topic question, very niche industry

**How to test:**
```bash
# Run the full validation script (create test_suite.py with all 15+ queries)
python test_suite.py

# Check each response manually against these criteria:
# - Pure business: no GoDaddy product mentioned
# - GoDaddy: product name matches godaddy_products.json exactly
# - Mixed: advice comes first, product suggestion is soft ("you might also consider")
# - Edge cases: graceful fallback, no hallucination
```