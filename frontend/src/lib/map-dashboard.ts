import type { ApiAchievement, ApiMission, ApiUser } from "@/services/api";
import type {
  AchievementPreview,
  DashboardUser,
  FocusArea,
  MissionPreview,
  Stage,
} from "./dashboard-data";
import { getStageLabel } from "./dashboard-data";
import {
  getNextStage,
  getXpToNextStage,
  STAGES,
} from "./stages";

const CREATOR_LABELS: Record<string, string> = {
  fashion: "Fashion & lifestyle",
  gaming: "Gaming",
  fitness: "Fitness",
  art: "Art & design",
  food: "Food & cooking",
};

const IDEA_MISSIONS = new Set([
  "starter-pitch",
  "starter-brand-name",
  "starter-bio",
  "starter-niche",
]);

const PRESENCE_MISSIONS = new Set([
  "starter-social",
  "builder-domain",
  "builder-media-kit",
  "brand-website",
]);

const EARNINGS_MISSIONS = new Set([
  "builder-pricing",
  "brand-monetization",
  "brand-sponsorship",
  "investor_ready-revenue",
]);

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStage(value: string): Stage {
  if (
    value === "starter" ||
    value === "builder" ||
    value === "brand" ||
    value === "investor_ready"
  ) {
    return value;
  }
  return "starter";
}

function computeProgress(
  missionIds: Set<string>,
  completed: string[],
): { progress: number; helperText: string } {
  const total = missionIds.size;
  const done = completed.filter((id) => missionIds.has(id)).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  if (done === 0) return { progress, helperText: "Start your first step" };
  if (done === total) return { progress, helperText: "All set for now" };
  return { progress, helperText: `${done} of ${total} steps done` };
}

function buildFocusAreas(completed: string[]): FocusArea[] {
  const idea = computeProgress(IDEA_MISSIONS, completed);
  const presence = computeProgress(PRESENCE_MISSIONS, completed);
  const earnings = computeProgress(EARNINGS_MISSIONS, completed);

  return [
    {
      id: "idea",
      label: "Your idea",
      description: "Clarify what you create and who it's for",
      progress: idea.progress || 15,
      helperText: idea.helperText,
    },
    {
      id: "presence",
      label: "Your presence",
      description: "Build a home for your brand online",
      progress: presence.progress || 5,
      helperText: presence.helperText,
    },
    {
      id: "earnings",
      label: "Your earnings",
      description: "Learn how creators like you make money",
      progress: earnings.progress || 0,
      helperText:
        earnings.progress > 0 ? earnings.helperText : "Unlocks as you grow",
    },
  ];
}

export function mapMissions(missions: ApiMission[]): MissionPreview[] {
  return missions.map((mission) => ({
    id: mission.mission_id,
    title: mission.title,
    description: mission.description,
    xpReward: mission.xp_reward,
    stage: asStage(mission.stage),
    completionPrompt: mission.completion_prompt,
  }));
}

export function mapAchievements(
  achievements: ApiAchievement[],
): AchievementPreview[] {
  return achievements
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((achievement) => ({
      id: achievement.achievement_id,
      title: achievement.title,
      impact: achievement.impact,
      category: achievement.category,
      date: achievement.date,
    }));
}

export function mapUserToDashboard(
  user: ApiUser,
  missions: ApiMission[],
  achievements: ApiAchievement[],
): DashboardUser {
  const stage = asStage(user.stage);
  const nextStage = getNextStage(stage);
  const onboarding = user.onboarding_data;
  const businessTypes = asStringArray(onboarding.business_types);
  const onboardingPitch = asString(onboarding.pitch);
  const onboardingGoal = asString(onboarding.goal);
  const onboardingNiche =
    asString(onboarding.niche) ||
    asString(onboarding.creator_type_label) ||
    businessTypes[0] ||
    "";
  const onboardingSocialLink = asString(onboarding.social_link);
  const onboardingRevenueGoal =
    asString(onboarding.revenue_goal) || asString(onboarding.monthly_revenue);
  const onboardingDomain = asString(onboarding.domain);

  const creatorType =
    asString(onboarding.creator_type_label) ||
    (user.creator_type ? CREATOR_LABELS[user.creator_type] : null) ||
    "Creator";

  return {
    userId: user.user_id,
    firstName: asString(onboarding.first_name) || "Creator",
    businessName: asString(onboarding.business_name) || "My Business",
    creatorType,
    stage,
    xpTotal: user.xp_total,
    xpToNextStage: getXpToNextStage(stage, user.xp_total),
    nextStageLabel: nextStage?.label ?? getStageLabel(stage),
    nextUnlock: nextStage?.gate ?? "You reached the top stage",
    completedMissionCount: user.completed_missions.length,
    focusAreas: buildFocusAreas(user.completed_missions),
    todaysMissions: mapMissions(missions),
    achievements: mapAchievements(achievements),
    profile: {
      pitch: user.business_profile.pitch || onboardingPitch || "",
      bio: user.business_profile.bio || asString(onboarding.bio) || "",
      niche: onboardingNiche,
      socialLink: onboardingSocialLink,
      revenueGoal: user.business_profile.revenue_goal || onboardingRevenueGoal || "",
      domain: user.godaddy_domain || onboardingDomain || "",
    },
    onboarding: {
      startingPoint: asString(onboarding.starting_point),
      businessTypes,
      confusionAreas: asStringArray(onboarding.confusion_areas),
      existingAssets: asStringArray(onboarding.existing_assets),
      goal: onboardingGoal,
    },
    stages: STAGES.map((stageConfig) => ({
      ...stageConfig,
      status:
        stageConfig.id === stage
          ? ("current" as const)
          : STAGES.findIndex((s) => s.id === stageConfig.id) <
              STAGES.findIndex((s) => s.id === stage)
            ? ("complete" as const)
            : ("incomplete" as const),
    })),
  };
}
