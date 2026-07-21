"use client";

import { useEffect, useState } from "react";
import Box from "@ux/box";
import text from "@ux/text";
import { getMonetizationAdvice, type MonetizationAdvice } from "@/services/api";

const Body = text.p;

interface Props {
  userId: string;
  creatorType: string;
}

export function MonetizationPaths({ userId, creatorType }: Props) {
  const [advice, setAdvice] = useState<MonetizationAdvice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMonetizationAdvice({ user_id: userId, creator_type: creatorType })
      .then(setAdvice)
      .catch(() => setAdvice(null))
      .finally(() => setLoading(false));
  }, [userId, creatorType]);

  if (loading) {
    return <div className="monetize-loading">Loading revenue channels…</div>;
  }

  if (!advice) {
    return <div className="monetize-empty">Unable to load revenue channels. Make sure the backend is running.</div>;
  }

  const whereToStart = (advice as Record<string, unknown>).where_to_start as string | undefined;

  return (
    <Box orientation="vertical" gap="lg">
      <div>
        <h2 className="monetize-title">Revenue Channels</h2>
        <p className="monetize-sub">Actionable paths to generate revenue from your business — ranked by what you can start today.</p>
      </div>

      {whereToStart && (
        <div className="monetize-where-banner">
          <span className="monetize-where-label">Where to start</span>
          <p className="monetize-where-text">{whereToStart}</p>
        </div>
      )}

      {(advice as any).fallback === true && (
        <div className="social-fallback-notice">
          AI is unavailable — no API key configured. Showing demo data below.
        </div>
      )}

      <div className="monetize-grid">
        {advice.monetization_paths.map((path, i) => (
          <div key={i} className={`monetize-card ${path.available_now ? "monetize-card--active" : "monetize-card--locked"}`}>
            <div className="monetize-card-header">
              <span className="monetize-card-title">{path.method}</span>
              <span className={`monetize-badge ${path.available_now ? "monetize-badge--now" : "monetize-badge--later"}`}>
                {path.available_now ? "Start now" : "Unlock later"}
              </span>
            </div>

            <Body as="paragraph" className="monetize-card-desc">{path.description}</Body>

            <div className="monetize-first-step">
              <span className="monetize-step-label">First step</span>
              <p className="monetize-step-text">{path.first_step}</p>
            </div>

            {path.programs.length > 0 && (
              <div className="monetize-programs">
                {path.programs.map((p, j) => (
                  <span key={j} className="monetize-program-chip">{p}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Box>
  );
}
