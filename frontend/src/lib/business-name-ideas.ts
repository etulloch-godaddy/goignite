const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "for",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "with",
  "from",
  "my",
  "i",
  "we",
  "our",
  "want",
  "wanna",
  "would",
  "like",
  "make",
  "making",
  "sell",
  "selling",
  "create",
  "creating",
  "build",
  "building",
  "start",
  "starting",
  "help",
  "helping",
  "people",
  "online",
  "business",
  "something",
  "that",
  "this",
  "them",
  "their",
  "into",
  "about",
  "just",
  "really",
  "very",
]);

const SUFFIXES = ["Studio", "Co", "Lab", "Collective", "House", "Works"];

const TYPE_FALLBACKS: Record<string, string[]> = {
  "Content & media": ["Frame & Folio", "Signal Studio", "Storyline Co"],
  "Beauty & wellness": ["Glow Ritual", "Soft Form Studio", "Aura House"],
  "Clothing & merch": ["Thread & Form", "Northwear Co", "Loom Collective"],
  Services: ["Clearpath Studio", "Harbor Works", "Fieldnote Co"],
  "Digital products": ["Pixel Forge", "Kit & Craft", "Notionary"],
  "Food & drink": ["Table & Ember", "Harvest Co", "Spoonful House"],
  "Home & handmade": ["Hearth & Handmade", "Nestworks", "Clay & Cotton"],
  "Art & design": ["Line & Color", "Atelier North", "Form Studio"],
};

function titleCase(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function extractKeywords(pitch: string): string[] {
  return pitch
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^'+|'+$/g, ""))
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
    .slice(0, 6);
}

/**
 * Lightweight, pitch-aware name ideas for the questionnaire.
 * Framed as Airo suggestions on the frontend; can later swap to a real Airo API.
 */
export function suggestBusinessNames(
  pitch: string,
  businessTypes: string[] = [],
  count = 4
): string[] {
  const keywords = extractKeywords(pitch);
  const ideas: string[] = [];

  if (keywords.length >= 2) {
    ideas.push(`${titleCase(keywords[0])} & ${titleCase(keywords[1])}`);
  }
  if (keywords.length >= 1) {
    ideas.push(`${titleCase(keywords[0])} ${SUFFIXES[0]}`);
    ideas.push(`${titleCase(keywords[0])} ${SUFFIXES[1]}`);
  }
  if (keywords.length >= 2) {
    ideas.push(`${titleCase(keywords[1])} ${SUFFIXES[2]}`);
  }

  for (const type of businessTypes) {
    const fallbacks = TYPE_FALLBACKS[type];
    if (fallbacks) ideas.push(...fallbacks);
  }

  if (ideas.length < count) {
    ideas.push("Northstar Co", "Harbor Studio", "Ember Collective", "Clearpath Works");
  }

  const seen = new Set<string>();
  return ideas
    .map((name) => name.trim())
    .filter((name) => {
      const key = name.toLowerCase();
      if (seen.has(key) || !name) return false;
      seen.add(key);
      return true;
    })
    .slice(0, count);
}
