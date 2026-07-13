"use client";

import { useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import text from "@ux/text";
import Select from "@ux/select";
import { getContentIdeas, type SocialPlatform, type ContentIdea } from "@/services/api";

const Heading = text.h2;
const Body = text.p;
const Label = text.span;

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
];

interface Props {
  userId: string;
  stage: string;
  creatorType: string;
}

export function ContentIdeas({ userId, stage, creatorType }: Props) {
  const [platform, setPlatform] = useState<SocialPlatform>("instagram");
  const [ideas, setIdeas] = useState<ContentIdea[] | null>(null);
  const [rawPlan, setRawPlan] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setIdeas(null);
    setRawPlan(null);
    try {
      const result = await getContentIdeas({ user_id: userId, creator_type: creatorType, stage, platform });
      if (result.ideas && result.ideas.length > 0) {
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

  return (
    <Box orientation="vertical" gap="lg">
      <Heading as="heading" size={3}>7-Day Content Calendar</Heading>
      <Body as="paragraph" emphasis="passive">
        Get an AI-generated week of content tailored to your niche and platform.
      </Body>

      <Box orientation="horizontal" blockAlignChildren="end" gap="md" className="social-generate-row">
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

      {ideas && (
        <div className="social-content-table-wrap">
          <table className="social-content-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Hook</th>
                <th>Caption</th>
                <th>Hashtags</th>
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea) => (
                <tr key={idea.day}>
                  <td className="social-day-cell">Day {idea.day}</td>
                  <td>{idea.hook}</td>
                  <td>{idea.caption}</td>
                  <td>
                    <div className="social-hashtag-wrap">
                      {idea.hashtags.map((h) => (
                        <span key={h} className="social-hashtag">{h}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rawPlan && (
        <Box blockPadding="md" inlinePadding="md" elevation="raised" rounding="md" className="social-raw-plan">
          <Label as="label" size={2}>Your 7-Day Plan</Label>
          <pre className="social-pre">{rawPlan}</pre>
        </Box>
      )}
    </Box>
  );
}
