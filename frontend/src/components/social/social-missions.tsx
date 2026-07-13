"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import text from "@ux/text";
import Tag from "@ux/tag";
import { getSocialMissions, completeSocialMission, type SocialMission } from "@/services/api";

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
}

export function SocialMissions({ userId, stage, creatorType }: Props) {
  const [missions, setMissions] = useState<SocialMission[]>([]);
  const [completing, setCompleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all incomplete missions across all stages (no stage filter)
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSocialMissions(userId, undefined, creatorType);
      setMissions(data);
    } catch {
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, [userId, creatorType]);

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
    setMissions((prev) => prev.filter((m) => m.mission_id !== mission.mission_id));
    setCompleting(null);
    await load();
  };

  if (loading) {
    return <Body as="paragraph" emphasis="passive">Loading missions…</Body>;
  }

  if (missions.length === 0) {
    return (
      <Box blockPadding="lg" inlinePadding="lg" elevation="raised" rounding="md" className="social-all-done">
        <Label as="label" size={1}>All caught up! 🎉</Label>
        <Body as="paragraph" emphasis="passive">
          You&apos;ve completed all social missions. More will unlock as you grow.
        </Body>
      </Box>
    );
  }

  // Group by stage in order
  const grouped = STAGE_ORDER.reduce<Record<string, SocialMission[]>>((acc, s) => {
    const items = missions.filter((m) => m.stage === s);
    if (items.length) acc[s] = items;
    return acc;
  }, {});

  return (
    <Box orientation="vertical" gap="lg">
      <Box orientation="horizontal" blockAlignChildren="center">
        <Heading as="heading" size={3} className="flex-1">Social Visibility Missions</Heading>
        <Tag emphasis="neutral" size="sm">{missions.length} remaining</Tag>
      </Box>

      {error && <Body as="paragraph" className="social-error">{error}</Body>}

      {Object.entries(grouped).map(([s, items]) => (
        <Box key={s} orientation="vertical" gap="sm">
          <Box orientation="horizontal" blockAlignChildren="center" gap="sm">
            <span className="social-stage-label">{STAGE_LABELS[s] ?? s}</span>
            {s === stage && <Tag emphasis="highlight" size="sm">Your stage</Tag>}
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
              className="social-mission-card"
            >
              <Box orientation="vertical" gap="xs" stretch>
                <Box orientation="horizontal" blockAlignChildren="center" gap="sm">
                  <Label as="label" size={1}>{m.title}</Label>
                  {m.xp_reward && <Tag emphasis="highlight" size="sm">+{m.xp_reward} XP</Tag>}
                  {m.platform && <Tag emphasis="neutral" size="sm">{m.platform}</Tag>}
                </Box>
                <Body as="paragraph" emphasis="passive">{m.description}</Body>
                {m.time_estimate && <Body as="paragraph" emphasis="passive">⏱ {m.time_estimate}</Body>}
              </Box>
              <Button
                design="primary"
                size="sm"
                text={completing === m.mission_id ? "Saving…" : "Complete"}
                disabled={completing !== null}
                onClick={() => handleComplete(m)}
              />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}
