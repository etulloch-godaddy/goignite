import type { Stage } from "./dashboard-data";

export type StageConfig = {
  id: Stage;
  label: string;
  threshold: number;
  gate: string | null;
  summary: string;
};

export const STAGES: StageConfig[] = [
  {
    id: "starter",
    label: "Starter",
    threshold: 0,
    gate: null,
    summary: "Shape your idea and find your audience",
  },
  {
    id: "builder",
    label: "Builder",
    threshold: 300,
    gate: "Domain registration",
    summary: "Get online with a real home for your brand",
  },
  {
    id: "brand",
    label: "Brand",
    threshold: 700,
    gate: "Professional email",
    summary: "Look legit and start earning",
  },
  {
    id: "investor_ready",
    label: "Investor-Ready",
    threshold: 1500,
    gate: "Full business suite",
    summary: "Pitch, fund, and scale with confidence",
  },
];

export function getStageIndex(stage: Stage): number {
  return STAGES.findIndex((s) => s.id === stage);
}

export function getNextStage(stage: Stage): StageConfig | null {
  const index = getStageIndex(stage);
  if (index < 0 || index >= STAGES.length - 1) return null;
  return STAGES[index + 1];
}

export function getXpToNextStage(stage: Stage, xpTotal: number): number {
  const next = getNextStage(stage);
  if (!next) return xpTotal;
  return next.threshold;
}

export function isStageUnlocked(stageId: Stage, currentStage: Stage): boolean {
  return getStageIndex(stageId) <= getStageIndex(currentStage);
}

export function getGrowthUnlocks(currentStage: Stage) {
  const builderUnlocked = isStageUnlocked("builder", currentStage);
  const brandUnlocked = isStageUnlocked("brand", currentStage);

  return {
    domain: { unlocked: builderUnlocked, reason: "Unlocks at Builder" },
    website: { unlocked: builderUnlocked, reason: "Unlocks at Builder" },
    funding: { unlocked: brandUnlocked, reason: "Unlocks at Brand" },
  };
}
