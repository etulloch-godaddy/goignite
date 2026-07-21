"use client";

import Button from "@ux/button";
import text from "@ux/text";
import CheckboxListIcon from "@ux/icon/checkbox-list";
import CheckmarkIcon from "@ux/icon/checkmark";
import CircleIcon from "@ux/icon/circle";
import ContentIcon from "@ux/icon/content";
import BullseyeIcon from "@ux/icon/bullseye";
import { getStageLabel, type DashboardUser } from "@/lib/dashboard-data";
import { DashboardSection } from "@/components/dashboard/dashboard-section";

const Title = text.span;
const Heading = text.span;
const Desc = text.p;

const GOAL_LABELS: Record<string, string> = {
  "side-income": "Side income",
  "full-time": "Full-time",
  passion: "Passion/hobby",
  grow: "Grow existing",
};

function formatGoal(goal: string): string {
  return GOAL_LABELS[goal] ?? goal;
}

function RecapGroup({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="business-recap-group">
      <span className="business-recap-label">{label}</span>
      <div className="business-recap-chips">
        {items.map((item) => (
          <span key={item} className="business-recap-chip">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BusinessOverviewPage({ user }: { user: DashboardUser }) {
  const steps = user.todaysMissions;
  const done = user.completedMissionCount;
  const total = done + steps.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const { onboarding, profile } = user;

  const hasRecap =
    onboarding.businessTypes.length > 0 ||
    onboarding.existingAssets.length > 0 ||
    onboarding.confusionAreas.length > 0 ||
    Boolean(onboarding.goal);

  return (
    <>
      <DashboardSection id="business-overview">
        <div className="dashboard-section-head">
          <div className="dashboard-section-heading">
            <Title as="heading" size={1} className="dashboard-section-title">
              Business overview
            </Title>
            <p className="dashboard-section-subtitle">
              Everything about <strong>{user.businessName}</strong> in one place —
              your progress, profile, and what to do next.
            </p>
          </div>
          <a href="/dashboard" className="dashboard-view-all">
            Back to dashboard
          </a>
        </div>

        <div className="business-overview-grid">
          {/* Progress checklist */}
          <div className="dashboard-overview-card business-overview-span">
            <div className="dashboard-overview-head">
              <span className="dashboard-match-logo">
                <CheckboxListIcon width={22} height={22} />
              </span>
              <div className="dashboard-overview-head-text">
                <Heading as="heading" size={0} className="dashboard-overview-title">
                  Your step-by-step checklist
                </Heading>
                <Desc as="paragraph" className="dashboard-overview-sub">
                  Small, clear steps — no jargon, no business degree needed.
                </Desc>
              </div>
              <span className="dashboard-overview-widget-badge">
                {getStageLabel(user.stage)}
              </span>
            </div>

            <ul className="dashboard-checklist">
              {Array.from({ length: done }).map((_, i) => (
                <li key={`done-${i}`} className="dashboard-checklist-item is-done">
                  <span className="dashboard-check dashboard-check--done">
                    <CheckmarkIcon width={13} height={13} />
                  </span>
                  <span>Completed step</span>
                </li>
              ))}
              {steps.map((step) => (
                <li key={step.id} className="dashboard-checklist-item">
                  <span className="dashboard-check">
                    <CircleIcon width={13} height={13} />
                  </span>
                  <span>
                    <span className="business-step-title">{step.title}</span>
                    {step.description && (
                      <span className="business-step-desc">{step.description}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <div className="dashboard-overview-progress">
              <div className="dashboard-progress-track">
                <div
                  className="dashboard-progress-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="dashboard-progress-label">
                {done} of {total} steps done
              </span>
            </div>
          </div>

          {/* Business profile snapshot */}
          <div className="dashboard-overview-card">
            <div className="dashboard-overview-head">
              <span className="dashboard-match-logo dashboard-match-logo--peach">
                <ContentIcon width={20} height={20} />
              </span>
              <div className="dashboard-overview-head-text">
                <Heading as="heading" size={0} className="dashboard-overview-title">
                  Business profile
                </Heading>
                <Desc as="paragraph" className="dashboard-overview-sub">
                  How you describe {user.businessName} today.
                </Desc>
              </div>
            </div>

            <dl className="business-profile-list">
              <div className="business-profile-row">
                <dt>Pitch</dt>
                <dd>{profile.pitch || "Not added yet"}</dd>
              </div>
              <div className="business-profile-row">
                <dt>Niche</dt>
                <dd>{profile.niche || "Not added yet"}</dd>
              </div>
              <div className="business-profile-row">
                <dt>Goal</dt>
                <dd>{formatGoal(onboarding.goal || profile.revenueGoal) || "Not set yet"}</dd>
              </div>
              <div className="business-profile-row">
                <dt>Domain</dt>
                <dd>{profile.domain || "Not connected"}</dd>
              </div>
            </dl>

            <div className="dashboard-overview-actions">
              <Button
                design="secondary"
                size="sm"
                text="Edit profile"
                href="/dashboard"
              />
            </div>
          </div>

        </div>
      </DashboardSection>

      {hasRecap && (
        <DashboardSection id="business-recap">
          <div className="dashboard-section-head">
            <div className="dashboard-section-heading">
              <Title as="heading" size={1} className="dashboard-section-title">
                What you told us
              </Title>
              <p className="dashboard-section-subtitle">
                We use your answers to tailor your steps. Update them anytime.
              </p>
            </div>
            <span className="dashboard-match-logo dashboard-match-logo--teal">
              <BullseyeIcon width={20} height={20} />
            </span>
          </div>

          <div className="dashboard-overview-card business-recap-card">
            <RecapGroup label="Business type" items={onboarding.businessTypes} />
            <RecapGroup label="Already in place" items={onboarding.existingAssets} />
            <RecapGroup
              label="Where you want help"
              items={onboarding.confusionAreas}
            />
            {onboarding.goal && (
              <div className="business-recap-group">
                <span className="business-recap-label">Your goal</span>
                <p className="business-recap-goal">{onboarding.goal}</p>
              </div>
            )}
          </div>
        </DashboardSection>
      )}
    </>
  );
}
