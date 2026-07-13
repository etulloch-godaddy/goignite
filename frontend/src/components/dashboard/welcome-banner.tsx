"use client";

import Box from "@ux/box";
import TextLockup from "@ux/text-lockup";
import text from "@ux/text";
import GraphIcon from "@ux/icon/graph";
import CheckboxListIcon from "@ux/icon/checkbox-list";
import ContentIcon from "@ux/icon/content";
import BullseyeIcon from "@ux/icon/bullseye";
import DomainIcon from "@ux/icon/domain";
import PageIcon from "@ux/icon/page";
import LightbulbIcon from "@ux/icon/lightbulb";
import SparklesFilledIcon from "@ux/icon/sparkles-filled";
import LockedIcon from "@ux/icon/locked";
import type { ComponentType } from "react";
import { buildGrowthNav, type DashboardUser } from "@/lib/dashboard-data";
import { DashboardSection } from "./dashboard-section";

type IconType = ComponentType<{ width?: number; height?: number }>;

type Shortcut = {
  id: string;
  label: string;
  desc: string;
  icon: IconType;
  href: string;
  locked?: boolean;
  lockReason?: string;
};

const growthIcons: Record<string, IconType> = {
  domain: DomainIcon,
  page: PageIcon,
  lightbulb: LightbulbIcon,
};

const growthDescriptions: Record<string, string> = {
  domain: "Claim your web address",
  website: "Build your online home",
  funding: "Find money to grow",
};

export function WelcomeBanner({ user }: { user: DashboardUser }) {
  const Paragraph = text.p;
  const ShortcutsLabel = text.span;

  const coreShortcuts: Shortcut[] = [
    { id: "path", label: "Your path", desc: "See your growth roadmap", icon: GraphIcon, href: "#roadmap" },
    { id: "checklist", label: "Your checklist", desc: "Small steps to grow", icon: CheckboxListIcon, href: "#missions" },
    { id: "profile", label: "Business profile", desc: "Tell your story", icon: ContentIcon, href: "#profile" },
    { id: "assistant", label: "AI assistant", desc: "Ask anything, jargon-free", icon: SparklesFilledIcon, href: "#assistant" },
    { id: "achievements", label: "Achievements", desc: "Celebrate your wins", icon: BullseyeIcon, href: "#achievements" },
  ];

  const growthShortcuts: Shortcut[] = buildGrowthNav(user.stage).map((item) => ({
    id: item.id,
    label: item.label,
    desc: growthDescriptions[item.id] ?? "",
    icon: growthIcons[item.icon] ?? DomainIcon,
    href: item.href,
    locked: item.locked,
    lockReason: item.lockReason,
  }));

  const shortcuts = [...coreShortcuts, ...growthShortcuts];

  return (
    <DashboardSection id="overview">
      <Box
        elevation="raised"
        rounding="reduced"
        blockPadding="lg"
        inlinePadding="lg"
        className="dashboard-welcome"
      >
        <div className="dashboard-welcome-hero">
        <TextLockup
          title="Welcome to GoIgnite"
          size="lg"
          textMaxWidth={false}
          className="dashboard-welcome-lockup"
        >
          <Paragraph as="paragraph" emphasis="passive">
            You&apos;re building <strong>{user.businessName}</strong>. Not sure where
            to begin? Take one small step, then explore your tools below.
          </Paragraph>
        </TextLockup>
      </div>

      <div className="dashboard-shortcuts">
        <ShortcutsLabel as="label" className="dashboard-shortcuts-label">
          Explore your tools
        </ShortcutsLabel>

        <div className="dashboard-shortcut-grid">
          {shortcuts.map((tool) => {
            const Icon = tool.icon;
            const className = tool.locked
              ? "dashboard-shortcut dashboard-shortcut--locked"
              : "dashboard-shortcut";

            const inner = (
              <>
                <span className="dashboard-shortcut-icon">
                  <Icon width={20} height={20} />
                </span>
                <span className="dashboard-shortcut-text">
                  <span className="dashboard-shortcut-label">{tool.label}</span>
                  <span className="dashboard-shortcut-desc">
                    {tool.locked ? tool.lockReason : tool.desc}
                  </span>
                </span>
                {tool.locked && (
                  <span className="dashboard-shortcut-lock">
                    <LockedIcon width={14} height={14} />
                  </span>
                )}
              </>
            );

            if (tool.locked) {
              return (
                <div key={tool.id} className={className} aria-disabled>
                  {inner}
                </div>
              );
            }

            return (
              <a key={tool.id} href={tool.href} className={className}>
                {inner}
              </a>
            );
          })}
        </div>
      </div>
      </Box>
    </DashboardSection>
  );
}
