"use client";

import { useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import text from "@ux/text";
import Select from "@ux/select";
import Tag from "@ux/tag";
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

export function SeoTools({ userId, creatorType, niche, businessName }: Props) {
  const normalizedNiche = normalizeCreatorType(creatorType);
  const [activeTool, setActiveTool] = useState<Tool>("bio");

  // Bio state
  const [bioPlatform, setBioPlatform] = useState<SocialPlatform>("instagram");
  const [bio, setBio] = useState("");
  const [bioResult, setBioResult] = useState<SeoProfileResponse | null>(null);
  const [bioLoading, setBioLoading] = useState(false);

  // Keywords state
  const [kwPlatform, setKwPlatform] = useState<SocialPlatform>("instagram");
  const [kwResult, setKwResult] = useState<SeoKeywordsResponse | null>(null);
  const [kwLoading, setKwLoading] = useState(false);

  // Caption state
  const [captionPlatform, setCaptionPlatform] = useState<SocialPlatform>("instagram");
  const [caption, setCaption] = useState("");
  const [captionResult, setCaptionResult] = useState<SeoContentResponse | null>(null);
  const [captionLoading, setCaptionLoading] = useState(false);

  const handleBioAnalyze = async () => {
    if (!bio.trim()) return;
    setBioLoading(true);
    setBioResult(null);
    try {
      setBioResult(await analyzeSeoProfile({ user_id: userId, platform: bioPlatform, bio, creator_type: normalizedNiche }));
    } catch {
      setBioResult({ score: 0, feedback: "Analysis unavailable.", rewrite: bio });
    } finally {
      setBioLoading(false);
    }
  };

  const handleKeywords = async () => {
    setKwLoading(true);
    setKwResult(null);
    try {
      setKwResult(await getSeoKeywords(normalizedNiche, kwPlatform, niche, businessName));
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
    try {
      setCaptionResult(await optimizeSeoContent({ user_id: userId, platform: captionPlatform, content: caption, creator_type: normalizedNiche }));
    } catch {
      setCaptionResult({ optimized: caption, tips: ["Optimization unavailable."] });
    } finally {
      setCaptionLoading(false);
    }
  };

  const tool = TOOLS.find((t) => t.id === activeTool)!;

  return (
    <Box orientation="vertical" gap="lg">

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
                    <span>✨ Suggested rewrite</span>
                    <button
                      type="button"
                      className="seo-copy-btn"
                      onClick={() => navigator.clipboard.writeText(bioResult.rewrite)}
                    >
                      Copy
                    </button>
                  </div>
                  <p className="seo-rewrite-text">{bioResult.rewrite}</p>
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
                      {kw.relevance && <Tag emphasis="neutral" size="sm">{kw.relevance}</Tag>}
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

            {captionResult && (
              <Box orientation="vertical" gap="md" className="seo-result-panel">
                <div className="seo-rewrite-block">
                  <div className="seo-rewrite-label">
                    <span>✨ Optimized caption</span>
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

                {captionResult.tips.length > 0 && (
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
