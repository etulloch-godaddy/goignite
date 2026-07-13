const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ApiUser = {
  user_id: string;
  creator_type: string | null;
  stage: string;
  xp_total: number;
  completed_missions: string[];
  business_profile: {
    bio: string;
    pitch: string;
    revenue_goal: string;
  };
  onboarding_data: Record<string, unknown>;
  godaddy_domain: string | null;
};

export type ApiMission = {
  mission_id: string;
  stage: string;
  creator_types: string[];
  title: string;
  description: string;
  xp_reward: number;
  completion_prompt: string;
  achievement_title: string;
  achievement_category: string;
};

export type ApiAchievement = {
  achievement_id: string;
  user_id: string;
  title: string;
  date: string;
  impact: string;
  category: string;
};

export type PitchSlide = {
  slide_number: number;
  title: string;
  headline: string;
  key_points: string[];
  speaker_notes: string;
};

export type PitchOutline = {
  deck_title: string;
  tagline: string;
  funding_ask: string;
  slides: PitchSlide[];
  mock?: boolean;
};

export type ApiFunding = {
  id: string;
  name: string;
  type: string;
  description: string;
  amount: string;
  deadline: string;
  eligibility_stages: string[];
  creator_types: string[];
  requirements: string[];
  application_url: string;
  tags: string[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function createUser(): Promise<string> {
  const data = await request<{ user_id: string }>("/api/users/create-new-user", {
    method: "POST",
  });
  return data.user_id;
}

export async function getUser(userId: string): Promise<ApiUser> {
  return request<ApiUser>(`/api/users/${userId}`);
}

export async function patchOnboarding(
  userId: string,
  data: Record<string, unknown>,
): Promise<void> {
  await request(`/api/users/${userId}/onboarding-data`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
}

export async function getTodayMissions(userId: string): Promise<ApiMission[]> {
  return request<ApiMission[]>(`/api/missions/today/${userId}`);
}

export async function completeMission(
  missionId: string,
  userId: string,
): Promise<{
  xp_total: number;
  stage: string;
  achievements_earned: ApiAchievement[];
}> {
  return request(`/api/missions/${missionId}/complete`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function getAchievements(userId: string): Promise<ApiAchievement[]> {
  return request<ApiAchievement[]>(`/api/users/${userId}/achievements`);
}

export async function getFunding(
  stage?: string,
  creatorType?: string,
): Promise<ApiFunding[]> {
  const params = new URLSearchParams();
  if (stage) params.set("stage", stage);
  if (creatorType) params.set("creator_type", creatorType);
  return request<ApiFunding[]>(`/api/funding?${params}`);
}

export type ApiDomainSuggestion = {
  domain: string;
  available: boolean;
  price: number | null;
  currency: string | null;
};

export type ApiDomainSuggestResponse = {
  user_id: string;
  suggestions: ApiDomainSuggestion[];
  mock: boolean;
};

export async function getAiDomainSuggestions(
  userId: string,
): Promise<ApiDomainSuggestResponse> {
  return request<ApiDomainSuggestResponse>(`/api/domains/ai-suggest/${userId}`);
}

const USER_ID_KEY = "creatorlevel_user_id";

export async function getOrCreateUserId(): Promise<string> {
  const cached = localStorage.getItem(USER_ID_KEY);

  if (cached) {
    try {
      await getUser(cached);
      return cached;
    } catch {
      localStorage.removeItem(USER_ID_KEY);
    }
  }

  const id = await createUser();
  localStorage.setItem(USER_ID_KEY, id);
  return id;
}

export async function generatePitch(userId: string): Promise<PitchOutline> {
  return request<PitchOutline>("/api/pitch/outline", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function sendChat(
  message: string,
  sessionId: string,
  userId?: string | null,
): Promise<string> {
  const data = await request<{ reply: string }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message, session_id: sessionId, user_id: userId ?? null }),
  });
  return data.reply;
}

// ─── Social Media API ──────────────────────────────────────────────────────────

export type SocialPlatform = "instagram" | "tiktok" | "facebook";

export type SocialStats = {
  platform: string;
  connected: boolean;
  username?: string;
  followers?: number;
  posts?: number;
  profile_url?: string;
  mock?: boolean;
};

export type SocialMission = {
  mission_id: string;
  title: string;
  description: string;
  xp_reward?: number;
  stage: string;
  creator_types: string[];
  completion_prompt?: string;
  platform?: string;
  impact?: string;
  time_estimate?: string;
};

export type OutreachEntry = {
  entry_id: string;
  brand: string;
  platform: string;
  template_used?: string;
  status: "sent" | "replied" | "deal" | "no_response";
  notes?: string;
  created_at: string;
  updated_at?: string;
};

export type OutreachLog = {
  entries: OutreachEntry[];
  summary: { contacted: number; replied: number; deals: number };
};

export type ContentIdea = {
  day: number;
  hook: string;
  caption: string;
  hashtags: string[];
};

export type ContentIdeasResponse = {
  ideas?: ContentIdea[];
  raw?: string;
  mock?: boolean;
};

export type MonetizationAdvice = {
  creator_type: string;
  monetization_paths: {
    method: string;
    description: string;
    available_now: boolean;
    first_step: string;
    programs: string[];
    follower_threshold?: number;
  }[];
  mock?: boolean;
};

export type GrowthAction = {
  rank: number;
  title: string;
  why: string;
  time_estimate: string;
  expected_impact: string;
  platform: string;
};

export type GrowthPlanResponse = {
  plan_horizon?: string;
  biggest_opportunity?: string;
  actions?: GrowthAction[];
  plan?: string;
  mock?: boolean;
};

export type SeoProfileResponse = { score: number; feedback: string; rewrite: string; mock?: boolean };
export type SeoKeywordsResponse = { keywords: { keyword: string; relevance: string }[]; mock?: boolean };
export type SeoContentResponse = { optimized: string; tips: string[]; mock?: boolean };

export async function mockOAuth(platform: SocialPlatform): Promise<SocialStats> {
  return request<SocialStats>(`/api/social/mock-oauth/${platform}`);
}

export async function getSocialStats(userId: string): Promise<SocialStats[]> {
  const data = await request<{ platforms: SocialStats[] }>(`/api/social/stats/${userId}`);
  return data.platforms ?? [];
}

export async function getSocialMissions(
  userId: string,
  stage?: string,
  creatorType?: string,
): Promise<SocialMission[]> {
  const params = new URLSearchParams();
  if (stage) params.set("stage", stage);
  if (creatorType) params.set("creator_type", creatorType);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const data = await request<{ missions: SocialMission[] }>(`/api/social/missions/${userId}${qs}`);
  return data.missions ?? [];
}

export async function completeSocialMission(
  missionId: string,
  userId: string,
  completionText?: string,
): Promise<{ success: boolean; mission_id: string; achievement?: { title: string; impact: string } }> {
  return request(`/api/social/missions/${missionId}/complete`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, completion_text: completionText ?? "" }),
  });
}

export async function getContentIdeas(payload: {
  user_id: string;
  creator_type: string;
  stage: string;
  platform: SocialPlatform;
}): Promise<ContentIdeasResponse> {
  return request<ContentIdeasResponse>("/api/social/content-ideas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOutreach(userId: string): Promise<OutreachLog> {
  return request<OutreachLog>(`/api/social/outreach/${userId}`);
}

export async function addOutreach(
  userId: string,
  entry: { brand: string; platform: string; status: string; notes?: string },
): Promise<OutreachEntry> {
  return request<OutreachEntry>(`/api/social/outreach/${userId}`, {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export async function updateOutreach(
  userId: string,
  entryId: string,
  update: { status?: string; notes?: string },
): Promise<OutreachEntry> {
  return request<OutreachEntry>(`/api/social/outreach/${userId}/${entryId}`, {
    method: "PATCH",
    body: JSON.stringify(update),
  });
}

export async function getGrowthPlan(payload: {
  user_id: string;
  creator_type: string;
  stage: string;
  platforms: SocialPlatform[];
  completed_mission_ids?: string[];
}): Promise<GrowthPlanResponse> {
  return request<GrowthPlanResponse>("/api/social/growth-plan", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMonetizationAdvice(params: {
  user_id?: string;
  creator_type?: string;
  instagram_followers?: number;
  tiktok_followers?: number;
}): Promise<MonetizationAdvice> {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();
  return request<MonetizationAdvice>(`/api/social/monetization-advice${qs ? `?${qs}` : ""}`);
}

export async function getSeoKeywords(
  creatorType: string,
  platform: SocialPlatform,
): Promise<SeoKeywordsResponse> {
  return request<SeoKeywordsResponse>(
    `/api/social/seo/keywords?creator_type=${encodeURIComponent(creatorType)}&platform=${platform}`,
  );
}

export async function analyzeSeoProfile(payload: {
  user_id: string;
  platform: SocialPlatform;
  bio: string;
  creator_type: string;
}): Promise<SeoProfileResponse> {
  return request<SeoProfileResponse>("/api/social/seo/profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function optimizeSeoContent(payload: {
  user_id: string;
  platform: SocialPlatform;
  content: string;
  creator_type: string;
}): Promise<SeoContentResponse> {
  return request<SeoContentResponse>("/api/social/seo/content", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

