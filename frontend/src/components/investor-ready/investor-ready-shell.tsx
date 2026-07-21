"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import TextLockup from "@ux/text-lockup";
import text from "@ux/text";
import ArrowLeftIcon from "@ux/icon/arrow-left";
import ShieldCheckIcon from "@ux/icon/shield-check";
import SparklesFilledIcon from "@ux/icon/sparkles-filled";
import { generatePitch, getFunding, getOrCreateUserId, type ApiFunding, type PitchOutline, type PitchSlide } from "@/services/api";
import { CongratsAnimation } from "./congrats-animation";


const FUNDING_TYPE_LABELS: Record<string, string> = {
  grant: "Grant",
  creator_fund: "Creator Fund",
  accelerator: "Accelerator",
  angel: "Angel",
  revenue_based: "Revenue-Based",
  competition: "Competition",
};

function LLCSection() {
  const Heading = text.span;
  const Paragraph = text.p;

  return (
    <Box orientation="vertical" gap="md" className="investor-section">
      <span className="investor-section-icon">
        <ShieldCheckIcon width={22} height={22} />
      </span>

      <Heading as="heading" size={0} className="investor-section-title">
        Make it official — form your LLC
      </Heading>

      <Paragraph as="paragraph" emphasis="passive">
        An LLC protects your personal assets and shows investors you&apos;re a real
        business. GoDaddy handles the filing and compliance.
      </Paragraph>

      <Box orientation="horizontal" gap="sm" wrap className="investor-section-footer">
        <Button
          design="primary"
          text="Form your LLC with GoDaddy"
          href="https://www.godaddy.com/airo/register-llc"
          target="_blank"
        />
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


function PitchGenerator({ userId }: { userId: string | null }) {
  const [outline, setOutline] = useState<PitchOutline | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const Paragraph = text.p;
  const Label = text.span;
  const Heading = text.span;

  async function handleGenerate() {
    if (!userId) {
      setError("No user session found. Please refresh the page.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await generatePitch(userId);
      setOutline(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Pitch generation failed. Make sure the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box orientation="vertical" gap="md" className="investor-section">
      <span className="investor-section-icon">
        <SparklesFilledIcon width={22} height={22} />
      </span>

      <Heading as="heading" size={0} className="investor-section-title">
        Investor pitch generator
      </Heading>

      <Paragraph as="paragraph" emphasis="passive">
        Generate a structured 8-slide pitch deck from your business profile and
        milestones.
      </Paragraph>

      <Box orientation="vertical" gap="md" className="investor-section-footer">
        {!outline && (
          <Box orientation="vertical" gap="sm">
            <Box orientation="horizontal" gap="sm" wrap>
              <Button
                design="primary"
                text={loading ? "Generating…" : "Generate Pitch"}
                onClick={handleGenerate}
                disabled={loading}
              />
            </Box>
            {error && (
              <Paragraph as="paragraph" size={-1} style={{ color: "var(--color-error, #c0392b)" }}>
                {error}
              </Paragraph>
            )}
          </Box>
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

            <Box orientation="horizontal" gap="sm" wrap>
              <Button
                design="secondary"
                size="sm"
                text={loading ? "Regenerating…" : "Regenerate"}
                onClick={handleGenerate}
                disabled={loading}
              />
            </Box>
            {error && (
              <Paragraph as="paragraph" size={-1} style={{ color: "var(--color-error, #c0392b)" }}>
                {error}
              </Paragraph>
            )}
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

        <Paragraph
          as="paragraph"
          emphasis="passive"
          size={-1}
          className="investor-funding-desc"
        >
          {opportunity.description}
        </Paragraph>

        <Box orientation="vertical" gap="sm">
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
          className="investor-funding-cta"
        />
      </Box>
    </Box>
  );
}

function FundingSection({ userId }: { userId: string | null }) {
  const [funding, setFunding] = useState<ApiFunding[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const Paragraph = text.p;

  useEffect(() => {
    getFunding("investor_ready", undefined, userId ?? undefined)
      .then((res) => {
        setFunding(res.opportunities);
        setIsFallback(res.fallback);
      })
      .catch(() => setFunding([]))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <Box className="investor-section">
      <Box orientation="vertical" gap="md">
        <TextLockup title="Funding opportunities" size="lg" textMaxWidth={false}>
          <Paragraph as="paragraph" emphasis="passive">
            Grants, creator funds, and accelerators matched to your stage.
          </Paragraph>
        </TextLockup>

        {loading && (
          <Paragraph as="paragraph" emphasis="passive" size={-1}>Loading opportunities…</Paragraph>
        )}

        {!loading && isFallback && (
          <div className="social-fallback-notice">
            AI is unavailable — no API key configured. Showing demo data below.
          </div>
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
  const [showCongrats, setShowCongrats] = useState(true);
  const Heading = text.span;
  const Paragraph = text.p;

  useEffect(() => {
    getOrCreateUserId().then(setUserId).catch(() => setUserId(null));
  }, []);

  return (
    <div className="investor-page">
      {showCongrats && (
        <CongratsAnimation onDismiss={() => setShowCongrats(false)} />
      )}
      {/* Header — title + LLC + pitch inline */}
      <div className="investor-header">
        <Box blockPadding="lg" inlinePadding="lg" className="investor-header-inner">
          <Button
            design="inline"
            size="sm"
            href="/dashboard"
            className="investor-back-link"
            style={{ alignSelf: "flex-start" }}
          >
            <ArrowLeftIcon width={16} height={16} />
            <span>Back to dashboard</span>
          </Button>

          <Box orientation="vertical" gap="sm" className="investor-hero">
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
        </Box>
      </div>

      {/* Funding cards — 4 per row */}
      <Box blockPadding="lg" inlinePadding="lg" orientation="vertical" gap="lg" className="investor-content">
        <FundingSection userId={userId} />
      </Box>
    </div>
  );
}
