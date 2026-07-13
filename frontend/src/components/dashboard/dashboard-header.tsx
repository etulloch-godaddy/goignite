"use client";

import Box, { box } from "@ux/box";
import SearchIcon from "@ux/icon/search";
import BookmarkIcon from "@ux/icon/bookmark";
import BellIcon from "@ux/icon/bell";
import AppsIcon from "@ux/icon/apps";
import type { DashboardUser } from "@/lib/dashboard-data";

const Header = box.header;

export function DashboardHeader({ user }: { user: DashboardUser }) {
  const initials = `${user.firstName.charAt(0)}${user.businessName.charAt(0)}`.toUpperCase();

  return (
    <Header
      orientation="horizontal"
      gap="lg"
      blockAlignChildren="center"
      inlinePadding="lg"
      blockPadding="sm"
      className="dashboard-header"
    >
      <label className="dashboard-search">
        <SearchIcon width={18} height={18} />
        <input
          type="search"
          placeholder="Search missions, tools, and help…"
          aria-label="Search"
        />
      </label>

      <Box stretch />

      <Box orientation="horizontal" gap="sm" inlineAlignChildren="center">
        <button type="button" className="dashboard-icon-button" aria-label="Saved">
          <BookmarkIcon width={18} height={18} />
        </button>
        <button type="button" className="dashboard-icon-button" aria-label="Notifications">
          <BellIcon width={18} height={18} />
        </button>
        <button type="button" className="dashboard-icon-button" aria-label="Apps">
          <AppsIcon width={18} height={18} />
        </button>
        <span className="dashboard-profile-chip" aria-label={`${user.firstName}'s profile`}>
          {initials}
        </span>
      </Box>
    </Header>
  );
}
