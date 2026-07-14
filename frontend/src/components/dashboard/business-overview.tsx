"use client";

import { useEffect, useState, type ComponentType } from "react";
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
import { getSocialStats, type SocialStats } from "@/services/api";
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

const PLATFORM_COLOR: Record<string, string> = {
  instagram: "#e1306c",
  tiktok: "#010101",
  facebook: "#1877f2",
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function SocialAnalyticsCard({ userId }: { userId: string }) {
  const [stats, setStats] = useState<SocialStats[]>([]);

  useEffect(() => {
    getSocialStats(userId).then(setStats).catch(() => {});
  }, [userId]);

  const connected = stats.filter((s) => s.connected);
  const totalFollowers = connected.reduce((sum, s) => sum + (s.followers ?? 0), 0);

  return (
    <div className="dashboard-overview-card">
      <div className="dashboard-overview-head">
        <span className="dashboard-match-logo dashboard-match-logo--teal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
          </svg>
        </span>
        <div className="dashboard-overview-head-text">
          <Heading as="heading" size={0} className="dashboard-overview-title">
            Social &amp; Marketing
          </Heading>
          <Desc as="paragraph" className="dashboard-overview-sub">
            Your audience reach across connected platforms.
          </Desc>
        </div>
      </div>

      {connected.length === 0 ? (
        <div className="dashboard-social-empty">
          <p className="dashboard-social-empty-text">No platforms connected yet.</p>
          <Button design="secondary" size="sm" text="Connect platforms" href="/social" />
        </div>
      ) : (
        <div className="dashboard-social-stats">
          <div className="dashboard-social-total">
            <span className="dashboard-social-total-value">{fmt(totalFollowers)}</span>
            <span className="dashboard-social-total-label">total followers</span>
          </div>
          <div className="dashboard-social-platform-list">
            {connected.map((s) => (
              <div key={s.platform} className="dashboard-social-platform-row">
                <span className="dashboard-social-dot" style={{ background: PLATFORM_COLOR[s.platform] ?? "#6b7575" }} />
                <span className="dashboard-social-platform-name">{s.platform}</span>
                <span className="dashboard-social-platform-bar-wrap">
                  <span
                    className="dashboard-social-platform-bar"
                    style={{ width: `${Math.min(100, ((s.followers ?? 0) / Math.max(totalFollowers, 1)) * 100)}%` }}
                  />
                </span>
                <span className="dashboard-social-platform-count">{fmt(s.followers ?? 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-overview-actions">
        <Button design="primary" size="sm" text="Open Social Hub" href="/social" />
      </div>
    </div>
  );
}

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
        {/* Left: step-by-step checklist */}
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

        {/* Right column */}
        <div className="dashboard-insights-stack">
          {/* Social media — coming soon */}
          <div className="dashboard-overview-card dashboard-placeholder-card">
            <div className="dashboard-placeholder-label">Social Media</div>
            <div className="dashboard-placeholder-body">Set up your social media to start</div>
          </div>

          {/* Business analytics — coming soon */}
          <div className="dashboard-overview-card dashboard-placeholder-card">
            <div className="dashboard-placeholder-label">Business Analytics</div>
            <div className="dashboard-placeholder-body">Connect your accounts to unlock business analytics</div>
          </div>
        </div>

        {/*
        ORIGINAL RIGHT COLUMN — restore when ready:

        <div className="dashboard-insights-stack">
          {user.userId && <SocialAnalyticsCard userId={user.userId} />}

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
                  How <strong>{user.businessName}</strong> is tracking across the basics.
                </Desc>
              </div>
            </div>
            <div className="dashboard-analytics-rings">
              {focusAreas.map((area) => (
                <div key={area.id} className="dashboard-analytics-ring">
                  <span className="dashboard-analytics-ring-label">{area.label}</span>

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
        */}
      </div>
    </DashboardSection>
  );
}
