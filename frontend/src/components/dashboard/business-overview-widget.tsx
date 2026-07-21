"use client";

import text from "@ux/text";
import CheckboxListIcon from "@ux/icon/checkbox-list";
import CheckmarkIcon from "@ux/icon/checkmark";
import CircleIcon from "@ux/icon/circle";
import ArrowRightIcon from "@ux/icon/arrow-right";
import { getStageLabel, type DashboardUser } from "@/lib/dashboard-data";
import { DashboardSection } from "./dashboard-section";

const Title = text.span;
const Heading = text.span;
const Desc = text.p;

/**
 * Compact snapshot of the user's business that lives on the dashboard and links
 * out to the full, more thorough overview page.
 */
export function BusinessOverviewWidget({ user }: { user: DashboardUser }) {
  const steps = user.todaysMissions;
  const done = user.completedMissionCount;
  const total = done + steps.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const preview = steps.slice(0, 3);

  return (
    <DashboardSection id="missions">
      <div className="dashboard-section-head">
        <Title as="heading" size={1} className="dashboard-section-title">
          Business overview
        </Title>
        <a href="/business" className="dashboard-view-all">
          View full overview
        </a>
      </div>

      <a href="/business" className="dashboard-overview-widget">
        <div className="dashboard-overview-head">
          <span className="dashboard-match-logo">
            <CheckboxListIcon width={22} height={22} />
          </span>
          <div className="dashboard-overview-head-text">
            <Heading as="heading" size={0} className="dashboard-overview-title">
              {user.businessName}
            </Heading>
            <Desc as="paragraph" className="dashboard-overview-sub">
              {getStageLabel(user.stage)} stage · {done} of {total} steps done
            </Desc>
          </div>
          <span className="dashboard-overview-widget-badge">
            {getStageLabel(user.stage)}
          </span>
        </div>

        <ul className="dashboard-checklist dashboard-overview-widget-checklist">
          {Array.from({ length: Math.min(done, 2) }).map((_, i) => (
            <li key={`done-${i}`} className="dashboard-checklist-item is-done">
              <span className="dashboard-check dashboard-check--done">
                <CheckmarkIcon width={13} height={13} />
              </span>
              <span>Completed step</span>
            </li>
          ))}
          {preview.map((step) => (
            <li key={step.id} className="dashboard-checklist-item">
              <span className="dashboard-check">
                <CircleIcon width={13} height={13} />
              </span>
              <span>{step.title}</span>
            </li>
          ))}
          {preview.length === 0 && done === 0 && (
            <li className="dashboard-checklist-item">
              <span className="dashboard-check">
                <CircleIcon width={13} height={13} />
              </span>
              <span>Start your first step</span>
            </li>
          )}
        </ul>

        <div className="dashboard-overview-progress">
          <div className="dashboard-progress-track">
            <div className="dashboard-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="dashboard-progress-label">{pct}% complete</span>
        </div>

        <span className="dashboard-overview-widget-cta">
          <span>See your full business overview</span>
          <ArrowRightIcon width={15} height={15} />
        </span>
      </a>
    </DashboardSection>
  );
}
