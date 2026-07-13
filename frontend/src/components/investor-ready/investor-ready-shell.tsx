"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import TextLockup from "@ux/text-lockup";
import text from "@ux/text";
import { getFunding, sendChat, type ApiFunding } from "@/services/api";

const USER_ID_KEY = "creatorlevel_user_id";
const PITCH_SESSION = "investor-pitch-session";

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

function PitchGenerator({ userId }: { userId: string | null }) {
  const [input, setInput] = useState("");
  const [pitch, setPitch] = useState("");
  const [generating, setGenerating] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const Paragraph = text.p;
  const Label = text.span;

  async function handleGenerate() {
    if (!input.trim() || generating) return;
    setGenerating(true);
    setPitch("");
    try {
      const prompt = `Generate a punchy 60-second investor pitch for this business. Structure it as: Hook (1 bold sentence) → Problem → Solution → Traction or progress so far → The Ask (funding amount and what it's for). Be direct, confident, and specific. No filler phrases.\n\nBusiness details:\n${input}`;
      const result = await sendChat(prompt, PITCH_SESSION, userId);
      setPitch(result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setPitch("Could not generate pitch — make sure the backend is running.");
    } finally {
      setGenerating(false);
    }
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
            Describe your business below — what you do, who it&apos;s for, your
            traction, and how much you&apos;re raising. The AI will draft a structured
            60-second pitch you can refine and use.
          </Paragraph>
        </TextLockup>

        <Box orientation="vertical" gap="sm">
          <Label as="label" size={0} emphasis="passive">
            Your business details
          </Label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I run a fitness content brand with 40k followers. I create workout plans for busy college students. I've made $8k in the last 3 months through digital product sales. I'm raising $25k to build a subscription app."
            rows={5}
            style={{
              width: "100%",
              border: "1px solid #d6dada",
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 14,
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#00a4a6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#d6dada")}
          />
        </Box>

        <Button
          design="primary"
          text={generating ? "Generating…" : "Generate my pitch"}
          onClick={handleGenerate}
          disabled={generating || !input.trim()}
        />

        {pitch && (
          <Box
            ref={resultRef}
            elevation="sunken"
            rounding="reduced"
            blockPadding="lg"
            inlinePadding="lg"
            className="investor-pitch-result"
          >
            <Box orientation="vertical" gap="sm">
              <Label as="heading" size={-1}>
                Your investor pitch
              </Label>
              <Paragraph
                as="paragraph"
                style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
              >
                {pitch}
              </Paragraph>
              <Button
                design="secondary"
                size="sm"
                text="Generate again"
                onClick={() => { setPitch(""); setInput(""); }}
              />
            </Box>
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
  const Title = text.span;

  useEffect(() => {
    getFunding("investor_ready")
      .then(setFunding)
      .catch(() => setFunding([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box orientation="vertical" gap="md">
      <Title as="heading" size={-1}>
        Funding opportunities
      </Title>

      {loading && (
        <p style={{ color: "#6b7575", fontSize: 14 }}>Loading opportunities…</p>
      )}

      {!loading && funding.length === 0 && (
        <p style={{ color: "#6b7575", fontSize: 14 }}>
          No funding matches found. Make sure the backend is running.
        </p>
      )}

      <div className="investor-funding-grid">
        {funding.map((f) => (
          <FundingCard key={f.id} opportunity={f} />
        ))}
      </div>
    </Box>
  );
}

export function InvestorReadyShell() {
  const [userId, setUserId] = useState<string | null>(null);
  const Heading = text.span;
  const Paragraph = text.p;

  useEffect(() => {
    setUserId(localStorage.getItem(USER_ID_KEY));
  }, []);

  return (
    <div className="investor-page">
      {/* Header */}
      <div className="investor-header">
        <Box
          blockPadding="lg"
          inlinePadding="lg"
          className="investor-header-inner"
        >
          <Button
            design="secondary"
            size="sm"
            text="← Back to dashboard"
            href="/dashboard"
          />

          <Box orientation="vertical" gap="sm" className="investor-hero">
            <div className="investor-stage-badge">Investor Ready</div>
            <Heading as="heading" size={2}>
              Take your business to the next level
            </Heading>
            <Paragraph as="paragraph" emphasis="passive">
              Get legally set up, craft your investor pitch, and find funding
              opportunities matched to your stage.
            </Paragraph>
          </Box>
        </Box>
      </div>

      {/* Content */}
      <Box
        blockPadding="lg"
        inlinePadding="lg"
        orientation="vertical"
        gap="lg"
        className="investor-content"
      >
        <LLCSection />
        <PitchGenerator userId={userId} />
        <FundingSection userId={userId} />
      </Box>
    </div>
  );
}
