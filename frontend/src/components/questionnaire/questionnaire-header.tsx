"use client";

import BellIcon from "@ux/icon/bell";
import AppsIcon from "@ux/icon/apps";
import CartIcon from "@ux/icon/cart";
import GdLogoIcon from "@ux/icon/gd-logo";

export function QuestionnaireHeader() {
  return (
    <header className="q-header">
      <div className="q-header-inner">
        <span className="q-header-logo">
          <GdLogoIcon width={115} height={24} title="GoDaddy" />
        </span>

        <div className="q-header-actions">
          <button type="button" className="q-icon-button" aria-label="Notifications">
            <BellIcon width={18} height={18} />
          </button>
          <button type="button" className="q-icon-button" aria-label="Apps">
            <AppsIcon width={18} height={18} />
          </button>
          <span className="q-profile-chip" aria-label="User profile">
            JD
          </span>
          <button type="button" className="q-icon-button" aria-label="Cart">
            <CartIcon width={18} height={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
