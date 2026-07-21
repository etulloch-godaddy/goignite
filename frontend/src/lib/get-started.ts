import type { DashboardUser } from "./dashboard-data";

export type GetStartedTask = {
  id: string;
  label: string;
  desc: string;
  /** Icon key resolved by the component that renders the task. */
  icon: string;
  href: string;
  external?: boolean;
  /** True when the user already has this in place (from onboarding answers). */
  done: boolean;
  /** True when this task maps to something the user said confused them. */
  highlighted?: boolean;
};

/** Onboarding "existing asset" chip labels (see questionnaire-chips). */
const ASSET = {
  businessName: "Business name",
  logo: "Logo",
  website: "Website",
  social: "Social media",
  productPhotos: "Product photos",
  payingCustomers: "Paying customers",
} as const;

/** Onboarding "confusion" chip labels mapped to the task they relate to. */
const CONFUSION_TO_TASK: Record<string, string> = {
  "Knowing where to start": "profile",
  "Building my website": "domain",
  "Branding & design": "logo",
  "Marketing & social media": "social",
  "Getting customers & sales": "customers",
  "Pricing & making money": "customers",
};

/**
 * Builds a personalized "Get started" checklist from the answers a user gave
 * during onboarding. Tasks the user already has are marked done; the ones tied
 * to areas they said confused them are highlighted and floated to the top.
 */
export function buildGetStartedTasks(user: DashboardUser): GetStartedTask[] {
  const assets = new Set(user.onboarding.existingAssets);
  const confusion = new Set(user.onboarding.confusionAreas);
  const hasProfile = Boolean(user.profile.pitch || user.profile.bio);
  const hasDomain = Boolean(user.profile.domain);

  const highlighted = new Set(
    [...confusion].map((c) => CONFUSION_TO_TASK[c]).filter(Boolean),
  );

  const tasks: GetStartedTask[] = [
    {
      id: "profile",
      label: "Build your business profile",
      desc: "Tell your story so we can tailor every next step to you.",
      icon: "content",
      href: "/business",
      done: hasProfile,
    },
    {
      id: "domain",
      label: "Connect a domain",
      desc: "Claim your web address before someone else does.",
      icon: "domain",
      href: "#domain",
      done: assets.has(ASSET.website) || hasDomain,
    },
    {
      id: "social",
      label: "Connect your socials",
      desc: "Link your accounts to track reach and grow your audience.",
      icon: "megaphone",
      href: "/social",
      done: assets.has(ASSET.social),
    },
    {
      id: "logo",
      label: "Create your logo",
      desc: "Give your brand a look that feels like you.",
      icon: "color-palette",
      href: "https://www.godaddy.com/airo",
      external: true,
      done: assets.has(ASSET.logo),
    },
    {
      id: "photos",
      label: "Add product photos",
      desc: "Show off what you make with clear, on-brand shots.",
      icon: "image-gallery",
      href: "/business",
      done: assets.has(ASSET.productPhotos),
    },
    {
      id: "customers",
      label: "Land your first customers",
      desc: "Turn interest into sales with a simple outreach plan.",
      icon: "bullseye",
      href: "/social",
      done: assets.has(ASSET.payingCustomers),
    },
  ].map((task) => ({ ...task, highlighted: highlighted.has(task.id) }));

  // Order: unfinished first (highlighted ones ahead), completed last — keep a
  // stable order within each bucket so the list doesn't jump around.
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      if (a.task.done !== b.task.done) return a.task.done ? 1 : -1;
      if (!!a.task.highlighted !== !!b.task.highlighted) {
        return a.task.highlighted ? -1 : 1;
      }
      return a.index - b.index;
    })
    .map(({ task }) => task);
}
