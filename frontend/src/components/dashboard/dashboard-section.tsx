"use client";

import Box, { box } from "@ux/box";
import type { ReactNode } from "react";

const Section = box.section;

export function DashboardSection({
  id,
  children,
  gap = "md",
}: {
  id: string;
  children: ReactNode;
  gap?: "sm" | "md" | "lg";
}) {
  return (
    <Section id={id} className="scroll-mt-6" orientation="vertical" gap={gap}>
      {children}
    </Section>
  );
}

export function DashboardGrid({
  children,
  columns = 3,
}: {
  children: ReactNode;
  columns?: 2 | 3;
}) {
  return (
    <Box
      orientation="horizontal"
      gap="md"
      wrap
      className={columns === 2 ? "dashboard-grid-2" : "dashboard-grid-3"}
    >
      {children}
    </Box>
  );
}
