"use client";

import Box from "@ux/box";
import Button from "@ux/button";
import text from "@ux/text";
import type { DashboardUser } from "@/lib/dashboard-data";

export function GreetingRow({ user }: { user: DashboardUser }) {
  const Title = text.h1;

  return (
    <Box
      orientation="horizontal"
      gap="lg"
      wrap
      blockAlignChildren="center"
      className="w-full"
    >
      <Title as="title" className="dashboard-greeting-title">
        Hi, {user.firstName}!
      </Title>

      <Box stretch />

      <Button design="primary" size="md" text="Refer &amp; Earn" href="#refer" />
    </Box>
  );
}
