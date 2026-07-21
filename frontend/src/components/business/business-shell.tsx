"use client";

import Box, { box } from "@ux/box";
import {
  buildGrowthNav,
  buildPrimaryNav,
  type DashboardUser,
} from "@/lib/dashboard-data";
import { useDashboard } from "@/hooks/use-dashboard";
import { ChatWidget } from "@/components/chat/chat-widget";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { BusinessOverviewPage } from "./business-overview-page";

const Main = box.main;

function BusinessContent({ user }: { user: DashboardUser }) {
  return (
    <Box orientation="horizontal" stretch className="dashboard-page min-h-screen w-full">
      <DashboardSidebar
        businessName={user.businessName}
        primary={buildPrimaryNav(user.todaysMissions.length)}
        growth={buildGrowthNav(user.stage)}
        activeSection="profile"
      />

      <Box orientation="vertical" stretch className="min-w-0 flex-1 dashboard-main">
        <DashboardHeader user={user} />
        <Main
          orientation="vertical"
          gap="lg"
          blockPadding="lg"
          inlinePadding="lg"
          className="w-full dashboard-content"
        >
          <BusinessOverviewPage user={user} />
        </Main>
      </Box>
    </Box>
  );
}

export function BusinessShell() {
  const { user, loading } = useDashboard();

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <>
      <BusinessContent user={user} />
      <ChatWidget />
    </>
  );
}
