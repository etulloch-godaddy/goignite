"use client";

import { useCallback, useEffect, useState } from "react";
import { demoUser, type DashboardUser } from "@/lib/dashboard-data";
import { mapUserToDashboard } from "@/lib/map-dashboard";
import {
  checkApiHealth,
  completeMission as apiCompleteMission,
  getAchievements,
  getOrCreateUserId,
  getTodayMissions,
  getUser,
} from "@/services/api";

export function useDashboard() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const loadDashboard = useCallback(async (id: string) => {
    const [profile, missions, achievements] = await Promise.all([
      getUser(id),
      getTodayMissions(id),
      getAchievements(id),
    ]);
    setUser(mapUserToDashboard(profile, missions, achievements));
  }, []);

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
      await loadDashboard(id);
    } catch {
      setApiConnected(false);
      setUser(demoUser);
    } finally {
      setLoading(false);
    }
  }, [loadDashboard]);

  useEffect(() => {
    init();
  }, [init]);

  const completeMission = useCallback(
    async (missionId: string) => {
      if (!apiConnected || !userId) return;

      setCompletingId(missionId);
      try {
        await apiCompleteMission(missionId, userId);
        await loadDashboard(userId);
      } finally {
        setCompletingId(null);
      }
    },
    [apiConnected, loadDashboard, userId],
  );

  return {
    user: user ?? demoUser,
    loading,
    apiConnected,
    completingId,
    completeMission,
    refresh: init,
  };
}
