"use client";

import Box, { box } from "@ux/box";
import Button from "@ux/button";
import text from "@ux/text";
import RefreshIcon from "@ux/icon/refresh";
import BellIcon from "@ux/icon/bell";
import AppsIcon from "@ux/icon/apps";
import CartIcon from "@ux/icon/cart";
import type { DashboardUser } from "@/lib/dashboard-data";

const Header = box.header;

export function DashboardHeader({ user }: { user: DashboardUser }) {
  const initials = `${user.firstName.charAt(0)}${user.businessName.charAt(0)}`.toUpperCase();

  return (
    <Header
      orientation="horizontal"
      inlineAlignChildren="end"
      blockAlignChildren="center"
      inlinePadding="lg"
      blockPadding="sm"
      className="dashboard-header"
    >
      <Box orientation="horizontal" gap="md" inlineAlignChildren="center">
        <Button design="inline" text="Nav Button" href="#" />
        <button type="button" className="dashboard-icon-button" aria-label="Refresh">
          <RefreshIcon width={18} height={18} />
        </button>
        <div className="dashboard-header-divider" aria-hidden />
        <Button design="inline" text="Help Center" href="#" />
        <button type="button" className="dashboard-icon-button" aria-label="Notifications">
          <BellIcon width={18} height={18} />
        </button>
        <button type="button" className="dashboard-icon-button" aria-label="Apps">
          <AppsIcon width={18} height={18} />
        </button>
        <span className="dashboard-profile-chip" aria-label={`${user.firstName}'s profile`}>
          {initials}
        </span>
        <button type="button" className="dashboard-icon-button" aria-label="Cart">
          <CartIcon width={18} height={18} />
        </button>
      </Box>
    </Header>
  );
}
