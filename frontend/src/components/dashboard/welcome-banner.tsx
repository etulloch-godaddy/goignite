"use client";

import TextLockup from "@ux/text-lockup";
import text from "@ux/text";
import type { ComponentType } from "react";
import ContentIcon from "@ux/icon/content";
import DomainIcon from "@ux/icon/domain";
import MegaphoneIcon from "@ux/icon/megaphone";
import ColorPaletteIcon from "@ux/icon/color-palette";
import ImageGalleryIcon from "@ux/icon/image-gallery";
import BullseyeIcon from "@ux/icon/bullseye";
import CheckmarkIcon from "@ux/icon/checkmark";
import ArrowRightIcon from "@ux/icon/arrow-right";
import SparklesFilledIcon from "@ux/icon/sparkles-filled";
import { type DashboardUser } from "@/lib/dashboard-data";
import { buildGetStartedTasks } from "@/lib/get-started";
import { DashboardSection } from "./dashboard-section";

type IconType = ComponentType<{ width?: number; height?: number }>;

const taskIcons: Record<string, IconType> = {
  content: ContentIcon,
  domain: DomainIcon,
  megaphone: MegaphoneIcon,
  "color-palette": ColorPaletteIcon,
  "image-gallery": ImageGalleryIcon,
  bullseye: BullseyeIcon,
};

export function WelcomeBanner({ user }: { user: DashboardUser }) {
  const Paragraph = text.p;
  const SectionLabel = text.span;

  const tasks = buildGetStartedTasks(user);
  const doneCount = tasks.filter((task) => task.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const allDone = doneCount === total;

  return (
    <DashboardSection id="overview">
      <div className="dashboard-welcome">
        <div className="dashboard-welcome-hero">
          <TextLockup
            title="Welcome to GoIgnite"
            size="lg"
            textMaxWidth={false}
            className="dashboard-welcome-lockup"
          >
            <Paragraph as="paragraph" emphasis="passive">
              You&apos;re building <strong>{user.businessName}</strong>.{" "}
              {allDone
                ? "You've got the essentials in place — keep the momentum going below."
                : "Here's where to start, based on what you told us."}
            </Paragraph>
          </TextLockup>
        </div>

        <div className="dashboard-getstarted">
          <div className="dashboard-getstarted-head">
            <SectionLabel as="label" className="dashboard-shortcuts-label">
              Get started
            </SectionLabel>
            <div className="dashboard-getstarted-progress">
              <span className="dashboard-getstarted-progress-track">
                <span
                  className="dashboard-getstarted-progress-fill"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="dashboard-getstarted-progress-label">
                {doneCount} of {total} done
              </span>
            </div>
          </div>

          <div className="dashboard-getstarted-grid">
            {tasks.map((task) => {
              const Icon = taskIcons[task.icon] ?? SparklesFilledIcon;
              const className =
                "dashboard-getstarted-task" +
                (task.done ? " dashboard-getstarted-task--done" : "") +
                (task.highlighted && !task.done
                  ? " dashboard-getstarted-task--highlight"
                  : "");

              const inner = (
                <>
                  <span className="dashboard-getstarted-icon">
                    {task.done ? (
                      <CheckmarkIcon width={18} height={18} />
                    ) : (
                      <Icon width={20} height={20} />
                    )}
                  </span>
                  <span className="dashboard-getstarted-text">
                    <span className="dashboard-getstarted-label">
                      {task.label}
                      {task.highlighted && !task.done && (
                        <span className="dashboard-getstarted-tag">For you</span>
                      )}
                    </span>
                    <span className="dashboard-getstarted-desc">
                      {task.done ? "Already in place" : task.desc}
                    </span>
                  </span>
                  {!task.done && (
                    <span className="dashboard-getstarted-arrow">
                      <ArrowRightIcon width={16} height={16} />
                    </span>
                  )}
                </>
              );

              if (task.done) {
                return (
                  <div key={task.id} className={className} aria-disabled>
                    {inner}
                  </div>
                );
              }

              return (
                <a
                  key={task.id}
                  href={task.href}
                  className={className}
                  {...(task.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {inner}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}
