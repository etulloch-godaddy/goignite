"use client";

import text from "@ux/text";
import Button from "@ux/button";

const Heading = text.h1;
const Paragraph = text.p;

interface StepWelcomeProps {
  onSelect: (path: string) => void;
}

export function StepWelcome({ onSelect }: StepWelcomeProps) {
  return (
    <div className="q-welcome">
      <div className="q-welcome-content">
        <Heading as="title" size={0} className="q-welcome-heading">
          Not sure where to start?
          <br />
          <span className="q-welcome-highlight">
            That&apos;s exactly why we&apos;re here.
          </span>
        </Heading>

        <Paragraph as="paragraph" className="q-welcome-sub">
          Answer a few quick questions and we&apos;ll give you a clear,
          step-by-step plan — plus tools that grow with you.
        </Paragraph>

        <Button
          design="primary"
          size="md"
          type="button"
          className="q-welcome-cta"
          text="Start on my idea"
          onClick={() => onSelect("have-idea")}
        />
      </div>

      <div className="q-welcome-scene" aria-hidden>
        <video
          className="q-welcome-figure"
          src="/questionnaire/sitting-with-laptop.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="q-welcome-line"
          src="/questionnaire/homepage-line.png"
          alt=""
          width={1728}
          height={77}
        />
      </div>
    </div>
  );
}
