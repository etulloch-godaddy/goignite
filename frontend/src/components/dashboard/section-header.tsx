"use client";

import TextLockup from "@ux/text-lockup";
import text from "@ux/text";

export function SectionHeader({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
}) {
  const Paragraph = text.p;

  return (
    <TextLockup
      eyebrow={eyebrow}
      title={title}
      size="md"
      textMaxWidth={false}
    >
      {description && (
        <Paragraph as="paragraph" emphasis="passive">
          {description}
        </Paragraph>
      )}
    </TextLockup>
  );
}
