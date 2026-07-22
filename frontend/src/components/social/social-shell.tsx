"use client";

import { useState } from "react";
import Box, { box } from "@ux/box";
import Tabs from "@ux/tabs";
import text from "@ux/text";
import ArrowLeftIcon from "@ux/icon/arrow-left";
import { buildGrowthNav, buildPrimaryNav } from "@/lib/dashboard-data";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { ChatWidget } from "@/components/chat/chat-widget";
import { useSocial } from "@/hooks/use-social";
import { PlatformConnect } from "./platform-connect";
import { ContentIdeas } from "./content-ideas";
import { OutreachTracker } from "./outreach-tracker";
import { MonetizationPaths } from "./monetization-paths";
import { SeoTools } from "./seo-tools";

const Main = box.main;
const Title = text.span;

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
    <>
      <Box orientation="horizontal" stretch className="dashboard-page min-h-screen w-full">
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
          <DashboardHeader user={user} />
          <Main
            orientation="vertical"
            gap="lg"
            blockPadding="lg"
            inlinePadding="lg"
            className="w-full dashboard-content"
          >
            <div className="dashboard-section-head">
              <div className="dashboard-section-heading">
                <Title as="heading" size={1} className="dashboard-section-title">
                  Social Media Hub
                </Title>
                <p className="dashboard-section-subtitle">
                  Connect your platforms, plan content, and grow your audience.
                </p>
              </div>
              <a href="/dashboard" className="dashboard-view-all">
                <ArrowLeftIcon width={16} height={16} />
                <span>Back to dashboard</span>
              </a>
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
      <ChatWidget />
    </>
  );
}
