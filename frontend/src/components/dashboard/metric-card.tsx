"use client";

import Box from "@ux/box";
import CircularProgress from "@ux/circular-progress";
import text from "@ux/text";

export function MetricCard({
  label,
  value,
  helperText,
  tall,
}: {
  label: string;
  value: number;
  helperText: string;
  tall?: boolean;
}) {
  const Title = text.span;

  return (
    <Box
      elevation="raised"
      rounding="reduced"
      blockPadding="lg"
      inlinePadding="lg"
      className={`dashboard-metric-card ${tall ? "dashboard-metric-card--tall" : ""}`}
    >
      <Box
        orientation="horizontal"
        gap="lg"
        inlineAlignChildren="center"
        blockAlignChildren="center"
        className={tall ? "h-full justify-center" : ""}
      >
        <Title as="heading" size={0}>
          {label}
        </Title>
        <CircularProgress
          size="sm"
          value={value}
          output={`${value}%`}
          helpMessage={helperText}
        />
      </Box>
    </Box>
  );
}
