"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import {
  getOAuthUrl,
  getSocialStats,
  mockOAuth,
  type SocialPlatform,
  type SocialStats,
} from "@/services/api";

const PLATFORMS: {
  id: SocialPlatform;
  label: string;
  abbr: string;
  postsLabel: string;
}[] = [
  {
    id: "instagram",
    label: "Instagram",
    abbr: "IG",
    postsLabel: "Posts",
  },
  {
    id: "tiktok",
    label: "TikTok",
    abbr: "TT",
    postsLabel: "Videos",
  },
  {
    id: "facebook",
    label: "Facebook",
    abbr: "FB",
    postsLabel: "Posts",
  },
];

const SESSION_KEY = "social_connected_platforms";

function loadSession(): Record<string, SocialStats> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveSession(data: Record<string, SocialStats>) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

interface Props {
  userId: string;
  stage: string;
  creatorType: string;
}

export function PlatformConnect({ userId }: Props) {
  const [stats, setStats] = useState<Record<string, SocialStats>>({});
  const [connecting, setConnecting] = useState<string | null>(null);

  const load = useCallback(async () => {
    const session = loadSession();
    try {
      const data = await getSocialStats(userId);
      const map: Record<string, SocialStats> = {};
      for (const s of data) map[s.platform] = { ...s, mock: s.mock ?? true };
      // Real connections in sessionStorage take priority
      for (const [k, v] of Object.entries(session)) {
        if (!v.mock) map[k] = v;
      }
      setStats(map);
    } catch {
      setStats(session);
    }
  }, [userId]);

  // Parse OAuth callback params from URL after redirect back from platform
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const platform = params.get("platform");
    const connected = params.get("connected") === "true";
    if (platform && connected) {
      const realStats: SocialStats = {
        platform,
        connected: true,
        username: params.get("username") || undefined,
        followers: params.get("followers") ? Number(params.get("followers")) : undefined,
        mock: false,
      };
      setStats((prev) => {
        const next = { ...prev, [platform]: realStats };
        const session = loadSession();
        session[platform] = realStats;
        saveSession(session);
        return next;
      });
      window.history.replaceState({}, "", "/social");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleConnect = async (platform: SocialPlatform) => {
    setConnecting(platform);
    try {
      const { auth_url, mock } = await getOAuthUrl(platform);
      if (mock) {
        const result = await mockOAuth(platform);
        setStats((prev) => ({ ...prev, [platform]: { ...result, mock: true } }));
      } else {
        // Real OAuth: navigate away — setConnecting stays until page reloads
        window.location.href = auth_url;
        return;
      }
    } catch {
      /* silent */
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = (platform: string) => {
    setStats((prev) => {
      const next = { ...prev };
      delete next[platform];
      const session = loadSession();
      delete session[platform];
      saveSession(session);
      return next;
    });
    load();
  };

  return (
    <Box orientation="vertical" gap="lg">
      <div>
        <h2 className="social-section-title">Your Platforms</h2>
        <p className="social-section-sub">
          Manage your connected social accounts.
        </p>
      </div>

      <div className="platform-grid">
        {PLATFORMS.map(({ id, label, abbr, postsLabel }) => {
          const s = stats[id];
          const isLive = s?.connected && !s?.mock;
          const isDemo = s?.connected && s?.mock;
          const postCount = s?.posts ?? s?.videos;

          return (
            <div key={id} className="platform-card">
              <div className="platform-card-header">
                <div className="platform-card-header-left">
                  <span className="platform-abbr">{abbr}</span>
                  <span className="platform-card-name">{label}</span>
                </div>
                {isLive && (
                  <span className="platform-badge platform-badge--live">● Live</span>
                )}
              </div>

              <div className="platform-card-body">
                {s?.connected ? (
                  <>
                    <p className="platform-username">@{s.username}</p>
                    <div className="platform-stats-row">
                      {s.followers !== undefined && (
                        <div className="platform-stat">
                          <span className="platform-stat-value">
                            {s.followers.toLocaleString()}
                          </span>
                          <span className="platform-stat-label">Followers</span>
                        </div>
                      )}
                      {postCount !== undefined && (
                        <div className="platform-stat">
                          <span className="platform-stat-value">{postCount}</span>
                          <span className="platform-stat-label">{postsLabel}</span>
                        </div>
                      )}
                    </div>

                    <div className="platform-card-actions">
                      {isLive ? (
                        <Button
                          design="secondary"
                          size="sm"
                          text="Disconnect"
                          onClick={() => handleDisconnect(id)}
                        />
                      ) : (
                        <Button
                          design="primary"
                          size="sm"
                          text={connecting === id ? "Connecting…" : "Connect Your Account"}
                          disabled={!!connecting}
                          onClick={() => handleConnect(id)}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="platform-empty-text">Not connected</p>
                    <div className="platform-card-actions">
                      <Button
                        design="primary"
                        size="sm"
                        text={connecting === id ? "Connecting…" : `Connect ${label}`}
                        disabled={!!connecting}
                        onClick={() => handleConnect(id)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
}
