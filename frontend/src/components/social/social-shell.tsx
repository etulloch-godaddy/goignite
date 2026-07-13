"use client";

import { useState } from "react";
import Box, { box } from "@ux/box";
import Tabs from "@ux/tabs";
import { buildGrowthNav, buildPrimaryNav } from "@/lib/dashboard-data";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { useSocial } from "@/hooks/use-social";
import { PlatformConnect } from "./platform-connect";
import { SocialMissions } from "./social-missions";
import { ContentIdeas } from "./content-ideas";
import { OutreachTracker } from "./outreach-tracker";
import { GrowthPlan } from "./growth-plan";
import { SeoTools } from "./seo-tools";

const Main = box.main;

const TABS = [
  { id: "connect", text: "Connect" },
  { id: "missions", text: "Missions" },
  { id: "content", text: "Content" },
  { id: "outreach", text: "Outreach" },
  { id: "grow", text: "Grow" },
  { id: "seo", text: "SEO" },
];

export function SocialShell() {
  const { userId, user, loading } = useSocial();
  const [activeTab, setActiveTab] = useState("connect");

  if (loading) return <DashboardLoading />;

  const stage = user.stage;
  const creatorType = user.creatorType ?? "fashion";
  const uid = userId ?? "demo";

  const renderTab = () => {
    switch (activeTab) {
      case "connect":
        return <PlatformConnect userId={uid} stage={stage} creatorType={creatorType} />;
      case "missions":
        return <SocialMissions userId={uid} stage={stage} creatorType={creatorType} />;
      case "content":
        return <ContentIdeas userId={uid} stage={stage} creatorType={creatorType} />;
      case "outreach":
        return <OutreachTracker userId={uid} />;
      case "grow":
        return <GrowthPlan userId={uid} stage={stage} creatorType={creatorType} />;
      case "seo":
        return <SeoTools userId={uid} creatorType={creatorType} />;
      default:
        return null;
    }
  };

  return (
    <Box orientation="horizontal" stretch className="social-page min-h-screen w-full">
      <DashboardSidebar
        businessName={user.businessName}
        primary={buildPrimaryNav(user.todaysMissions.length)}
        growth={buildGrowthNav(stage)}
        activeSection="social"
      />

      <Box orientation="vertical" stretch className="min-w-0 flex-1 dashboard-main">
        <Main
          orientation="vertical"
          gap="lg"
          blockPadding="lg"
          inlinePadding="lg"
          className="w-full social-content"
        >
          <div>
            <h1 className="social-page-title">Social Media Hub</h1>
            <p className="social-page-sub">Manage your platforms, missions, and growth.</p>
          </div>

          <Tabs
            id="social-tabs"
            items={TABS}
            defaultSelected="connect"
            design="underline"
            onChange={(id) => setActiveTab(id)}
          />

          <div className="social-tab-content">{renderTab()}</div>
        </Main>
      </Box>
    </Box>
  );
}
