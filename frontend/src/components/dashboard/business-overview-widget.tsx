"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import text from "@ux/text";
import ContentIcon from "@ux/icon/content";
import EditIcon from "@ux/icon/edit";
import DomainIcon from "@ux/icon/domain";
import MailIcon from "@ux/icon/mail";
import WebsiteIcon from "@ux/icon/website";
import DollarIcon from "@ux/icon/dollar";
import SocialIcon from "@ux/icon/social";
import CartIcon from "@ux/icon/cart";
import Users3Icon from "@ux/icon/users3";
import StarIcon from "@ux/icon/star";
import MegaphoneIcon from "@ux/icon/megaphone";
import CreditCardIcon from "@ux/icon/credit-card";
import ShieldCheckIcon from "@ux/icon/shield-check";
import GroupIcon from "@ux/icon/group";
import LightbulbIcon from "@ux/icon/lightbulb";
import GraphIcon from "@ux/icon/graph";
import CheckmarkIcon from "@ux/icon/checkmark";
import ArrowRightIcon from "@ux/icon/arrow-right";
import ChevronDownIcon from "@ux/icon/chevron-down";
import SparklesFilledIcon from "@ux/icon/sparkles-filled";
import { getStageLabel, type DashboardUser } from "@/lib/dashboard-data";
import { XP_PER_TASK, type GetStartedStage, type GetStartedTask } from "@/lib/get-started";
import { useGetStarted, useCountUp } from "@/hooks/use-get-started";
import { DashboardSection } from "./dashboard-section";

const Title = text.span;
const Heading = text.span;
const Desc = text.p;

type IconType = ComponentType<{ width?: number; height?: number }>;

const taskIcons: Record<string, IconType> = {
  content: ContentIcon,
  edit: EditIcon,
  domain: DomainIcon,
  mail: MailIcon,
  website: WebsiteIcon,
  dollar: DollarIcon,
  social: SocialIcon,
  cart: CartIcon,
  users3: Users3Icon,
  star: StarIcon,
  megaphone: MegaphoneIcon,
  "credit-card": CreditCardIcon,
  "shield-check": ShieldCheckIcon,
  group: GroupIcon,
  lightbulb: LightbulbIcon,
  graph: GraphIcon,
};

/**
 * Combined progress card: the milestone checklist merged with the business
 * progress bar. Only the current stage is shown by default to keep it focused;
 * "See all milestones" expands the full journey.
 */
export function BusinessOverviewWidget({ user }: { user: DashboardUser }) {
  const {
    stages,
    isDone,
    toggle,
    justEarned,
    doneCount,
    total,
    xpTotal,
    pct,
    currentStageIndex,
    allDone,
  } = useGetStarted(user);
  const [showAll, setShowAll] = useState(false);
  const displayXp = useCountUp(xpTotal);

  const currentStage = stages[currentStageIndex];

  const renderTask = (task: GetStartedTask) => {
    const done = isDone(task);
    const Icon = taskIcons[task.icon] ?? SparklesFilledIcon;
    const rowClass =
      "dashboard-gs-task" +
      (done ? " is-done" : "") +
      (task.autoDone ? " is-auto" : "");

    return (
      <div key={task.id} className={rowClass}>
        <button
          type="button"
          className="dashboard-gs-check"
          onClick={() => toggle(task)}
          disabled={task.autoDone}
          aria-pressed={done}
          aria-label={
            done ? `Mark "${task.label}" not done` : `Mark "${task.label}" done`
          }
        >
          {done && <CheckmarkIcon width={14} height={14} />}
        </button>

        <span className="dashboard-gs-task-icon">
          <Icon width={18} height={18} />
        </span>

        <span className="dashboard-gs-task-text">
          <span className="dashboard-gs-task-label">{task.label}</span>
          <span className="dashboard-gs-task-desc">{task.desc}</span>
        </span>

        <span className="dashboard-gs-task-xp">+{task.xp} XP</span>

        {!done && task.action.kind !== "self" && (
          <a
            className="dashboard-gs-task-action"
            href={task.action.href}
            {...(task.action.kind === "cta"
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <span>{task.action.label}</span>
            <ArrowRightIcon width={14} height={14} />
          </a>
        )}
      </div>
    );
  };

  const renderStageHead = (stage: GetStartedStage) => {
    const stageDone = stage.tasks.filter(isDone).length;
    return (
      <div className="dashboard-gs-stage-head">
        <span className="dashboard-gs-stage-name">{stage.label}</span>
        <span className="dashboard-gs-stage-tagline">{stage.tagline}</span>
        <span className="dashboard-gs-stage-count">
          {stageDone}/{stage.tasks.length}
        </span>
      </div>
    );
  };

  const renderUnlock = (stage: GetStartedStage) => {
    if (!stage.unlockNote) return null;
    const complete = stage.tasks.every(isDone);
    return (
      <div className={"dashboard-gs-unlock" + (complete ? " is-unlocked" : "")}>
        <span className="dashboard-gs-unlock-line" />
        <span className="dashboard-gs-unlock-text">
          {complete ? "Unlocked" : "Locked"} · {stage.unlockNote}
        </span>
        <span className="dashboard-gs-unlock-line" />
      </div>
    );
  };

  return (
    <DashboardSection id="missions">
      <div className="dashboard-section-head">
        <Title as="heading" size={1} className="dashboard-section-title">
          Your progress
        </Title>
        <a href="/business" className="dashboard-view-all">
          <span>View full overview</span>
          <ArrowRightIcon width={16} height={16} />
        </a>
      </div>

      <div className="dashboard-progress-card">
        <div className="dashboard-progress-top">
          <div className="dashboard-progress-top-text">
            <Heading as="heading" size={0} className="dashboard-overview-title">
              {user.businessName}
            </Heading>
            <Desc as="paragraph" className="dashboard-overview-sub">
              {getStageLabel(user.stage)} stage · {doneCount} of {total}{" "}
              milestones done
            </Desc>
          </div>
          <span className="dashboard-getstarted-xp">
            <SparklesFilledIcon width={15} height={15} />
            <span className="dashboard-getstarted-xp-value">
              {displayXp.toLocaleString()} XP
            </span>
            {justEarned && (
              <span className="dashboard-getstarted-xp-pop" aria-hidden>
                +{XP_PER_TASK}
              </span>
            )}
          </span>
        </div>

        <div className="dashboard-progress-bar-row">
          <span className="dashboard-getstarted-progress-track">
            <span
              className="dashboard-getstarted-progress-fill"
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="dashboard-getstarted-progress-label">
            {pct}% complete
          </span>
        </div>

        {allDone ? (
          <p className="dashboard-progress-alldone">
            Every milestone complete — you&apos;re investor-ready. Incredible
            work.
          </p>
        ) : !showAll ? (
          <div className="dashboard-progress-stage">
            {renderStageHead(currentStage)}
            <div className="dashboard-gs-tasks">
              {currentStage.tasks.map(renderTask)}
            </div>
          </div>
        ) : (
          <div className="dashboard-getstarted-stages">
            {stages.map((stage) => (
              <div key={stage.id} className="dashboard-gs-stage">
                {renderStageHead(stage)}
                <div className="dashboard-gs-tasks">
                  {stage.tasks.map(renderTask)}
                </div>
                {renderUnlock(stage)}
              </div>
            ))}
          </div>
        )}

        {!allDone && (
          <button
            type="button"
            className="dashboard-progress-toggle"
            onClick={() => setShowAll((v) => !v)}
          >
            <span>{showAll ? "Show current stage" : "See all milestones"}</span>
            <span
              className={
                "dashboard-progress-toggle-chevron" +
                (showAll ? " is-open" : "")
              }
            >
              <ChevronDownIcon width={15} height={15} />
            </span>
          </button>
        )}
      </div>
    </DashboardSection>
  );
}
