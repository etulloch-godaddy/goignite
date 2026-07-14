"use client";

import { useState } from "react";
import Box, { box } from "@ux/box";
import Tabs from "@ux/tabs";
import { buildGrowthNav, buildPrimaryNav } from "@/lib/dashboard-data";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { useSocial } from "@/hooks/use-social";
import { PlatformConnect } from "./platform-connect";
import { ContentIdeas } from "./content-ideas";
import { OutreachTracker } from "./outreach-tracker";
import { MonetizationPaths } from "./monetization-paths";
import { SeoTools } from "./seo-tools";

const Main = box.main;

// Maps every questionnaire business type label to a valid backend creator type.
// Backend accepts: fashion | gaming | fitness | art | food
const CREATOR_TYPE_MAP: Record<string, string> = {
  "clothing & merch":   "fashion",
  "beauty & wellness":  "fashion",
  "content & media":    "fashion",
  "services":           "fashion",
  "digital products":   "art",
  "home & handmade":    "art",
  "art & design":       "art",
  "food & drink":       "food",
  "fashion & lifestyle": "fashion",
  "gaming":             "gaming",
  "fitness":            "fitness",
  "something else":     "fashion",
};

function resolveCreatorType(raw: string): string {
  return CREATOR_TYPE_MAP[raw.toLowerCase()] ??
    (["fashion", "gaming", "fitness", "art", "food"].find((t) => raw.toLowerCase().includes(t)) ?? "fashion");
}

const TABS = [
  { id: "connect",  text: "Connect" },
  { id: "content",  text: "Content" },
  { id: "seo",      text: "SEO" },
  { id: "outreach", text: "Outreach" },
  { id: "monetize", text: "Monetize" },
];

export function SocialShell() {
  const { userId, user, creatorTypeLabel, loading } = useSocial();
  const [activeTab, setActiveTab] = useState("connect");

  if (loading) return <DashboardLoading />;

  const stage = user.stage;
  const creatorType = resolveCreatorType(creatorTypeLabel || user.creatorType || "fashion");
  const uid = userId ?? "demo";

  const renderTab = () => {
    switch (activeTab) {
      case "connect":
        return <PlatformConnect userId={uid} stage={stage} creatorType={creatorType} />;
      case "content":
        return <ContentIdeas userId={uid} stage={stage} creatorType={creatorType} />;
      case "outreach":
        return <OutreachTracker userId={uid} />;
      case "monetize":
        return <MonetizationPaths userId={uid} creatorType={creatorType} />;
      case "seo":
        return <SeoTools userId={uid} creatorType={creatorType} niche={user.profile.niche} businessName={user.businessName} />;
      default:
        return null;
    }
  };

  return (
    <Box orientation="horizontal" stretch className="social-page min-h-screen w-full">
      <DashboardSidebar
        businessName={user.businessName}
        primary={buildPrimaryNav(user.todaysMissions.length).map((item) => ({
          ...item,
          href: item.href.startsWith("#") ? `/dashboard${item.href}` : item.href,
        }))}
        growth={buildGrowthNav(stage).map((item) => ({
          ...item,
          href: item.href.startsWith("#") ? `/dashboard${item.href}` : item.href,
        }))}
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
            <a href="/dashboard" className="social-back-btn">← Dashboard</a>
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
