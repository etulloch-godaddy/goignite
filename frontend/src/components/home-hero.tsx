"use client";

import Button from "@ux/button";
import Card from "@ux/card";
import text from "@ux/text";

export function HomeHero() {
  const Title = text.span;
  const Paragraph = text.p;

  return (
    <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-16 px-6 sm:px-12">
      <Card
        className="w-full"
        title={<Title as="title" size={2}>GoDaddy Business Kickstart</Title>}
        description={
          <Paragraph as="paragraph" emphasis="passive">
            Launch your business with UX Core — GoDaddy&apos;s design system for
            consistent, accessible UI.
          </Paragraph>
        }
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button design="primary" text="Get started" />
            <Button
              design="secondary"
              text="Learn more"
              href="https://www.godaddy.com"
              external
              as="external"
            />
          </div>
        }
      />
    </main>
  );
}
