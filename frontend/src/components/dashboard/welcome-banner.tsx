"use client";

import Box from "@ux/box";
import Button from "@ux/button";
import TextLockup from "@ux/text-lockup";
import text from "@ux/text";
import type { DashboardUser } from "@/lib/dashboard-data";
import { getStageLabel } from "@/lib/dashboard-data";
import { DashboardSection } from "./dashboard-section";

type Promo = {
  id: string;
  title: string;
  cta: string;
  href: string;
  variant: "peach" | "purple" | "green";
};

const promos: Promo[] = [
  {
    id: "missions",
    title: "Complete today's missions",
    cta: "Browse missions",
    href: "#missions",
    variant: "peach",
  },
  {
    id: "path",
    title: "See your growth path",
    cta: "View path",
    href: "#roadmap",
    variant: "purple",
  },
  {
    id: "refer",
    title: "Refer and earn XP",
    cta: "Invite friends",
    href: "#refer",
    variant: "green",
  },
];

export function WelcomeBanner({ user }: { user: DashboardUser }) {
  const Paragraph = text.p;
  const PromoTitle = text.span;

  return (
    <DashboardSection id="overview">
      <Box
        elevation="raised"
        rounding="reduced"
        blockPadding="lg"
        inlinePadding="lg"
        className="dashboard-welcome"
      >
        <div className="dashboard-welcome-grid">
          <Box orientation="vertical" gap="sm" blockAlignChildren="center">
            <TextLockup title="Welcome to GoIgnite" size="lg" textMaxWidth={false}>
              <Paragraph as="paragraph" emphasis="passive">
                You&apos;re building <strong>{user.businessName}</strong> in the{" "}
                {getStageLabel(user.stage)} stage. Pick one small step today —
                no business degree required.
              </Paragraph>
            </TextLockup>
          </Box>

          {promos.map((promo) => (
            <div
              key={promo.id}
              className={`dashboard-promo-card dashboard-promo-card--${promo.variant}`}
            >
              <PromoTitle as="heading" size={0} className="dashboard-promo-title">
                {promo.title}
              </PromoTitle>
              <Button design="primary" size="sm" text={promo.cta} href={promo.href} />
            </div>
          ))}
        </div>
      </Box>
    </DashboardSection>
  );
}
