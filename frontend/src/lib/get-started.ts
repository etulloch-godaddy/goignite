import type { DashboardUser, Stage } from "./dashboard-data";

/** Every checklist task is worth the same amount of XP. */
export const XP_PER_TASK = 125;

/** How a task gets completed / what its trailing action does. */
export type TaskAction =
  /** External GoDaddy product CTA — opens in a new tab. */
  | { kind: "cta"; label: string; href: string; external: true }
  /** Links to an in-app module (social, funding, business, domain). */
  | { kind: "link"; label: string; href: string }
  /** The user simply checks it off themselves — no destination. */
  | { kind: "self" };

export type GetStartedTask = {
  id: string;
  label: string;
  desc: string;
  icon: string;
  xp: number;
  action: TaskAction;
  /**
   * When true the task is derived from onboarding/profile data and is always
   * complete — the user can't toggle it off.
   */
  autoDone: boolean;
};

export type GetStartedStage = {
  id: Stage;
  label: string;
  tagline: string;
  tasks: GetStartedTask[];
  /** Optional milestone unlocked once every task in this stage is done. */
  unlockNote?: string;
};

const GODADDY = {
  email: "https://www.godaddy.com/email/professional-business-email",
  website: "https://www.godaddy.com/websites/website-builder",
  payments: "https://www.godaddy.com/payments",
  airo: "https://www.godaddy.com/airo",
} as const;

/** A tool the user can browse into — powers the "Explore tools" grid. */
export type ExploreTool = {
  id: string;
  label: string;
  desc: string;
  icon: string;
  href: string;
  external?: boolean;
};

export const EXPLORE_TOOLS: ExploreTool[] = [
  {
    id: "business",
    label: "My Business",
    desc: "Tell your story and manage your profile.",
    icon: "content",
    href: "/business",
  },
  {
    id: "domain",
    label: "Domains",
    desc: "Find and claim your web address.",
    icon: "domain",
    href: "#domain",
  },
  {
    id: "website",
    label: "Website Builder",
    desc: "Stand up your site in minutes.",
    icon: "website",
    href: GODADDY.website,
    external: true,
  },
  {
    id: "logo",
    label: "Logo & Branding",
    desc: "Give your brand a look with Airo.",
    icon: "color-palette",
    href: GODADDY.airo,
    external: true,
  },
  {
    id: "email",
    label: "Professional Email",
    desc: "Get an address at your own domain.",
    icon: "mail",
    href: GODADDY.email,
    external: true,
  },
  {
    id: "payments",
    label: "Payments",
    desc: "Accept cards and get paid.",
    icon: "credit-card",
    href: GODADDY.payments,
    external: true,
  },
  {
    id: "social",
    label: "Social",
    desc: "Grow and track your audience.",
    icon: "social",
    href: "/social",
  },
];

/**
 * Builds the stage-grouped "Get started" checklist. Tasks that can be inferred
 * from onboarding/profile data are pre-completed (`autoDone`); everything else
 * is completed by the user checking it off (which awards XP client-side).
 */
export function buildGetStartedStages(user: DashboardUser): GetStartedStage[] {
  const hasName = Boolean(user.businessName && user.businessName !== "My Business");
  const hasPitch = Boolean(user.profile.pitch);
  const hasDomain = Boolean(user.profile.domain);

  const task = (
    t: Omit<GetStartedTask, "xp" | "autoDone"> & { autoDone?: boolean },
  ): GetStartedTask => ({ xp: XP_PER_TASK, autoDone: false, ...t });

  return [
    {
      id: "starter",
      label: "Starter",
      tagline: "Get your idea off the ground",
      unlockNote: "Unlocks Social Media",
      tasks: [
        task({
          id: "business-name",
          label: "Set your business name",
          desc: "Pulled in from onboarding so we can tailor everything to you.",
          icon: "content",
          action: { kind: "self" },
          autoDone: hasName,
        }),
        task({
          id: "pitch",
          label: "Write your 1-sentence pitch",
          desc: "Say what you do in a single line — you can refine it anytime.",
          icon: "edit",
          action: { kind: "link", label: "Add pitch", href: "/business" },
          autoDone: hasPitch,
        }),
        task({
          id: "domain",
          label: "Register your domain",
          desc: "Claim your web address before someone else does.",
          icon: "domain",
          action: { kind: "link", label: "Find a domain", href: "#domain" },
          autoDone: hasDomain,
        }),
        task({
          id: "email",
          label: "Get a professional email",
          desc: "Look legit with an address at your own domain.",
          icon: "mail",
          action: {
            kind: "cta",
            label: "Get Workspace Email",
            href: GODADDY.email,
            external: true,
          },
        }),
      ],
    },
    {
      id: "builder",
      label: "Builder",
      tagline: "Build your online presence",
      tasks: [
        task({
          id: "website",
          label: "Build your website",
          desc: "Stand up a home for your brand in minutes.",
          icon: "website",
          action: {
            kind: "cta",
            label: "Open Website Builder",
            href: GODADDY.website,
            external: true,
          },
        }),
        task({
          id: "pricing",
          label: "Set your pricing",
          desc: "Decide what you charge so you're ready to sell.",
          icon: "dollar",
          action: { kind: "link", label: "Set pricing", href: "/business" },
        }),
        task({
          id: "social",
          label: "Connect your social media",
          desc: "Link your accounts to track reach and grow your audience.",
          icon: "social",
          action: { kind: "link", label: "Connect socials", href: "/social" },
        }),
        task({
          id: "first-sale",
          label: "Make your first sale",
          desc: "Turn interest into your very first paying customer.",
          icon: "cart",
          action: { kind: "self" },
        }),
      ],
    },
    {
      id: "brand",
      label: "Brand",
      tagline: "Grow your audience",
      unlockNote: "Unlocks Investor Ready",
      tasks: [
        task({
          id: "followers",
          label: "Hit 1K followers on Instagram",
          desc: "Build the audience that turns into customers.",
          icon: "users3",
          action: { kind: "link", label: "Go to Social", href: "/social" },
        }),
        task({
          id: "testimonial",
          label: "Get your first customer testimonial",
          desc: "Someone vouched for your work — proof you're the real deal.",
          icon: "star",
          action: { kind: "self" },
        }),
        task({
          id: "featured",
          label: "Get featured somewhere",
          desc: "Press, a newsletter, a podcast, or a blog picked you up.",
          icon: "megaphone",
          action: { kind: "self" },
        }),
        task({
          id: "payments",
          label: "Set up payments",
          desc: "Accept cards and get paid without the friction.",
          icon: "credit-card",
          action: {
            kind: "cta",
            label: "Set up GoDaddy Payments",
            href: GODADDY.payments,
            external: true,
          },
        }),
      ],
    },
    {
      id: "investor_ready",
      label: "Investor Ready",
      tagline: "Formalize and scale",
      tasks: [
        task({
          id: "llc",
          label: "Form your LLC",
          desc: "Make it official and protect yourself legally.",
          icon: "shield-check",
          action: {
            kind: "cta",
            label: "Form your LLC with Airo",
            href: GODADDY.airo,
            external: true,
          },
        }),
        task({
          id: "investor-meeting",
          label: "Land a meeting with investors",
          desc: "Use your pitch deck to book that first conversation.",
          icon: "group",
          action: { kind: "link", label: "Prep your pitch", href: "/investor-ready" },
        }),
        task({
          id: "funding",
          label: "Apply for funding",
          desc: "Find grants and funding matched to your business.",
          icon: "lightbulb",
          action: { kind: "link", label: "Explore funding", href: "/investor-ready" },
        }),
        task({
          id: "accelerator",
          label: "Apply to an accelerator",
          desc: "Get mentorship, network, and capital to scale faster.",
          icon: "graph",
          action: { kind: "self" },
        }),
      ],
    },
  ];
}
