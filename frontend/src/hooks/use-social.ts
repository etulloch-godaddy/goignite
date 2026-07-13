"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkApiHealth,
  getOrCreateUserId,
  getUser,
  type ApiUser,
} from "@/services/api";
import { demoUser, type DashboardUser } from "@/lib/dashboard-data";
import { mapUserToDashboard } from "@/lib/map-dashboard";

export function useSocial() {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<DashboardUser>(demoUser);
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const init = useCallback(async () => {
    setLoading(true);

    const healthy = await checkApiHealth();
    setApiConnected(healthy);

    if (!healthy) {
      setUser(demoUser);
      setLoading(false);
      return;
    }

    try {
      const id = await getOrCreateUserId();
      setUserId(id);
      const profile: ApiUser = await getUser(id);
      setUser(mapUserToDashboard(profile, [], []));
    } catch {
      setUser(demoUser);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return { userId, user, apiConnected, loading };
}
