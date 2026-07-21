"use client";

import TextLockup from "@ux/text-lockup";
import text from "@ux/text";
import type { ComponentType } from "react";
import ContentIcon from "@ux/icon/content";
import DomainIcon from "@ux/icon/domain";
import WebsiteIcon from "@ux/icon/website";
import ColorPaletteIcon from "@ux/icon/color-palette";
import MailIcon from "@ux/icon/mail";
import CreditCardIcon from "@ux/icon/credit-card";
import SocialIcon from "@ux/icon/social";
import ArrowRightIcon from "@ux/icon/arrow-right";
import SparklesFilledIcon from "@ux/icon/sparkles-filled";
import { type DashboardUser } from "@/lib/dashboard-data";
import { EXPLORE_TOOLS } from "@/lib/get-started";
import { DashboardSection } from "./dashboard-section";

type IconType = ComponentType<{ width?: number; height?: number }>;

const toolIcons: Record<string, IconType> = {
  content: ContentIcon,
  domain: DomainIcon,
  website: WebsiteIcon,
  "color-palette": ColorPaletteIcon,
  mail: MailIcon,
  "credit-card": CreditCardIcon,
  social: SocialIcon,
};

export function WelcomeBanner({ user }: { user: DashboardUser }) {
  const Paragraph = text.p;
  const SectionLabel = text.span;

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
              You&apos;re building <strong>{user.businessName}</strong>. Jump into
              a tool or keep building your milestones below.
            </Paragraph>
          </TextLockup>
        </div>

        <div className="dashboard-explore">
          <SectionLabel as="label" className="dashboard-shortcuts-label">
            Explore your tools
          </SectionLabel>

          <div className="dashboard-explore-grid">
            {EXPLORE_TOOLS.map((tool) => {
              const Icon = toolIcons[tool.icon] ?? SparklesFilledIcon;
              return (
                <a
                  key={tool.id}
                  href={tool.href}
                  className="dashboard-explore-card"
                  {...(tool.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <span className="dashboard-explore-icon">
                    <Icon width={20} height={20} />
                  </span>
                  <span className="dashboard-explore-text">
                    <span className="dashboard-explore-label">{tool.label}</span>
                    <span className="dashboard-explore-desc">{tool.desc}</span>
                  </span>
                  <span className="dashboard-explore-arrow">
                    <ArrowRightIcon width={16} height={16} />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}
