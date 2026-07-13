"use client";

import { useState, useCallback, type FormEvent } from "react";
import Image from "next/image";
import text from "@ux/text";
import Button from "@ux/button";
import ArrowRightIcon from "@ux/icon/arrow-right";

const Heading = text.h2;
const Sub = text.p;

interface StepPitchProps {
  initial: string;
  onNext: (pitch: string) => void;
}

export function StepPitch({ initial, onNext }: StepPitchProps) {
  const [value, setValue] = useState(initial);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (value.trim()) onNext(value.trim());
    },
    [value, onNext]
  );

  return (
    <div className="q-two-col">
      <div className="q-two-col-form">
        <Heading as="heading" size={1} className="q-step-heading">
          Tell us about it in a sentence.
        </Heading>
        <Sub as="paragraph" className="q-step-sub">
          Don&apos;t overthink it — just describe what you want to do.
        </Sub>

        <form onSubmit={handleSubmit}>
          <textarea
            className="q-textarea"
            placeholder="e.g. I make handmade candles and want to sell them online…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
          />

          <div className="q-submit-row">
            <Button
              design="primary"
              type="submit"
              size="md"
              aria-label="Continue"
              disabled={!value.trim()}
              className="ux-button-square q-pitch-submit"
            >
              <ArrowRightIcon width={18} height={18} />
            </Button>
          </div>
        </form>
      </div>

      <div className="q-two-col-illust">
        <Image
          src="/questionnaire/dream-it.gif"
          alt="Dream it illustration"
          width={480}
          height={480}
          unoptimized
        />
      </div>
    </div>
  );
}
