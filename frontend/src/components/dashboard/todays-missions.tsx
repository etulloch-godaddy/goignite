"use client";

import Alert from "@ux/alert";
import Box from "@ux/box";
import Button from "@ux/button";
import Card from "@ux/card";
import Tag from "@ux/tag";
import text from "@ux/text";
import type { MissionPreview } from "@/lib/dashboard-data";
import { getStageLabel } from "@/lib/dashboard-data";
import { DashboardGrid, DashboardSection } from "./dashboard-section";
import { SectionHeader } from "./section-header";

function MissionCard({
  mission,
  onComplete,
  completing,
  canComplete,
}: {
  mission: MissionPreview;
  onComplete: (id: string) => void;
  completing: boolean;
  canComplete: boolean;
}) {
  const Paragraph = text.p;
  const Caption = text.span;

  return (
    <Card
      className="dashboard-grid-item"
      title={mission.title}
      description={
        <Paragraph as="paragraph" emphasis="passive">
          {mission.description}
        </Paragraph>
      }
      eyebrow={
        <Tag emphasis="neutral" size="sm">
          {`+${mission.xpReward} XP · ${getStageLabel(mission.stage)}`}
        </Tag>
      }
      actions={
        <Button
          design="primary"
          text={completing ? "Completing..." : "Mark complete"}
          disabled={completing || !canComplete}
          onClick={() => onComplete(mission.id)}
        />
      }
    >
      {mission.completionPrompt && (
        <Caption as="caption" emphasis="info">
          {mission.completionPrompt}
        </Caption>
      )}
    </Card>
  );
}

export function TodaysMissions({
  missions,
  onComplete,
  completingId,
  apiConnected,
}: {
  missions: MissionPreview[];
  onComplete: (id: string) => void;
  completingId: string | null;
  apiConnected: boolean;
}) {
  const Paragraph = text.p;

  return (
    <DashboardSection id="missions">
      <SectionHeader
        title="Today's missions"
        description="Small steps — unlock more as you level up"
      />

      {!apiConnected && (
        <Alert
          emphasis="warning"
          title="Demo mode"
          blockPadding="sm"
          inlinePadding="sm"
        >
          Start the backend to save progress and earn XP.
        </Alert>
      )}

      {missions.length === 0 ? (
        <Card
          title="You're caught up for today"
          description={
            <Paragraph as="paragraph" emphasis="passive">
              Nice work. Check back when you reach the next stage for new
              missions.
            </Paragraph>
          }
        />
      ) : (
        <DashboardGrid columns={3}>
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onComplete={onComplete}
              completing={completingId === mission.id}
              canComplete={apiConnected}
            />
          ))}
        </DashboardGrid>
      )}
    </DashboardSection>
  );
}
