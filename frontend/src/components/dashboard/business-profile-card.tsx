"use client";

import Box from "@ux/box";
import Card from "@ux/card";
import Tag from "@ux/tag";
import text from "@ux/text";
import type { ProfileSnapshot } from "@/lib/dashboard-data";
import { DashboardSection } from "./dashboard-section";

function ProfileField({
  label,
  value,
  emptyText,
}: {
  label: string;
  value: string;
  emptyText: string;
}) {
  const Caption = text.span;
  const Paragraph = text.p;

  return (
    <Box orientation="vertical" gap="sm">
      <Caption as="caption" emphasis="passive">
        {label}
      </Caption>
      <Paragraph as="paragraph">{value || emptyText}</Paragraph>
    </Box>
  );
}

export function BusinessProfileCard({ profile }: { profile: ProfileSnapshot }) {
  const Paragraph = text.p;
  const filledCount = [
    profile.pitch,
    profile.bio,
    profile.niche,
    profile.socialLink,
  ].filter(Boolean).length;

  return (
    <DashboardSection id="profile" gap="sm">
      <Card
        title="Business profile"
        description={
          <Paragraph as="paragraph" emphasis="passive">
            This fills in as you complete missions — your pitch deck and media
            kit will build from here.
          </Paragraph>
        }
        eyebrow={
          <Tag emphasis="neutral" size="sm">
            {`${filledCount} of 4 basics started`}
          </Tag>
        }
      >
        <Box
          orientation="horizontal"
          gap="md"
          wrap
          blockPadding="sm"
          className="dashboard-grid-2"
        >
          <ProfileField
            label="Pitch"
            value={profile.pitch}
            emptyText="Complete the pitch mission to add this"
          />
          <ProfileField
            label="Domain"
            value={profile.domain}
            emptyText="Register your domain"
          />
          <ProfileField
            label="Bio"
            value={profile.bio}
            emptyText="Write your bio in a mission"
          />
          <ProfileField
            label="Social link"
            value={profile.socialLink}
            emptyText="Link your main profile"
          />
        </Box>
      </Card>
    </DashboardSection>
  );
}
