"use client";

import Button from "@ux/button";
import CircularProgress from "@ux/circular-progress";
import text from "@ux/text";
import CheckboxListIcon from "@ux/icon/checkbox-list";
import CheckmarkIcon from "@ux/icon/checkmark";
import CircleIcon from "@ux/icon/circle";
import BarGraphIcon from "@ux/icon/bar-graph";
import SparklesFilledIcon from "@ux/icon/sparkles-filled";
import InPersonIcon from "@ux/icon/in-person";
import type { DashboardUser } from "@/lib/dashboard-data";
import { DashboardSection } from "./dashboard-section";

const Title = text.span;
const Heading = text.span;
const Desc = text.p;

export function BusinessOverview({ user }: { user: DashboardUser }) {
  const steps = user.todaysMissions;
  const done = user.completedMissionCount;
  const total = done + steps.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const focusAreas = user.focusAreas;

  return (
    <DashboardSection id="missions">
      <div className="dashboard-section-head">
        <Title as="heading" size={1} className="dashboard-section-title">
          Business overview
        </Title>
        <a href="#roadmap" className="dashboard-view-all">
          View all
        </a>
      </div>

      <div className="dashboard-insights-grid">
        {/* Step-by-step checklist + progress (top survey needs) */}
        <div className="dashboard-overview-card dashboard-overview-checklist">
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
                <span>{step.title}</span>
              </li>
            ))}
          </ul>

          <div className="dashboard-overview-progress">
            <div className="dashboard-progress-track">
              <div className="dashboard-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="dashboard-progress-label">
              {done} of {total} steps done
            </span>
          </div>
        </div>

        {/* Right column: personalized + guidance */}
        <div className="dashboard-insights-stack">
          <div className="dashboard-overview-card">
            <div className="dashboard-overview-head">
              <span className="dashboard-match-logo dashboard-match-logo--peach">
                <BarGraphIcon width={20} height={20} />
              </span>
              <div className="dashboard-overview-head-text">
                <Heading as="heading" size={0} className="dashboard-overview-title">
                  Business analytics
                </Heading>
                <Desc as="paragraph" className="dashboard-overview-sub">
                  How <strong>{user.businessName}</strong> is tracking across
                  the basics.
                </Desc>
              </div>
            </div>

            <div className="dashboard-analytics-rings">
              {focusAreas.map((area) => (
                <div key={area.id} className="dashboard-analytics-ring">
                  <span className="dashboard-analytics-ring-label">{area.label}</span>
                  <CircularProgress
                    size="md"
                    value={area.progress}
                    output={`${area.progress}%`}
                    label={
                      <a href="#assistant" className="dashboard-analytics-ring-help">
                        Need help?
                      </a>
                    }
                  />
                </div>
              ))}
            </div>

            <div className="dashboard-overview-actions">
              <Button design="primary" size="sm" text="View full report" href="#roadmap" />
            </div>
          </div>

          <div className="dashboard-overview-card">
            <div className="dashboard-overview-head">
              <span className="dashboard-match-logo dashboard-match-logo--purple">
                <InPersonIcon width={20} height={20} />
              </span>
              <div className="dashboard-overview-head-text">
                <Heading as="heading" size={0} className="dashboard-overview-title">
                  Stuck? Get real help
                </Heading>
                <Desc as="paragraph" className="dashboard-overview-sub">
                  Ask for plain-English answers anytime, or connect with a mentor
                  who&apos;s built a business like yours.
                </Desc>
              </div>
            </div>

            <div className="dashboard-overview-actions">
              <Button design="secondary" size="sm" href="#assistant">
                <SparklesFilledIcon width={15} height={15} />
                <span>Ask the assistant</span>
              </Button>
              <Button design="tertiary" size="sm" text="Find a mentor" href="#mentors" />
            </div>
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}
