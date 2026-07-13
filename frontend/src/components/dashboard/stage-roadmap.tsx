"use client";

import Box from "@ux/box";
import ProgressSteps from "@ux/progress-steps";
import Tag from "@ux/tag";
import text from "@ux/text";
import type { StageStep } from "@/lib/dashboard-data";
import { DashboardSection } from "./dashboard-section";
import { SectionHeader } from "./section-header";

export function StageRoadmap({ stages }: { stages: StageStep[] }) {
  const Paragraph = text.p;
  const current = stages.find((stage) => stage.status === "current");

  return (
    <DashboardSection id="roadmap">
      <SectionHeader
        title="Your path"
        description="Level up one stage at a time — no overwhelm"
      />

      <Box
        elevation="card"
        rounding="reduced"
        blockPadding="md"
        inlinePadding="md"
      >
        <ProgressSteps
          value={stages.findIndex((s) => s.status === "current") + 1}
          steps={stages.map((s) => s.label)}
        />

        {current && (
          <Box
            orientation="horizontal"
            gap="sm"
            wrap
            inlineAlignChildren="center"
            className="mt-4"
          >
            <Tag emphasis="info" size="sm">
              {`${current.label} stage`}
            </Tag>
            <Paragraph as="paragraph" emphasis="passive">
              {current.summary}
            </Paragraph>
          </Box>
        )}
      </Box>
    </DashboardSection>
  );
}
