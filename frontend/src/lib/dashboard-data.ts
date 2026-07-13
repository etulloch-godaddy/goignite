import { STAGES } from "./stages";

export type Stage = "starter" | "builder" | "brand" | "investor_ready";

export type FocusArea = {
  id: string;
  label: string;
  description: string;
  progress: number;
  helperText: string;
};

export type MissionPreview = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  stage: Stage;
  completionPrompt?: string;
};

export type AchievementPreview = {
  id: string;
  title: string;
  impact: string;
  category: string;
  date: string;
};

export type ProfileSnapshot = {
  pitch: string;
  bio: string;
  niche: string;
  socialLink: string;
  revenueGoal: string;
  domain: string;
};

export type StageStatus = "complete" | "current" | "incomplete";

export type StageStep = {
  id: Stage;
  label: string;
  threshold: number;
  gate: string | null;
  summary: string;
  status: StageStatus;
};

export type DashboardUser = {
  userId?: string;
  firstName: string;
  businessName: string;
  creatorType: string;
  stage: Stage;
  xpTotal: number;
  xpToNextStage: number;
  nextStageLabel: string;
  nextUnlock: string;
  completedMissionCount: number;
  focusAreas: FocusArea[];
  todaysMissions: MissionPreview[];
  achievements: AchievementPreview[];
  profile: ProfileSnapshot;
  stages: StageStep[];
};

const STAGE_LABELS: Record<Stage, string> = {
  starter: "Starter",
  builder: "Builder",
  brand: "Brand",
  investor_ready: "Investor-Ready",
};

export function getStageLabel(stage: Stage): string {
  return STAGE_LABELS[stage];
}

export const demoUser: DashboardUser = {
  firstName: "Maya",
  businessName: "Valentina's Hot Sauce",
  creatorType: "Fashion & lifestyle",
  stage: "starter",
  xpTotal: 125,
  xpToNextStage: 300,
  nextStageLabel: STAGE_LABELS.builder,
  nextUnlock: "Domain registration",
  completedMissionCount: 2,
  focusAreas: [
    {
      id: "idea",
      label: "Your idea",
      description: "Clarify what you create and who it's for",
      progress: 60,
      helperText: "2 of 3 basics done",
    },
    {
      id: "presence",
      label: "Your presence",
      description: "Build a home for your brand online",
      progress: 25,
      helperText: "Link your main social profile",
    },
    {
      id: "earnings",
      label: "Your earnings",
      description: "Learn how creators like you make money",
      progress: 10,
      helperText: "Unlocks as you grow",
    },
  ],
  todaysMissions: [
    {
      id: "starter-pitch",
      title: "Write your 1-sentence pitch",
      description:
        "Distill what you create and who it's for into one clear sentence. No jargon — just you.",
      xpReward: 50,
      stage: "starter",
      completionPrompt: "Paste your pitch below",
    },
    {
      id: "starter-brand-name",
      title: "Name your brand",
      description:
        "Pick something memorable that fits your vibe. You'll use this everywhere.",
      xpReward: 50,
      stage: "starter",
      completionPrompt: "What's your brand name?",
    },
    {
      id: "starter-social",
      title: "Link your social profile",
      description:
        "Connect where you already post so your dashboard can grow with you.",
      xpReward: 50,
      stage: "starter",
      completionPrompt: "Paste your profile URL",
    },
  ],
  achievements: [
    {
      id: "demo-1",
      title: "Named Your Brand",
      impact: "Named Your Brand · +50 XP",
      category: "business_setup",
      date: new Date().toISOString(),
    },
    {
      id: "demo-2",
      title: "Published Creator Bio",
      impact: "Published Creator Bio · +25 XP",
      category: "business_setup",
      date: new Date().toISOString(),
    },
  ],
  profile: {
    pitch: "",
    bio: "Fashion creator helping college students build confident everyday style.",
    niche: "Budget-friendly campus fashion",
    socialLink: "",
    revenueGoal: "",
    domain: "",
  },
  stages: STAGES.map((stage) => ({
    ...stage,
    status:
      stage.id === "starter"
        ? "current"
        : "incomplete",
  })),
};

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string;
  locked?: boolean;
  lockReason?: string;
};

export function buildPrimaryNav(missionCount: number): NavItem[] {
  return [
    {
      id: "overview",
      label: "Dashboard",
      icon: "dashboard",
      href: "#overview",
    },
    {
      id: "roadmap",
      label: "Your path",
      icon: "graph",
      href: "#roadmap",
    },
    {
      id: "missions",
      label: "Today's missions",
      icon: "checkbox-list",
      href: "#missions",
      badge: missionCount > 0 ? String(missionCount) : undefined,
    },
    {
      id: "profile",
      label: "Business profile",
      icon: "content",
      href: "#profile",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: "bullseye",
      href: "#achievements",
    },
  ];
}

export function buildGrowthNav(stage: Stage): NavItem[] {
  const builderOpen = stage !== "starter";
  const brandOpen = stage === "brand" || stage === "investor_ready";

  return [
    {
      id: "domain",
      label: "Domain",
      icon: "domain",
      href: "#domain",
      locked: !builderOpen,
      lockReason: builderOpen ? undefined : "Unlocks at Builder",
    },
    {
      id: "website",
      label: "Website",
      icon: "page",
      href: "#website",
      locked: !builderOpen,
      lockReason: builderOpen ? undefined : "Unlocks at Builder",
    },
    {
      id: "funding",
      label: "Funding",
      icon: "lightbulb",
      href: "#funding",
      locked: !brandOpen,
      lockReason: brandOpen ? undefined : "Unlocks at Brand",
    },
  ];
}
