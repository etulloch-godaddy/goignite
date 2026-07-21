"use client";

import { useRef, useState } from "react";
import Box, { box } from "@ux/box";
import Tag from "@ux/tag";
import text from "@ux/text";
import GdTheGoIcon from "@ux/icon/gd-the-go";
import DashboardIcon from "@ux/icon/dashboard";
import CheckboxListIcon from "@ux/icon/checkbox-list";
import ContentIcon from "@ux/icon/content";
import BullseyeIcon from "@ux/icon/bullseye";
import DomainIcon from "@ux/icon/domain";
import PageIcon from "@ux/icon/page";
import LightbulbIcon from "@ux/icon/lightbulb";
import GraphIcon from "@ux/icon/graph";
import LockedIcon from "@ux/icon/locked";
import SocialIcon from "@ux/icon/social";
import ChevronDownIcon from "@ux/icon/chevron-down";
import SidebarCollapseIcon from "@ux/icon/sidebar-collapse";
import type { NavItem } from "@/lib/dashboard-data";
import { patchOnboarding } from "@/services/api";

const USER_ID_KEY = "creatorlevel_user_id";

const Aside = box.aside;
const Nav = box.nav;

const iconMap = {
  dashboard: DashboardIcon,
  "checkbox-list": CheckboxListIcon,
  content: ContentIcon,
  bullseye: BullseyeIcon,
  domain: DomainIcon,
  page: PageIcon,
  lightbulb: LightbulbIcon,
  graph: GraphIcon,
  social: SocialIcon,
} as const;

function NavIcon({ name }: { name: string }) {
  const Icon = iconMap[name as keyof typeof iconMap];
  if (!Icon) return null;
  return <Icon width={24} height={24} />;
}

function NavLink({
  item,
  active,
}: {
  item: NavItem;
  active?: boolean;
}) {
  const Label = text.span;

  if (item.locked) {
    return (
      <button type="button" disabled className="dashboard-nav-item">
        <NavIcon name={item.icon} />
        <Label as="label" className="flex-1 text-left">
          {item.label}
        </Label>
        <LockedIcon width={14} height={14} />
      </button>
    );
  }

  return (
    <a
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "dashboard-nav-item dashboard-nav-item--active"
          : "dashboard-nav-item"
      }
    >
      <NavIcon name={item.icon} />
      <Label as="label" className="flex-1">
        {item.label}
      </Label>
      {item.badge && (
        <Tag emphasis="highlight" size="sm">
          {item.badge}
        </Tag>
      )}
    </a>
  );
}

export function DashboardSidebar({
  businessName,
  primary,
  growth,
  activeSection = "overview",
}: {
  businessName: string;
  primary: NavItem[];
  growth: NavItem[];
  activeSection?: string;
}) {
  const Caption = text.span;
  const Heading = text.span;

  const [editing, setEditing] = useState(false);
  const [localName, setLocalName] = useState(businessName || "My Business");
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setLocalName(localName || businessName);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  async function commitEdit() {
    setEditing(false);
    const trimmed = localName.trim() || businessName;
    setLocalName(trimmed);
    const userId = localStorage.getItem(USER_ID_KEY);
    if (userId && trimmed !== businessName) {
      patchOnboarding(userId, { business_name: trimmed }).catch(() => {});
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") { setLocalName(businessName); setEditing(false); }
  }

  return (
    <Aside
      orientation="vertical"
      blockPadding="lg"
      inlinePadding="md"
      className="dashboard-sidebar shrink-0"
    >
      <Box
        orientation="horizontal"
        inlineAlignChildren="center"
        blockAlignChildren="center"
        className="mb-8 px-1"
      >
        <a
          href="/dashboard"
          className="dashboard-logo-link"
          aria-label="Go to dashboard"
        >
          <GdTheGoIcon width={24} height={24} />
        </a>
        <Box stretch />
        <button
          type="button"
          className="dashboard-icon-button"
          aria-label="Collapse navigation"
        >
          <SidebarCollapseIcon width={24} height={24} />
        </button>
      </Box>

      {editing ? (
        <input
          ref={inputRef}
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          placeholder="Your business name"
          className="dashboard-business-name-input mb-2"
        />
      ) : (
        <button type="button" onClick={startEdit} className="dashboard-nav-item dashboard-workspace-switcher mb-2" title="Click to rename">
          <Heading as="label" className="flex-1 text-left" style={{ cursor: "text" }}>
            {localName}
          </Heading>
          <ChevronDownIcon width={16} height={16} />
        </button>
      )}

      <Nav orientation="vertical" gap="sm">
        {primary.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={item.id === activeSection}
          />
        ))}
      </Nav>

      <div className="dashboard-nav-divider" />

      <Caption as="caption" emphasis="passive" className="px-2 py-1">
        Grows with you
      </Caption>

      <Nav orientation="vertical" gap="sm" className="mt-1">
        {growth.map((item) => (
          <NavLink key={item.id} item={item} />
        ))}
      </Nav>
    </Aside>
  );
}
