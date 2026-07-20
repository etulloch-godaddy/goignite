"use client";

import { useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import text from "@ux/text";
import Select from "@ux/select";
import {
  analyzeSeoProfile,
  optimizeSeoContent,
  getSeoKeywords,
  type SocialPlatform,
  type SeoProfileResponse,
  type SeoKeywordsResponse,
  type SeoContentResponse,
} from "@/services/api";

const Body = text.p;
const Label = text.span;

const VALID_CREATOR_TYPES = ["fashion", "gaming", "fitness", "art", "food"] as const;
function normalizeCreatorType(raw: string): string {
  const lower = raw.toLowerCase();
  return VALID_CREATOR_TYPES.find((t) => lower.includes(t)) ?? "fashion";
}

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
];

type Tool = "bio" | "keywords" | "caption";

const TOOLS: { id: Tool; label: string; description: string }[] = [
  { id: "bio",      label: "Bio Score",      description: "Score your bio and get an AI-optimized rewrite" },
  { id: "keywords", label: "Keywords",        description: "Top ranked keywords for your niche and platform" },
  { id: "caption",  label: "Caption Boost",  description: "Rewrite a caption for maximum discoverability" },
];

interface Props {
  userId: string;
  creatorType: string;
  niche?: string;
  businessName?: string;
}

export function SeoTools({ userId, creatorType, niche: nicheProp, businessName: businessNameProp }: Props) {
  const normalizedNiche = creatorType;
  const [activeTool, setActiveTool] = useState<Tool>("bio");

  // Shared context inputs — user can override what was inferred from questionnaire
  const [localBusinessName, setLocalBusinessName] = useState(
    businessNameProp && businessNameProp !== "My Business" ? businessNameProp : ""
  );
  const [localNiche, setLocalNiche] = useState(nicheProp ?? "");

  // Bio state
  const [bioPlatform, setBioPlatform] = useState<SocialPlatform>("instagram");
  const [bio, setBio] = useState("");
  const [bioResult, setBioResult] = useState<SeoProfileResponse | null>(null);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioFallback, setBioFallback] = useState(false);

  // Keywords state
  const [kwPlatform, setKwPlatform] = useState<SocialPlatform>("instagram");
  const [kwResult, setKwResult] = useState<SeoKeywordsResponse | null>(null);
  const [kwLoading, setKwLoading] = useState(false);
  const [kwFallback, setKwFallback] = useState(false);

  // Caption state
  const [captionPlatform, setCaptionPlatform] = useState<SocialPlatform>("instagram");
  const [caption, setCaption] = useState("");
  const [captionResult, setCaptionResult] = useState<SeoContentResponse | null>(null);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [captionFallback, setCaptionFallback] = useState(false);

  const handleBioAnalyze = async () => {
    if (!bio.trim()) return;
    setBioLoading(true);
    setBioResult(null);
    setBioFallback(false);
    try {
      const result = await analyzeSeoProfile({
        user_id: userId, platform: bioPlatform, bio,
        creator_type: normalizedNiche, business_name: localBusinessName || undefined, niche: localNiche || undefined,
      });
      setBioFallback(result.fallback === true);
      setBioResult(result);
    } catch {
      setBioResult({ score: 0, feedback: "Analysis unavailable.", rewrite: bio });
    } finally {
      setBioLoading(false);
    }
  };

  const handleKeywords = async () => {
    setKwLoading(true);
    setKwResult(null);
    setKwFallback(false);
    try {
      const result = await getSeoKeywords(normalizedNiche, kwPlatform, localNiche || undefined, localBusinessName || undefined);
      setKwFallback((result as any).fallback === true);
      setKwResult(result);
    } catch {
      setKwResult({ keywords: [] });
    } finally {
      setKwLoading(false);
    }
  };

  const handleCaptionOptimize = async () => {
    if (!caption.trim()) return;
    setCaptionLoading(true);
    setCaptionResult(null);
    setCaptionFallback(false);
    try {
      const result = await optimizeSeoContent({
        user_id: userId, platform: captionPlatform, content: caption,
        creator_type: normalizedNiche, business_name: localBusinessName || undefined, niche: localNiche || undefined,
      });
      setCaptionFallback(result.fallback === true);
      setCaptionResult(result);
    } catch {
      setCaptionResult({ optimized: caption, tips: ["Optimization unavailable."] });
    } finally {
      setCaptionLoading(false);
    }
  };

  const tool = TOOLS.find((t) => t.id === activeTool)!;

  return (
    <Box orientation="vertical" gap="lg">

      {/* Business context — used by all tools for personalization */}
      <div className="seo-context-row">
        <div className="seo-context-field">
          <label className="seo-context-label" htmlFor="seo-biz-name">Business name</label>
          <input
            id="seo-biz-name"
            className="seo-context-input"
            type="text"
            placeholder="e.g. Fuego Hot Sauce Co."
            value={localBusinessName}
            onChange={(e) => setLocalBusinessName(e.target.value)}
          />
        </div>
        <div className="seo-context-field">
          <label className="seo-context-label" htmlFor="seo-niche">Your niche / product</label>
          <input
            id="seo-niche"
            className="seo-context-input"
            type="text"
            placeholder="e.g. small-batch hot sauce"
            value={localNiche}
            onChange={(e) => setLocalNiche(e.target.value)}
          />
        </div>
      </div>

      {/* Tool picker */}
      <div className="seo-picker">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`seo-picker-btn${activeTool === t.id ? " seo-picker-btn--active" : ""}`}
            onClick={() => setActiveTool(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Workspace */}
      <Box orientation="vertical" gap="lg" blockPadding="lg" inlinePadding="lg" elevation="raised" rounding="lg" className="seo-workspace">

        {/* Header */}
        <div>
          <Label as="label" size={1} className="seo-tool-title">{tool.label}</Label>
          <Body as="paragraph" emphasis="passive" className="seo-tool-desc">{tool.description}</Body>
        </div>

        {/* Bio Score */}
        {activeTool === "bio" && (
          <Box orientation="vertical" gap="md">
            <Box orientation="horizontal" gap="md" blockAlignChildren="end" className="seo-controls">
              <Select id="bio-platform" label="Platform" value={bioPlatform} options={PLATFORM_OPTIONS}
                onChange={(v: string) => setBioPlatform(v as SocialPlatform)} />
              <Button design="primary" size="md"
                text={bioLoading ? "Analyzing…" : "Analyze"}
                disabled={bioLoading || !bio.trim()}
                onClick={handleBioAnalyze} />
            </Box>
            <textarea className="seo-textarea" placeholder="Paste your current bio here…" rows={4}
              value={bio} onChange={(e) => setBio(e.target.value)} />

            {bioFallback && (
              <Box blockPadding="sm" inlinePadding="md" elevation="raised" rounding="md" className="social-fallback-notice">
                <Body as="paragraph" emphasis="passive">AI is unavailable — no API key configured. Showing demo data below.</Body>
              </Box>
            )}
            {bioResult && (
              <Box orientation="vertical" gap="md" className="seo-result-panel">
                {/* Score bar */}
                <div className="seo-score-row">
                  <span className="seo-score-label">SEO Score</span>
                  <div className="seo-score-bar-track">
                    <div
                      className={`seo-score-bar-fill ${bioResult.score >= 70 ? "seo-bar--good" : bioResult.score >= 40 ? "seo-bar--ok" : "seo-bar--low"}`}
                      style={{ width: `${bioResult.score}%` }}
                    />
                  </div>
                  <span className={`seo-score-num ${bioResult.score >= 70 ? "seo-score--good" : bioResult.score >= 40 ? "seo-score--ok" : "seo-score--low"}`}>
                    {bioResult.score}/100
                  </span>
                </div>

                <Body as="paragraph">{bioResult.feedback}</Body>

                <div className="seo-rewrite-block">
                  <div className="seo-rewrite-label">
                    <span>Suggested rewrite</span>
                    <button
                      type="button"
                      className="seo-copy-btn"
                      onClick={() => navigator.clipboard.writeText((bioResult as Record<string, string>).rewritten_bio ?? bioResult.rewrite)}
                    >
                      Copy
                    </button>
                  </div>
                  <p className="seo-rewrite-text">{(bioResult as Record<string, string>).rewritten_bio ?? bioResult.rewrite}</p>
                </div>
              </Box>
            )}
          </Box>
        )}

        {/* Keywords */}
        {activeTool === "keywords" && (
          <Box orientation="vertical" gap="md">
            <Box orientation="horizontal" gap="md" blockAlignChildren="end" className="seo-controls">
              <Select id="kw-platform" label="Platform" value={kwPlatform} options={PLATFORM_OPTIONS}
                onChange={(v: string) => setKwPlatform(v as SocialPlatform)} />
              <Button design="primary" size="md"
                text={kwLoading ? "Loading…" : "Get Keywords"}
                disabled={kwLoading}
                onClick={handleKeywords} />
            </Box>

            {kwFallback && (
              <Box blockPadding="sm" inlinePadding="md" elevation="raised" rounding="md" className="social-fallback-notice">
                <Body as="paragraph" emphasis="passive">AI is unavailable — no API key configured. Showing demo data below.</Body>
              </Box>
            )}
            {kwResult && (
              <Box orientation="vertical" gap="sm" className="seo-result-panel">
                {kwResult.keywords.length === 0 && (
                  <Body as="paragraph" emphasis="passive">No keywords found.</Body>
                )}
                <div className="seo-keyword-grid">
                  {kwResult.keywords.map((kw, i) => (
                    <div key={i} className="seo-keyword-chip">
                      <span className="seo-kw-rank">#{i + 1}</span>
                      <span className="seo-kw-text">{kw.keyword}</span>
                    </div>
                  ))}
                </div>
              </Box>
            )}
          </Box>
        )}

        {/* Caption */}
        {activeTool === "caption" && (
          <Box orientation="vertical" gap="md">
            <Box orientation="horizontal" gap="md" blockAlignChildren="end" className="seo-controls">
              <Select id="caption-platform" label="Platform" value={captionPlatform} options={PLATFORM_OPTIONS}
                onChange={(v: string) => setCaptionPlatform(v as SocialPlatform)} />
              <Button design="primary" size="md"
                text={captionLoading ? "Optimizing…" : "Optimize"}
                disabled={captionLoading || !caption.trim()}
                onClick={handleCaptionOptimize} />
            </Box>
            <textarea className="seo-textarea" placeholder="Paste your caption here…" rows={4}
              value={caption} onChange={(e) => setCaption(e.target.value)} />

            {captionFallback && (
              <Box blockPadding="sm" inlinePadding="md" elevation="raised" rounding="md" className="social-fallback-notice">
                <Body as="paragraph" emphasis="passive">AI is unavailable — no API key configured. Showing demo data below.</Body>
              </Box>
            )}
            {captionResult && (
              <Box orientation="vertical" gap="md" className="seo-result-panel">
                <div className="seo-rewrite-block">
                  <div className="seo-rewrite-label">
                    <span>Optimized caption</span>
                    <button
                      type="button"
                      className="seo-copy-btn"
                      onClick={() => navigator.clipboard.writeText(captionResult.optimized)}
                    >
                      Copy
                    </button>
                  </div>
                  <p className="seo-rewrite-text">{captionResult.optimized}</p>
                </div>

                {(captionResult as Record<string, unknown>).explanation && (
                  <div className="seo-tips">
                    <span className="seo-tips-label">What changed</span>
                    <p style={{ fontSize: "0.875rem", color: "#444", margin: 0, lineHeight: 1.6 }}>
                      {(captionResult as Record<string, string>).explanation}
                    </p>
                  </div>
                )}

                {Array.isArray((captionResult as Record<string, unknown>).keywords_added) && ((captionResult as Record<string, string[]>).keywords_added).length > 0 && (
                  <div className="seo-keyword-grid">
                    {((captionResult as Record<string, string[]>).keywords_added).map((kw, i) => (
                      <div key={i} className="seo-keyword-chip">
                        <span className="seo-kw-text">#{kw}</span>
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(captionResult.tips) && captionResult.tips.length > 0 && (
                  <div className="seo-tips">
                    <span className="seo-tips-label">Tips</span>
                    <ul className="seo-tips-list">
                      {captionResult.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
