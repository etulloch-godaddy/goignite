"use client";

import Button from "@ux/button";
import text from "@ux/text";

export function InvestorReadyCTA() {
  const Heading = text.span;
  const Paragraph = text.p;

  return (
    <div className="investor-cta-card">
      <div>
        <div className="investor-cta-badge">New</div>
        <Heading as="heading" size={0} style={{ color: "#ffffff", display: "block", marginBottom: 6 }}>
          Ready to pitch investors?
        </Heading>
        <Paragraph as="paragraph" size={-1} style={{ color: "#aaaaaa", margin: 0 }}>
          Form your LLC, generate an investor pitch, and find funding matched to your stage.
        </Paragraph>
      </div>
      <Button design="primary" text="Get Investor Ready →" href="/investor-ready" />
    </div>
  );
}
