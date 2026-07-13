"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import text from "@ux/text";
import { getSocialStats, mockOAuth, type SocialPlatform, type SocialStats } from "@/services/api";

const Heading = text.h2;
const Body = text.p;
const Label = text.span;

const PLATFORMS: { id: SocialPlatform; label: string; color: string }[] = [
  { id: "instagram", label: "Instagram", color: "#E1306C" },
  { id: "tiktok", label: "TikTok", color: "#010101" },
  { id: "facebook", label: "Facebook", color: "#1877F2" },
];

interface Props {
  userId: string;
  stage: string;
  creatorType: string;
}

export function PlatformConnect({ userId }: Props) {
  const [stats, setStats] = useState<Record<string, SocialStats>>({});
  const [connecting, setConnecting] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getSocialStats(userId);
      const map: Record<string, SocialStats> = {};
      for (const s of data) map[s.platform] = s;
      setStats(map);
    } catch {
      // leave empty — show connect buttons
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleConnect = async (platform: SocialPlatform) => {
    setConnecting(platform);
    try {
      const result = await mockOAuth(platform);
      setStats((prev) => ({ ...prev, [platform]: result }));
    } catch {
      // silent
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Box orientation="vertical" gap="lg">
      <Heading as="heading" size={3}>Your Platforms</Heading>
      <div className="social-platform-grid">
        {PLATFORMS.map(({ id, label, color }) => {
          const s = stats[id];
          return (
            <Box
              key={id}
              orientation="vertical"
              gap="md"
              blockPadding="lg"
              inlinePadding="lg"
              elevation="raised"
              rounding="lg"
              className="social-platform-card"
            >
              <Box orientation="horizontal" blockAlignChildren="center" gap="sm">
                <span className="social-platform-dot" style={{ background: color }} />
                <Label as="label" size={1}>{label}</Label>
              </Box>

              {s?.connected ? (
                <Box orientation="vertical" gap="sm">
                  <Body as="paragraph" emphasis="passive">@{s.username}</Body>
                  <div className="social-stat-row">
                    <div className="social-stat-item">
                      <span className="social-stat-value">{(s.followers ?? 0).toLocaleString()}</span>
                      <span className="social-stat-label">Followers</span>
                    </div>
                    <div className="social-stat-item">
                      <span className="social-stat-value">{s.posts ?? 0}</span>
                      <span className="social-stat-label">Posts</span>
                    </div>
                  </div>
                  <Button design="secondary" size="sm" text="Reconnect" onClick={() => handleConnect(id)} />
                </Box>
              ) : (
                <Box orientation="vertical" gap="sm">
                  <Body as="paragraph" emphasis="passive">Not connected</Body>
                  <Button
                    design="primary"
                    size="sm"
                    text={connecting === id ? "Connecting…" : `Connect ${label}`}
                    disabled={connecting === id}
                    onClick={() => handleConnect(id)}
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </div>
    </Box>
  );
}
