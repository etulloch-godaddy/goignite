"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import text from "@ux/text";
import Checkbox from "@ux/checkbox";
import Tag from "@ux/tag";
import {
  getMonetizationAdvice,
  getGrowthPlan,
  type SocialPlatform,
  type MonetizationAdvice,
  type GrowthPlanResponse,
} from "@/services/api";

const Heading = text.h2;
const Body = text.p;
const Label = text.span;

const ALL_PLATFORMS: SocialPlatform[] = ["instagram", "tiktok", "facebook"];

interface Props {
  userId: string;
  stage: string;
  creatorType: string;
}

export function GrowthPlan({ userId, stage, creatorType }: Props) {
  const [advice, setAdvice] = useState<MonetizationAdvice | null>(null);
  const [plan, setPlan] = useState<GrowthPlanResponse | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(["instagram"]);
  const [generating, setGenerating] = useState(false);

  const loadAdvice = useCallback(async () => {
    try {
      const data = await getMonetizationAdvice({ user_id: userId, creator_type: creatorType });
      setAdvice(data);
    } catch {
      // silent
    }
  }, [userId, creatorType]);

  useEffect(() => { loadAdvice(); }, [loadAdvice]);

  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleGenerate = async () => {
    if (selectedPlatforms.length === 0) return;
    setGenerating(true);
    setPlan(null);
    try {
      const result = await getGrowthPlan({
        user_id: userId,
        creator_type: creatorType,
        stage,
        platforms: selectedPlatforms,
      });
      setPlan(result);
    } catch {
      setPlan({ plan: "Unable to generate growth plan right now. Try again in a moment." });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box orientation="vertical" gap="xl">
      {/* Monetization Advice */}
      <Box orientation="vertical" gap="md">
        <Heading as="heading" size={3}>Monetization Paths</Heading>
        {!advice && <Body as="paragraph" emphasis="passive">Loading advice…</Body>}
        {advice && (advice as any).fallback === true && (
          <Box blockPadding="sm" inlinePadding="md" elevation="raised" rounding="md" className="social-fallback-notice">
            <Body as="paragraph" emphasis="passive">AI is unavailable — no API key configured. Showing demo data below.</Body>
          </Box>
        )}
        {advice && Array.isArray(advice.monetization_paths) && (
          <div className="social-advice-grid">
            {advice.monetization_paths.map((path, i) => (
              <Box
                key={i}
                orientation="vertical"
                gap="sm"
                blockPadding="md"
                inlinePadding="md"
                elevation="raised"
                rounding="md"
                className="social-advice-card"
              >
                <Box orientation="horizontal" blockAlignChildren="center" gap="sm">
                  <Label as="label" size={1}>{path.method}</Label>
                  {path.available_now && <span style={{ background: "#dcfce7", color: "#166534", fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px" }}>Available now</span>}
                </Box>
                <Body as="paragraph" emphasis="passive">{path.description}</Body>
                <Body as="paragraph">{path.first_step}</Body>
              </Box>
            ))}
          </div>
        )}
      </Box>

      {/* 30-Day Growth Plan */}
      <Box orientation="vertical" gap="md">
        <Heading as="heading" size={3}>30-Day Growth Plan</Heading>
        <Body as="paragraph" emphasis="passive">
          Select your active platforms and get a personalized 30-day action plan.
        </Body>

        <Box orientation="horizontal" gap="md" className="social-platform-checks">
          {ALL_PLATFORMS.map((p) => (
            <Checkbox
              key={p}
              id={`platform-${p}`}
              label={p.charAt(0).toUpperCase() + p.slice(1)}
              checked={selectedPlatforms.includes(p)}
              onChange={() => togglePlatform(p)}
            />
          ))}
        </Box>

        <Button
          design="primary"
          size="md"
          text={generating ? "Generating…" : "Generate Plan"}
          disabled={generating || selectedPlatforms.length === 0}
          onClick={handleGenerate}
        />

        {plan && (plan as any).fallback === true && (
          <Box blockPadding="sm" inlinePadding="md" elevation="raised" rounding="md" className="social-fallback-notice">
            <Body as="paragraph" emphasis="passive">
              AI is unavailable — no API key configured. Showing demo data below.
            </Body>
          </Box>
        )}

        {plan && (
          <Box orientation="vertical" gap="md" blockPadding="md" inlinePadding="md" elevation="raised" rounding="md" className="social-plan-result">
            <Label as="label" size={1}>Your 30-Day Plan</Label>

            {plan.biggest_opportunity && (
              <Box blockPadding="sm" inlinePadding="sm" rounding="sm" className="social-opportunity-box">
                <Label as="label" size={2}>Biggest opportunity</Label>
                <Body as="paragraph">{plan.biggest_opportunity}</Body>
              </Box>
            )}

            {Array.isArray(plan.actions) && plan.actions.map((action) => (
              <Box
                key={action.rank}
                orientation="vertical"
                gap="xs"
                blockPadding="sm"
                inlinePadding="sm"
                rounding="sm"
                className="social-action-card"
              >
                <Box orientation="horizontal" blockAlignChildren="center" gap="sm">
                  <span className="social-action-rank">{action.rank}</span>
                  <Label as="label" size={1}>{action.title}</Label>
                  <Tag emphasis="neutral" size="sm">{action.platform}</Tag>
                </Box>
                <Body as="paragraph" emphasis="passive">{action.why}</Body>
                <Box orientation="horizontal" gap="md" className="social-action-meta">
                  <span className="social-meta-item">⏱ {action.time_estimate}</span>
                  <span className="social-meta-item">📈 {action.expected_impact}</span>
                </Box>
              </Box>
            ))}

            {plan.plan && !plan.actions && (
              <pre className="social-pre">{plan.plan}</pre>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
