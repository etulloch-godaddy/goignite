"use client";

import Box from "@ux/box";
import Button from "@ux/button";
import Tag from "@ux/tag";
import TextLockup from "@ux/text-lockup";
import text from "@ux/text";
import type { DashboardUser } from "@/lib/dashboard-data";
import { DashboardSection } from "./dashboard-section";

export function NextUnlockCard({ user }: { user: DashboardUser }) {
  const Paragraph = text.p;

  return (
    <DashboardSection id="domain">
      <Box
        elevation="card"
        rounding="reduced"
        blockPadding="md"
        inlinePadding="md"
        className="bg-[#f3f5f6]"
      >
        <Box
          orientation="horizontal"
          gap="md"
          wrap
          inlineAlignChildren="center"
          blockAlignChildren="center"
        >
          <Box orientation="vertical" gap="sm" stretch>
            <Tag emphasis="highlight" size="sm">
              Next unlock
            </Tag>
            <TextLockup
              title={user.nextStageLabel}
              size="sm"
              textMaxWidth={false}
            >
              <Paragraph as="paragraph" emphasis="passive">
                Reach {user.xpToNextStage} XP to unlock{" "}
                <strong>{user.nextUnlock}</strong> and open new dashboard tools.
              </Paragraph>
            </TextLockup>
          </Box>
          <Button design="secondary" text="See what's next" href="#roadmap" />
        </Box>
      </Box>
    </DashboardSection>
  );
}
