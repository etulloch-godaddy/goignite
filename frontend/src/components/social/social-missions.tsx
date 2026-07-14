"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import text from "@ux/text";
import Tag from "@ux/tag";
import {
  getSocialMissions,
  getAllSocialMissions,
  completeSocialMission,
  type SocialMission,
} from "@/services/api";

const Heading = text.h2;
const Body = text.p;
const Label = text.span;

const STAGE_ORDER = ["starter", "builder", "brand", "investor_ready"];
const STAGE_LABELS: Record<string, string> = {
  starter: "Starter",
  builder: "Builder",
  brand: "Brand",
  investor_ready: "Investor Ready",
};

interface Props {
  userId: string;
  stage: string;
  creatorType: string;
  completedMissionIds: string[];
}

export function SocialMissions({ userId, stage, creatorType, completedMissionIds }: Props) {
  const [view, setView] = useState<"available" | "completed">("available");
  const [available, setAvailable] = useState<SocialMission[]>([]);
  const [completed, setCompleted] = useState<SocialMission[]>([]);
  const [completing, setCompleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [avail, all] = await Promise.all([
        getSocialMissions(userId, undefined, creatorType),
        getAllSocialMissions(creatorType),
      ]);
      setAvailable(avail);
      setCompleted(all.filter((m) => completedMissionIds.includes(m.mission_id)));
    } catch {
      setAvailable([]);
      setCompleted([]);
    } finally {
      setLoading(false);
    }
  }, [userId, creatorType, completedMissionIds]);

  useEffect(() => { load(); }, [load]);

  const handleComplete = async (mission: SocialMission) => {
    if (userId === "demo") {
      setError("Connect to the backend to save progress.");
      return;
    }
    setError(null);
    setCompleting(mission.mission_id);
    try {
      await completeSocialMission(mission.mission_id, userId);
    } catch (e) {
      const already = e instanceof Error && e.message.includes("409");
      if (!already) {
        setError(`Couldn't save — ${e instanceof Error ? e.message : "try again"}`);
        setCompleting(null);
        return;
      }
    }
    setAvailable((prev) => prev.filter((m) => m.mission_id !== mission.mission_id));
    setCompleted((prev) => [...prev, mission]);
    setCompleting(null);
  };

  const missions = view === "available" ? available : completed;

  const grouped = STAGE_ORDER.reduce<Record<string, SocialMission[]>>((acc, s) => {
    const items = missions.filter((m) => m.stage === s);
    if (items.length) acc[s] = items;
    return acc;
  }, {});

  return (
    <Box orientation="vertical" gap="lg">
      {/* Header + toggle */}
      <Box orientation="horizontal" blockAlignChildren="center" gap="md">
        <Heading as="heading" size={3} className="flex-1">Social Visibility Missions</Heading>
        <div className="social-view-toggle">
          <button
            type="button"
            className={`social-toggle-btn${view === "available" ? " social-toggle-btn--active" : ""}`}
            onClick={() => setView("available")}
          >
            Available {!loading && <span className="social-toggle-count">{available.length}</span>}
          </button>
          <button
            type="button"
            className={`social-toggle-btn${view === "completed" ? " social-toggle-btn--active" : ""}`}
            onClick={() => setView("completed")}
          >
            Completed {!loading && <span className="social-toggle-count">{completed.length}</span>}
          </button>
        </div>
      </Box>

      {error && <Body as="paragraph" className="social-error">{error}</Body>}

      {loading && <Body as="paragraph" emphasis="passive">Loading missions…</Body>}

      {!loading && Object.keys(grouped).length === 0 && (
        <Box blockPadding="lg" inlinePadding="lg" elevation="raised" rounding="md">
          <Body as="paragraph" emphasis="passive">
            {view === "available"
              ? "No available missions right now. Check back as you grow or switch to Completed to see what you've done."
              : "You haven't completed any missions yet. Head to Available to get started."}
          </Body>
        </Box>
      )}

      {!loading && Object.entries(grouped).map(([s, items]) => (
        <Box key={s} orientation="vertical" gap="sm">
          <Box orientation="horizontal" blockAlignChildren="center" gap="sm">
            <span className="social-stage-label">{STAGE_LABELS[s] ?? s}</span>
            {s === stage && (
              <span className="social-stage-label" style={{ background: "#f3f5f6", padding: "2px 8px", borderRadius: "999px" }}>
                Your stage
              </span>
            )}
          </Box>

          {items.map((m) => (
            <Box
              key={m.mission_id}
              orientation="horizontal"
              blockAlignChildren="start"
              gap="md"
              blockPadding="md"
              inlinePadding="md"
              elevation="raised"
              rounding="md"
              className={`social-mission-card${view === "completed" ? " social-mission-card--done" : ""}`}
            >
              {view === "completed" && (
                <span className="social-mission-check">✓</span>
              )}
              <Box orientation="vertical" gap="xs" stretch>
                <Box orientation="horizontal" blockAlignChildren="center" gap="sm">
                  <Label as="label" size={1}>{m.title}</Label>
                  {m.xp_reward && <span className="social-mission-xp">+{m.xp_reward} XP</span>}
                  {m.platform && <Tag emphasis="neutral" size="sm">{m.platform}</Tag>}
                </Box>
                <Body as="paragraph" emphasis="passive">{m.description}</Body>
                {m.time_estimate && <Body as="paragraph" emphasis="passive">⏱ {m.time_estimate}</Body>}
              </Box>
              {view === "available" && (
                <Button
                  design="primary"
                  size="sm"
                  text={completing === m.mission_id ? "Saving…" : "Complete"}
                  disabled={completing !== null}
                  onClick={() => handleComplete(m)}
                />
              )}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}
