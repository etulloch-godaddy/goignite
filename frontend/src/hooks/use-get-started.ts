"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DashboardUser } from "@/lib/dashboard-data";
import {
  buildGetStartedStages,
  XP_PER_TASK,
  type GetStartedStage,
  type GetStartedTask,
} from "@/lib/get-started";

function storageKey(userId?: string) {
  return `goignite:getstarted:${userId ?? "anon"}`;
}

export type GetStartedProgress = {
  stages: GetStartedStage[];
  isDone: (task: GetStartedTask) => boolean;
  toggle: (task: GetStartedTask) => void;
  justEarned: boolean;
  doneCount: number;
  total: number;
  xpTotal: number;
  maxXp: number;
  pct: number;
  /** First stage that isn't fully complete (or the last stage if all done). */
  currentStageIndex: number;
  allDone: boolean;
};

/**
 * Tracks the user's milestone checklist: which items are done (auto-derived from
 * onboarding + self-reported and persisted to localStorage), the XP earned, and
 * which stage the user is currently working through.
 */
export function useGetStarted(user: DashboardUser): GetStartedProgress {
  const stages = useMemo(() => buildGetStartedStages(user), [user]);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [justEarned, setJustEarned] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(user.userId));
      if (raw) setChecked(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, [user.userId]);

  const isDone = useCallback(
    (task: GetStartedTask) => task.autoDone || checked.has(task.id),
    [checked],
  );

  const toggle = useCallback(
    (task: GetStartedTask) => {
      if (task.autoDone) return;
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(task.id)) {
          next.delete(task.id);
        } else {
          next.add(task.id);
          setJustEarned(true);
          window.setTimeout(() => setJustEarned(false), 1100);
        }
        try {
          window.localStorage.setItem(
            storageKey(user.userId),
            JSON.stringify([...next]),
          );
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [user.userId],
  );

  const allTasks = stages.flatMap((s) => s.tasks);
  const total = allTasks.length;
  const doneCount = allTasks.filter(isDone).length;
  const xpTotal = doneCount * XP_PER_TASK;
  const maxXp = total * XP_PER_TASK;
  const pct = maxXp > 0 ? Math.round((xpTotal / maxXp) * 100) : 0;
  const allDone = doneCount === total;

  let currentStageIndex = stages.findIndex(
    (stage) => !stage.tasks.every(isDone),
  );
  if (currentStageIndex === -1) currentStageIndex = stages.length - 1;

  return {
    stages,
    isDone,
    toggle,
    justEarned,
    doneCount,
    total,
    xpTotal,
    maxXp,
    pct,
    currentStageIndex,
    allDone,
  };
}

/** Small count-up animation for the XP total. */
export function useCountUp(target: number, duration = 500) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    const start = value;
    if (start === target) return;
    const startTime = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}
