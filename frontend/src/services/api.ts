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

<<<<<<< Updated upstream
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
=======
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

>>>>>>> Stashed changes
