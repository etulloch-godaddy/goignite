"use client";

import type { ComponentType } from "react";
import Button from "@ux/button";
import CircularProgress from "@ux/circular-progress";
import text from "@ux/text";
import CheckboxListIcon from "@ux/icon/checkbox-list";
import CheckmarkIcon from "@ux/icon/checkmark";
import CircleIcon from "@ux/icon/circle";
import BarGraphIcon from "@ux/icon/bar-graph";
import ArrowRightIcon from "@ux/icon/arrow-right";
import DomainIcon from "@ux/icon/domain";
import WebsiteIcon from "@ux/icon/website";
import OnlineStoreIcon from "@ux/icon/online-store";
import WorldIcon from "@ux/icon/world";
import type { DashboardUser, Stage } from "@/lib/dashboard-data";
import { DashboardSection } from "./dashboard-section";

const Title = text.span;
const Heading = text.span;
const Desc = text.p;

type GoDaddyProduct = {
  icon: ComponentType<{ width?: number; height?: number }>;
  name: string;
  desc: string;
  cta: string;
  href: string;
};

const PRODUCT_BY_STAGE: Record<Stage, GoDaddyProduct> = {
  starter: {
    icon: DomainIcon,
    name: "Claim your domain",
    desc: "Lock in your business name with a custom domain before someone else takes it.",
    cta: "Search domains",
    href: "https://www.godaddy.com/domains/domain-name-search",
  },
  builder: {
    icon: WebsiteIcon,
    name: "Build your website",
    desc: "Turn your idea into a real online home with Websites + Marketing.",
    cta: "Start your site",
    href: "https://www.godaddy.com/websites/website-builder",
  },
  brand: {
    icon: OnlineStoreIcon,
    name: "Open your online store",
    desc: "Start selling and take payments with a GoDaddy online store.",
    cta: "Sell online",
    href: "https://www.godaddy.com/online-store",
  },
  investor_ready: {
    icon: WorldIcon,
    name: "Grow with the full suite",
    desc: "Add professional email, marketing, and commerce tools as you scale.",
    cta: "Explore products",
    href: "https://www.godaddy.com/",
  },
};

export function BusinessOverview({ user }: { user: DashboardUser }) {
  const steps = user.todaysMissions;
  const done = user.completedMissionCount;
  const total = done + steps.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const analytics = [
    { id: "money", label: "Money", value: 45 },
    { id: "seo", label: "SEO", value: 50 },
    { id: "traffic", label: "Web traffic", value: 32 },
  ];

  const product = PRODUCT_BY_STAGE[user.stage];
  const ProductIcon = product.icon;

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

            <div className="dashboard-analytics-metrics">
              {analytics.map((metric) => (
                <div key={metric.id} className="dashboard-analytics-metric">
                  <CircularProgress
                    size="sm"
                    value={metric.value}
                    output={`${metric.value}%`}
                  />
                  <span className="dashboard-analytics-metric-label">{metric.label}</span>
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
                <ProductIcon width={20} height={20} />
              </span>
              <div className="dashboard-overview-head-text">
                <Heading as="heading" size={0} className="dashboard-overview-title">
                  Ready for the next step?
                </Heading>
                <Desc as="paragraph" className="dashboard-overview-sub">
                  You&apos;ve started strong. When you&apos;re ready, take{" "}
                  <strong>{user.businessName}</strong> live with GoDaddy.
                </Desc>
              </div>
            </div>

            <div className="dashboard-overview-rec">
              <span className="dashboard-overview-rec-title">{product.name}</span>
              <span className="dashboard-overview-rec-desc">{product.desc}</span>
            </div>

            <div className="dashboard-overview-actions">
              <Button design="primary" size="sm" href={product.href} external>
                <span>{product.cta}</span>
                <ArrowRightIcon width={15} height={15} />
              </Button>
              <Button
                design="tertiary"
                size="sm"
                text="See all products"
                href="https://www.godaddy.com/"
                external
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}
