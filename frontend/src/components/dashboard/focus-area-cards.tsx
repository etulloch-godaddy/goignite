"use client";

import type { FocusArea } from "@/lib/dashboard-data";
import { DashboardGrid, DashboardSection } from "./dashboard-section";
import { MetricCard } from "./metric-card";

export function FocusAreaCards({ areas }: { areas: FocusArea[] }) {
  return (
    <DashboardSection id="progress">
      <DashboardGrid columns={3}>
        {areas.map((area) => (
          <MetricCard
            key={area.id}
            label={area.label}
            value={area.progress}
            helperText={area.helperText}
          />
        ))}
      </DashboardGrid>
    </DashboardSection>
  );
}
