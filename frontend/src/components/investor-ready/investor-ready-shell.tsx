"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import TextLockup from "@ux/text-lockup";
import text from "@ux/text";
import { getFunding, getOrCreateUserId, type ApiFunding, type PitchOutline, type PitchSlide } from "@/services/api";


const FUNDING_TYPE_LABELS: Record<string, string> = {
  grant: "Grant",
  creator_fund: "Creator Fund",
  accelerator: "Accelerator",
  angel: "Angel",
  revenue_based: "Revenue-Based",
  competition: "Competition",
};

function LLCSection() {
  const Paragraph = text.p;

  return (
    <Box
      elevation="raised"
      rounding="reduced"
      blockPadding="lg"
      inlinePadding="lg"
      className="investor-section"
    >
      <Box orientation="vertical" gap="md">
        <TextLockup
          title="Make it official — form your LLC"
          size="lg"
          textMaxWidth={false}
        >
          <Paragraph as="paragraph" emphasis="passive">
            Investors and partners check whether you're a real legal entity before they
            write a check. Forming an LLC takes about 10 minutes, costs as little as
            $50–$100 in most states, and separates your personal assets from your
            business. GoDaddy handles the filing, registered agent, and annual
            compliance so you can focus on building.
          </Paragraph>
        </TextLockup>

        <Box orientation="horizontal" gap="sm" wrap>
          <div className="investor-benefit-tag">✓ Liability protection</div>
          <div className="investor-benefit-tag">✓ Credibility with investors</div>
          <div className="investor-benefit-tag">✓ Tax flexibility</div>
          <div className="investor-benefit-tag">✓ Professional contracts</div>
        </Box>

        <Box orientation="horizontal" gap="md" wrap>
          <Button
            design="primary"
            text="Form your LLC with GoDaddy"
            href="https://www.godaddy.com/business/llc"
            target="_blank"
          />
          <Button
            design="secondary"
            text="Learn more about LLCs"
            href="https://www.godaddy.com/resources/skills/what-is-an-llc"
            target="_blank"
          />
        </Box>
      </Box>
    </Box>
  );
}

function SlideCard({ slide }: { slide: PitchSlide }) {
  const Label = text.span;
  const Paragraph = text.p;

  return (
    <div className="pitch-slide-card">
      <div className="pitch-slide-number">{slide.slide_number}</div>
      <div className="pitch-slide-body">
        <Label as="heading" size={-1} className="pitch-slide-title">
          {slide.title}
        </Label>
        <Paragraph as="paragraph" style={{ fontWeight: 600, marginBottom: 8 }}>
          {slide.headline}
        </Paragraph>
        <ul className="pitch-slide-points">
          {slide.key_points.map((pt, i) => (
            <li key={i}>{pt}</li>
          ))}
        </ul>
        {slide.speaker_notes && (
          <p className="pitch-slide-notes">&ldquo;{slide.speaker_notes}&rdquo;</p>
        )}
      </div>
    </div>
  );
}

const DEMO_PITCH: PitchOutline = {
  deck_title: "Abuela's Fire — Investor Brief",
  tagline: "Grandma's hot sauce recipe, bottled for the world.",
  funding_ask: "Seeking $40,000 seed round",
  slides: [
    {
      slide_number: 1,
      title: "Cover",
      headline: "Abuela's Fire",
      key_points: [
        "Founded by Valentina Reyes — food creator, 18,000 followers and growing",
        "Small-batch hot sauce rooted in a 60-year-old family recipe from Oaxaca",
        "From TikTok kitchen to 3 local retailers in 8 months",
      ],
      speaker_notes: "Hi, I'm Valentina. Abuela's Fire started the day I filmed myself making my grandmother's hot sauce and 200,000 people watched it overnight. That's when I knew this was bigger than a recipe.",
    },
    {
      slide_number: 2,
      title: "The Problem",
      headline: "The hot sauce shelf is full — but none of it has a real story behind it.",
      key_points: [
        "Mass-market hot sauces dominate shelves but taste identical and lack authenticity",
        "Consumers are actively seeking food with cultural roots and a human face behind it",
        "Independent sauce makers can't scale past farmers markets without capital",
      ],
      speaker_notes: "Walk down any condiment aisle and you'll see the same five brands. Shoppers are bored. They're buying craft hot sauce at three times the price because it means something.",
    },
    {
      slide_number: 3,
      title: "The Solution",
      headline: "Abuela's Fire: authentic Oaxacan hot sauce sold direct and through retail, backed by a creator audience.",
      key_points: [
        "Three SKUs: Original, Smoky Morita, and Seasonal — all small-batch, preservative-free",
        "DTC via abuelasfire.com + retail placement in 3 local specialty grocery stores",
        "Creator-led marketing: Valentina's TikTok and Instagram drive organic demand before any ad spend",
      ],
      speaker_notes: "We're not starting from zero — we already have 18,000 people who've watched Valentina cook. Every new video is a product launch. The content IS the marketing budget.",
    },
    {
      slide_number: 4,
      title: "Market Opportunity",
      headline: "The US hot sauce market is $1.65B and growing 6% per year — craft is the fastest segment.",
      key_points: [
        "$1.65B total US hot sauce market; craft and artisan segment growing at 12% annually",
        "Hispanic food culture is mainstream — 68% of non-Hispanic Americans cook with Latin ingredients weekly",
        "Creator-commerce food brands (Fly By Jing, TRUFF) have proven the playbook at $10M+ ARR",
      ],
      speaker_notes: "Hot sauce is no longer a niche condiment. It's a $1.65 billion staple, and the fastest-growing slice is exactly what we make — authentic, story-driven, small-batch.",
    },
    {
      slide_number: 5,
      title: "Traction",
      headline: "18,000 followers, 3 retail doors, first revenue — bootstrapped in under a year.",
      key_points: [
        "18,000 social followers; one TikTok video reached 200,000 views organically",
        "Listed in 3 local specialty retailers; first wholesale purchase orders received",
        "DTC store live; first online orders shipped within 60 days of launch",
      ],
      speaker_notes: "Everything you see was built without outside capital. A co-packer, a registered business, a live website, and paying wholesale customers. The foundation is real.",
    },
    {
      slide_number: 6,
      title: "Business Model",
      headline: "DTC at 68% margin + wholesale at 42% margin + creator brand deals.",
      key_points: [
        "DTC: $12 per bottle, 68% gross margin — highest-value channel",
        "Wholesale: $6.50/bottle to retailers, 42% margin — volume and shelf presence",
        "Brand partnerships: food and lifestyle deals at 18K followers ($800–$2,500/post)",
      ],
      speaker_notes: "Three revenue streams that reinforce each other. Content drives DTC. DTC proves demand to retailers. Retail builds legitimacy for bigger brand deals. It compounds.",
    },
    {
      slide_number: 7,
      title: "Financials & Ask",
      headline: "Seeking $40,000 to reach 20 retail doors and $150,000 revenue by month 18.",
      key_points: [
        "$20,000 → co-packing scale-up: 5,000-bottle run (reduces COGS by 30%)",
        "$12,000 → regional retail broker + food show entry fees for 20-door expansion",
        "$8,000 → LLC via GoDaddy Airo, food safety certifications, and working capital",
      ],
      speaker_notes: "This isn't speculative. We have purchase orders waiting and a retailer who asked us to come back when we can supply 200 units a month. This raise fulfills demand that already exists.",
    },
    {
      slide_number: 8,
      title: "Next Steps",
      headline: "20 retail doors by Q3. Techstars Food & Bev application in. LLC registered.",
      key_points: [
        "LLC registered via GoDaddy Airo — investor-ready entity, ready to receive funds",
        "Techstars Food & Beverage accelerator application submitted for spring cohort",
        "Letter of intent from regional distributor covering TX, NM, and AZ — pending this raise",
      ],
      speaker_notes: "My grandmother made this sauce for 60 years and gave it away for free. It's time the world gets to taste it — and she gets the credit she deserves. Let's build this together.",
    },
  ],
};

function PitchGenerator({ userId: _userId }: { userId: string | null }) {
  const [outline, setOutline] = useState<PitchOutline | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const Paragraph = text.p;
  const Label = text.span;

  function handleGenerate() {
    setOutline(DEMO_PITCH);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  return (
    <Box
      elevation="raised"
      rounding="reduced"
      blockPadding="lg"
      inlinePadding="lg"
      className="investor-section"
    >
      <Box orientation="vertical" gap="md">
        <TextLockup title="Investor pitch generator" size="lg" textMaxWidth={false}>
          <Paragraph as="paragraph" emphasis="passive">
            Generates a structured 8-slide pitch deck based on your business profile and milestones.
          </Paragraph>
        </TextLockup>

        {!outline && (
          <Button
            design="primary"
            text="Generate Pitch"
            onClick={handleGenerate}
          />
        )}

        {outline && (
          <Box ref={resultRef} orientation="vertical" gap="md">
            <Box orientation="vertical" gap="xs">
              <Label as="heading" size={1} style={{ display: "block" }}>
                {outline.deck_title}
              </Label>
              <Paragraph as="paragraph" emphasis="passive">
                {outline.tagline}
              </Paragraph>
              <div className="investor-funding-type-badge" style={{ display: "inline-block" }}>
                {outline.funding_ask}
              </div>
            </Box>

            <div className="pitch-slides-list">
              {outline.slides.map((slide) => (
                <SlideCard key={slide.slide_number} slide={slide} />
              ))}
            </div>

            <Button
              design="secondary"
              size="sm"
              text="Regenerate"
              onClick={handleGenerate}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

function FundingCard({ opportunity }: { opportunity: ApiFunding }) {
  const Title = text.span;
  const Paragraph = text.p;

  return (
    <Box
      elevation="raised"
      rounding="reduced"
      blockPadding="lg"
      inlinePadding="lg"
      className="investor-funding-card"
    >
      <Box orientation="vertical" gap="sm">
        <Box orientation="horizontal" gap="sm" inlineAlignChildren="center">
          <div className="investor-funding-type-badge">
            {FUNDING_TYPE_LABELS[opportunity.type] ?? opportunity.type}
          </div>
        </Box>

        <Title as="heading" size={0}>
          {opportunity.name}
        </Title>

        <Paragraph as="paragraph" emphasis="passive" size={-1}>
          {opportunity.description}
        </Paragraph>

        <Box orientation="horizontal" gap="md" wrap>
          <div className="investor-funding-stat">
            <span className="investor-funding-stat-label">Amount</span>
            <span className="investor-funding-stat-value">{opportunity.amount}</span>
          </div>
          <div className="investor-funding-stat">
            <span className="investor-funding-stat-label">Deadline</span>
            <span className="investor-funding-stat-value">{opportunity.deadline}</span>
          </div>
        </Box>

        <Button
          design="secondary"
          size="sm"
          text="View opportunity"
          href={opportunity.application_url}
          target="_blank"
        />
      </Box>
    </Box>
  );
}

function FundingSection({ userId }: { userId: string | null }) {
  const [funding, setFunding] = useState<ApiFunding[]>([]);
  const [loading, setLoading] = useState(true);
  const Paragraph = text.p;

  useEffect(() => {
    getFunding("investor_ready")
      .then(setFunding)
      .catch(() => setFunding([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box
      elevation="raised"
      rounding="reduced"
      blockPadding="lg"
      inlinePadding="lg"
      className="investor-section"
    >
      <Box orientation="vertical" gap="md">
        <TextLockup title="Funding opportunities" size="lg" textMaxWidth={false}>
          <Paragraph as="paragraph" emphasis="passive">
            Grants, creator funds, and accelerators matched to your stage.
          </Paragraph>
        </TextLockup>

        {loading && (
          <Paragraph as="paragraph" emphasis="passive" size={-1}>Loading opportunities…</Paragraph>
        )}

        {!loading && funding.length === 0 && (
          <Paragraph as="paragraph" emphasis="passive" size={-1}>
            No funding matches found. Make sure the backend is running.
          </Paragraph>
        )}

        <div className="investor-funding-grid">
          {funding.map((f) => (
            <FundingCard key={f.id} opportunity={f} />
          ))}
        </div>
      </Box>
    </Box>
  );
}

export function InvestorReadyShell() {
  const [userId, setUserId] = useState<string | null>(null);
  const Heading = text.span;
  const Paragraph = text.p;

  useEffect(() => {
    getOrCreateUserId().then(setUserId).catch(() => setUserId(null));
  }, []);

  return (
    <div className="investor-page">
      {/* Header — title + LLC + pitch inline */}
      <div className="investor-header">
        <Box blockPadding="lg" inlinePadding="lg" className="investor-header-inner">
          <Button design="secondary" size="sm" text="← Back to dashboard" href="/dashboard" />

          <div className="investor-header-row">
            <Box orientation="vertical" gap="sm" className="investor-hero">
              <div className="investor-stage-badge">Investor Ready</div>
              <Heading as="heading" size={2}>
                Take your business to the next level
              </Heading>
              <Paragraph as="paragraph" emphasis="passive">
                Get legally set up, craft your pitch, and find funding matched to your stage.
              </Paragraph>
            </Box>

            <div className="investor-header-actions">
              <LLCSection />
              <PitchGenerator userId={userId} />
            </div>
          </div>
        </Box>
      </div>

      {/* Funding cards — 4 per row */}
      <Box blockPadding="lg" inlinePadding="lg" orientation="vertical" gap="lg" className="investor-content">
        <FundingSection userId={userId} />
      </Box>
    </div>
  );
}
