"use client";

import { useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import text from "@ux/text";
import Select from "@ux/select";
import { getContentIdeas, type SocialPlatform, type ContentIdea } from "@/services/api";

const Heading = text.h2;
const Body = text.p;

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
];

const WEEK_LABELS = [
  "Brand Story & Introduction",
  "Value & Use Cases",
  "Behind the Scenes & Trust",
  "Promotions & Community",
];

const WEEK_SIZE = 7;

const POST_TYPE_CLASS: Record<string, string> = {
  Photo:    "post-type--photo",
  Carousel: "post-type--carousel",
  Reel:     "post-type--reel",
  Story:    "post-type--story",
};

function groupByWeek(ideas: ContentIdea[]): ContentIdea[][] {
  return ideas.reduce<ContentIdea[][]>((acc, idea, i) => {
    const wi = Math.floor(i / WEEK_SIZE);
    if (!acc[wi]) acc[wi] = [];
    acc[wi].push(idea);
    return acc;
  }, []);
}

interface Props {
  userId: string;
  stage: string;
  creatorType: string;
}

export function ContentIdeas({ userId, stage, creatorType }: Props) {
  const [platform, setPlatform] = useState<SocialPlatform>("instagram");
  const [ideas, setIdeas] = useState<ContentIdea[] | null>(null);
  const [rawPlan, setRawPlan] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([0]));

  const toggleWeek = (i: number) =>
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const handleGenerate = async () => {
    setGenerating(true);
    setIdeas(null);
    setRawPlan(null);
    setIsFallback(false);
    setOpenWeeks(new Set([0]));
    try {
      const result = await getContentIdeas({ user_id: userId, creator_type: creatorType, stage, platform });
      if (result.ideas && result.ideas.length > 0) {
        const fallback = result.ideas[0]?.fallback === true;
        setIsFallback(fallback);
        setIdeas(result.ideas);
      } else if (result.raw) {
        setRawPlan(result.raw);
      }
    } catch {
      setRawPlan("Unable to generate content ideas right now. Try again in a moment.");
    } finally {
      setGenerating(false);
    }
  };

  const weeks = ideas ? groupByWeek(ideas) : [];

  return (
    <Box orientation="vertical" gap="lg">
      <div>
        <Heading as="heading" className="social-section-title">
          30-Day Content Calendar
        </Heading>
        <Body as="paragraph" className="social-section-sub">
          A month of ready-to-post content organized by theme. Each week is a
          standalone content sprint — use them back-to-back or in any order.
        </Body>
      </div>

      <Box orientation="vertical" inlineAlignChildren="start" gap="sm" className="social-generate-row">
        <Select
          id="content-platform"
          label="Platform"
          value={platform}
          options={PLATFORM_OPTIONS}
          onChange={(val: string) => setPlatform(val as SocialPlatform)}
        />
        <Button
          design="primary"
          size="md"
          text={generating ? "Generating…" : "Generate Plan"}
          disabled={generating}
          onClick={handleGenerate}
        />
      </Box>

      {weeks.length > 0 && (
        <div className="social-content-table-wrap">
          <table className="social-content-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Day</th>
                <th style={{ width: 90 }}>Type</th>
                <th style={{ width: "20%" }}>Hook</th>
                <th>Caption</th>
                <th style={{ width: "18%" }}>Hashtags</th>
              </tr>
            </thead>

            {weeks.map((weekIdeas, wi) => {
              const isOpen = openWeeks.has(wi);
              const theme = WEEK_LABELS[wi] ?? `Week ${wi + 1}`;
              const startDay = wi * WEEK_SIZE + 1;
              const endDay = startDay + weekIdeas.length - 1;

              return (
                <tbody key={wi}>
                  <tr
                    className="content-week-header-row"
                    onClick={() => toggleWeek(wi)}
                    aria-expanded={isOpen}
                  >
                    <td colSpan={5} className="content-week-header-cell">
                      <div className="content-week-header-inner">
                        <div className="content-week-header-left">
                          <span className="content-week-number">Week {wi + 1}</span>
                          <span className="content-week-theme">{theme}</span>
                        </div>
                        <div className="content-week-header-right">
                          <span className="content-week-range">Days {startDay}–{endDay}</span>
                          <span className="content-week-chevron" aria-hidden="true">
                            {isOpen ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {isOpen && weekIdeas.map((idea, ri) => {
                    const postType = (idea as Record<string, string>).post_type ?? "";
                    return (
                      <tr key={idea.day} className={`content-data-row${ri % 2 === 1 ? " content-data-row--alt" : ""}`}>
                        <td className="social-day-cell">Day {idea.day}</td>
                        <td>
                          <span className={`post-type-badge ${POST_TYPE_CLASS[postType] ?? ""}`}>
                            {postType}
                          </span>
                        </td>
                        <td className="content-hook-cell">{idea.hook}</td>
                        <td>{idea.caption}</td>
                        <td>
                          <div className="social-hashtag-wrap">
                            {idea.hashtags.map((h) => (
                              <span key={h} className="social-hashtag">{h}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              );
            })}
          </table>
        </div>
      )}

      {rawPlan && (
        <Box blockPadding="md" inlinePadding="md" elevation="raised" rounding="md" className="social-raw-plan">
          <pre className="social-pre">{rawPlan}</pre>
        </Box>
      )}
    </Box>
  );
}
