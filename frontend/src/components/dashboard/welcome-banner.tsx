"use client";

import Box from "@ux/box";
import Button from "@ux/button";
import TextLockup from "@ux/text-lockup";
import text from "@ux/text";
import type { DashboardUser } from "@/lib/dashboard-data";
import { getStageLabel } from "@/lib/dashboard-data";
import { DashboardSection } from "./dashboard-section";

export function WelcomeBanner({ user }: { user: DashboardUser }) {
  const Paragraph = text.p;

  return (
    <DashboardSection id="overview">
      <Box
        blockPadding="lg"
        inlinePadding="lg"
        className="dashboard-welcome"
      >
        <Box
          orientation="horizontal"
          gap="lg"
          wrap
          inlineAlignChildren="center"
          blockAlignChildren="center"
        >
          <Box orientation="vertical" gap="md" stretch className="max-w-3xl">
            <TextLockup
              title={`Welcome ${user.firstName}!`}
              size="lg"
              textMaxWidth={false}
            >
              <Paragraph as="paragraph" emphasis="passive">
                You&apos;re building <strong>{user.businessName}</strong> in the{" "}
                {getStageLabel(user.stage)} stage. One small step today keeps
                things simple — no business degree required.
              </Paragraph>
            </TextLockup>
          </Box>

          <Button design="primary" text="Continue mission" href="#missions" />
        </Box>
      </Box>
    </DashboardSection>
  );
}
