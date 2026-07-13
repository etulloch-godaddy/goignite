"use client";

import Box from "@ux/box";
import Card from "@ux/card";
import Tag from "@ux/tag";
import text from "@ux/text";
import type { AchievementPreview } from "@/lib/dashboard-data";
import { DashboardSection } from "./dashboard-section";

const CATEGORY_LABELS: Record<string, string> = {
  business_setup: "Setup",
  funding: "Funding",
  monetization: "Earnings",
  stage_milestone: "Milestone",
};

function AchievementItem({ achievement }: { achievement: AchievementPreview }) {
  const Title = text.span;
  const Caption = text.span;
  const date = new Date(achievement.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <Box
      elevation="card"
      rounding="reduced"
      blockPadding="sm"
      inlinePadding="sm"
      orientation="vertical"
      gap="sm"
    >
      <Box
        orientation="horizontal"
        inlineAlignChildren="start"
        blockAlignChildren="start"
        gap="sm"
      >
        <Box orientation="vertical" gap="sm" stretch>
          <Title as="label">{achievement.title}</Title>
          <Caption as="caption" emphasis="passive">
            {achievement.impact}
          </Caption>
        </Box>
        <Tag emphasis="success" size="sm">
          {CATEGORY_LABELS[achievement.category] ?? achievement.category}
        </Tag>
      </Box>
      <Caption as="caption" emphasis="passive">
        {date}
      </Caption>
    </Box>
  );
}

export function AchievementsPanel({
  achievements,
}: {
  achievements: AchievementPreview[];
}) {
  const Paragraph = text.p;

  return (
    <DashboardSection id="achievements" gap="sm">
      <Card
        title="Recent wins"
        description={
          <Paragraph as="paragraph" emphasis="passive">
            Every mission you finish shows up here — proof you&apos;re building
            something real.
          </Paragraph>
        }
      >
        {achievements.length === 0 ? (
          <Paragraph as="paragraph" emphasis="passive">
            Complete your first mission to earn an achievement.
          </Paragraph>
        ) : (
          <Box orientation="vertical" gap="sm">
            {achievements.slice(0, 5).map((achievement) => (
              <AchievementItem
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </Box>
        )}
      </Card>
    </DashboardSection>
  );
}
