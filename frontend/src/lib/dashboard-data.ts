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

/** Raw answers the user gave during onboarding, used to personalize the
 *  dashboard "Get started" experience. */
export type OnboardingAnswers = {
  startingPoint: string;
  businessTypes: string[];
  confusionAreas: string[];
  existingAssets: string[];
  goal: string;
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
  onboarding: OnboardingAnswers;
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

export const emptyUser: DashboardUser = {
  firstName: "",
  businessName: "My Business",
  creatorType: "",
  stage: "starter",
  xpTotal: 0,
  xpToNextStage: 300,
  nextStageLabel: STAGE_LABELS.builder,
  nextUnlock: "Domain registration",
  completedMissionCount: 0,
  focusAreas: [
    {
      id: "idea",
      label: "Your idea",
      description: "Clarify what you create and who it's for",
      progress: 0,
      helperText: "Start your first step",
    },
    {
      id: "presence",
      label: "Your presence",
      description: "Build a home for your brand online",
      progress: 0,
      helperText: "Start your first step",
    },
    {
      id: "earnings",
      label: "Your earnings",
      description: "Learn how creators like you make money",
      progress: 0,
      helperText: "Unlocks as you grow",
    },
  ],
  todaysMissions: [],
  achievements: [],
  profile: {
    pitch: "",
    bio: "",
    niche: "",
    socialLink: "",
    revenueGoal: "",
    domain: "",
  },
  onboarding: {
    startingPoint: "",
    businessTypes: [],
    confusionAreas: [],
    existingAssets: [],
    goal: "",
  },
  stages: STAGES.map((stage) => ({
    ...stage,
    status: stage.id === "starter" ? "current" : "incomplete",
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
      label: "Missions",
      icon: "checkbox-list",
      href: "#missions",
      badge: missionCount > 0 ? String(missionCount) : undefined,
    },
    {
      id: "profile",
      label: "My Business",
      icon: "content",
      href: "/business",
    },
    {
      id: "domain",
      label: "Domain",
      icon: "domain",
      href: "#domain",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: "bullseye",
      href: "#achievements",
    },
    {
      id: "social",
      label: "Social",
      icon: "social",
      href: "/social",
    },
  ];
}

export function buildGrowthNav(stage: Stage): NavItem[] {
  const builderOpen = stage !== "starter";
  const investorOpen = stage === "investor_ready";
  const lockReason = "Unlocks at Investor Ready";

  return [
    {
      id: "website",
      label: "Website",
      icon: "page",
      href: "#website",
      locked: !builderOpen,
      lockReason: builderOpen ? undefined : lockReason,
    },
    {
      id: "funding",
      label: "Funding",
      icon: "lightbulb",
      href: "/investor-ready",
      locked: !investorOpen,
      lockReason: investorOpen ? undefined : lockReason,
    },
  ];
}
