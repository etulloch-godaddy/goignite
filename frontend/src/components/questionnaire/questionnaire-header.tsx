"use client";

import Button from "@ux/button";
import BellIcon from "@ux/icon/bell";
import AppsIcon from "@ux/icon/apps";
import CartIcon from "@ux/icon/cart";
import GdLogoIcon from "@ux/icon/gd-logo";
import "@ux/icon/gd-logo/index.css";

export function QuestionnaireHeader() {
  return (
    <header className="q-header">
      <div className="q-header-inner">
        <GdLogoIcon width={173} height={36} title="GoDaddy" className="q-header-logo" />

        <div className="q-header-actions">
          <Button design="control" size="md" aria-label="Notifications" className="ux-button-square">
            <BellIcon width={18} height={18} />
          </Button>
          <Button design="control" size="md" aria-label="Apps" className="ux-button-square">
            <AppsIcon width={18} height={18} />
          </Button>
          <span className="q-profile-chip" aria-label="User profile">
            JD
          </span>
          <Button design="control" size="md" aria-label="Cart" className="ux-button-square">
            <CartIcon width={18} height={18} />
          </Button>
        </div>
      </div>
    </header>
  );
}
