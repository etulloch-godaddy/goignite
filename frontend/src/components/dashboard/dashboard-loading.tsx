"use client";

import Box from "@ux/box";
import Spinner from "@ux/spinner";
import text from "@ux/text";

export function DashboardLoading() {
  const Paragraph = text.p;

  return (
    <Box
      orientation="vertical"
      gap="md"
      inlineAlignChildren="center"
      blockAlignChildren="center"
      stretch
      className="min-h-screen"
    >
      <Spinner size="lg" />
      <Paragraph as="paragraph" emphasis="passive">
        Loading your dashboard...
      </Paragraph>
    </Box>
  );
}
