"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkApiHealth,
  getOrCreateUserId,
  getUser,
  type ApiUser,
} from "@/services/api";
import { emptyUser, type DashboardUser } from "@/lib/dashboard-data";
import { mapUserToDashboard } from "@/lib/map-dashboard";

export function useSocial() {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<DashboardUser>(emptyUser);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [creatorTypeLabel, setCreatorTypeLabel] = useState<string>("");
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const init = useCallback(async () => {
    setLoading(true);

    const healthy = await checkApiHealth();
    setApiConnected(healthy);

    if (!healthy) {
      setUser(emptyUser);
      setLoading(false);
      return;
    }

    try {
      const id = await getOrCreateUserId();
      setUserId(id);
      const profile: ApiUser = await getUser(id);
      setUser(mapUserToDashboard(profile, [], []));
      setCompletedMissionIds(profile.completed_missions ?? []);
      setCreatorTypeLabel((profile.onboarding_data?.creator_type_label as string) ?? "");
    } catch {
      setUser(emptyUser);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return { userId, user, completedMissionIds, creatorTypeLabel, apiConnected, loading };
}
