"use client";

import Box from "@ux/box";
import Tag from "@ux/tag";
import text from "@ux/text";
import BullseyeIcon from "@ux/icon/bullseye";
import ShareIcon from "@ux/icon/share";
import BookmarkIcon from "@ux/icon/bookmark";
import SparklesIcon from "@ux/icon/sparkles";
import ClockIcon from "@ux/icon/clock";
import type { DashboardUser, MissionPreview } from "@/lib/dashboard-data";
import { getStageLabel } from "@/lib/dashboard-data";
import { DashboardSection } from "./dashboard-section";

function MissionCard({ mission }: { mission: MissionPreview }) {
  const Title = text.span;
  const Desc = text.p;
  const Meta = text.span;

  return (
    <div className="dashboard-match-card">
      <div className="dashboard-match-top">
        <span className="dashboard-match-logo">
          <BullseyeIcon width={22} height={22} />
        </span>
        <div className="dashboard-match-actions">
          <Tag emphasis="highlight" size="sm">
            {getStageLabel(mission.stage)}
          </Tag>
          <button type="button" className="dashboard-icon-button" aria-label="Share mission">
            <ShareIcon width={16} height={16} />
          </button>
          <button type="button" className="dashboard-icon-button" aria-label="Save mission">
            <BookmarkIcon width={16} height={16} />
          </button>
        </div>
      </div>

      <Box orientation="vertical" gap="sm" className="dashboard-match-body">
        <Title as="heading" size={0} className="dashboard-match-title">
          {mission.title}
        </Title>
        <Desc as="paragraph" className="dashboard-match-desc">
          {mission.description}
        </Desc>
      </Box>

      <div className="dashboard-match-xp">+{mission.xpReward} XP</div>

      <div className="dashboard-match-divider" />

      <div className="dashboard-match-meta">
        <span className="dashboard-match-meta-item">
          <ClockIcon width={15} height={15} />
          <Meta as="label">~5 min</Meta>
        </span>
        <span className="dashboard-match-meta-item">
          <SparklesIcon width={15} height={15} />
          <Meta as="label">Earns {mission.xpReward} XP</Meta>
        </span>
      </div>
    </div>
  );
}

export function MissionMatches({ user }: { user: DashboardUser }) {
  const Title = text.span;
  const missions = user.todaysMissions.slice(0, 3);

  return (
    <DashboardSection id="missions">
      <div className="dashboard-section-head">
        <Title as="heading" size={1} className="dashboard-section-title">
          Today&apos;s missions
        </Title>
        <a href="#missions" className="dashboard-view-all">
          View all missions
        </a>
      </div>

      <div className="dashboard-match-grid">
        {missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </DashboardSection>
  );
}
