"use client";

import { useEffect, useState } from "react";
import Box, { box } from "@ux/box";
import {
  buildGrowthNav,
  buildPrimaryNav,
  type DashboardUser,
} from "@/lib/dashboard-data";
import { useDashboard } from "@/hooks/use-dashboard";
import { BusinessInsights } from "./business-insights";
import { DashboardHeader } from "./dashboard-header";
import { DashboardLoading } from "./dashboard-loading";
import { DashboardSidebar } from "./dashboard-sidebar";
import { FocusAreaCards } from "./focus-area-cards";
import { WelcomeBanner } from "./welcome-banner";

const Main = box.main;

function useActiveSection() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const sections = ["overview", "progress", "roadmap"];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.5] },
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return activeSection;
}

function DashboardContent({ user }: { user: DashboardUser }) {
  const activeSection = useActiveSection();

  return (
    <Box orientation="horizontal" stretch className="dashboard-page min-h-screen w-full">
      <DashboardSidebar
        businessName={user.businessName}
        primary={buildPrimaryNav(user.todaysMissions.length)}
        growth={buildGrowthNav(user.stage)}
        activeSection={activeSection}
      />

      <Box orientation="vertical" stretch className="min-w-0 flex-1 dashboard-main">
        <DashboardHeader user={user} />
        <Main
          orientation="vertical"
          gap="lg"
          blockPadding="lg"
          inlinePadding="lg"
          className="w-full"
        >
          <WelcomeBanner user={user} />
          <FocusAreaCards areas={user.focusAreas} />
          <BusinessInsights user={user} />
        </Main>
      </Box>
    </Box>
  );
}

export function DashboardShell() {
  const { user, loading } = useDashboard();

  if (loading) {
    return <DashboardLoading />;
  }

  return <DashboardContent user={user} />;
}
