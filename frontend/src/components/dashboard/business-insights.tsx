"use client";

import text from "@ux/text";
import type { DashboardUser } from "@/lib/dashboard-data";
import { DashboardSection } from "./dashboard-section";
import { MetricCard } from "./metric-card";

export function BusinessInsights({ user }: { user: DashboardUser }) {
  const Title = text.span;
  const leadArea = user.focusAreas[0];
  const secondArea = user.focusAreas[1] ?? leadArea;
  const thirdArea = user.focusAreas[2] ?? secondArea;

  return (
    <DashboardSection id="roadmap">
      <Title as="heading" size={-2} className="block">
        Business Insights
      </Title>

      <div className="dashboard-insights-grid">
        {leadArea && (
          <MetricCard
            label={leadArea.label}
            value={leadArea.progress}
            helperText={leadArea.helperText}
            tall
          />
        )}

        <div className="dashboard-insights-stack">
          <MetricCard
            label={secondArea.label}
            value={secondArea.progress}
            helperText={secondArea.helperText}
          />
          <MetricCard
            label={thirdArea.label}
            value={thirdArea.progress}
            helperText={thirdArea.helperText}
          />
        </div>
      </div>
    </DashboardSection>
  );
}
