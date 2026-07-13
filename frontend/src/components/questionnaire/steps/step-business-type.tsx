"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import text from "@ux/text";
import Button from "@ux/button";
import Chip from "@ux/chip";
import { businessTypeChipOptions } from "@/lib/questionnaire-chips";

const Heading = text.h2;
const Sub = text.p;

interface StepBusinessTypeProps {
  initial: string[];
  onNext: (selected: string[]) => void;
}

export function StepBusinessType({ initial, onNext }: StepBusinessTypeProps) {
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = useCallback((label: string, isSelected: boolean) => {
    setSelected((prev) =>
      isSelected ? [...prev, label] : prev.filter((s) => s !== label)
    );
  }, []);

  return (
    <div className="q-two-col">
      <div className="q-two-col-form">
        <Heading as="heading" size={1} className="q-step-heading">
          Let&apos;s figure out what you&apos;re building.
        </Heading>
        <Sub as="paragraph" className="q-step-sub">
          Step 1 — pick one or more:
        </Sub>

        <div className="q-chips-wrap">
          {businessTypeChipOptions.map(({ label, icon }) => (
            <Chip
              key={label}
              label={label}
              icon={icon}
              size="md"
              selected={selected.includes(label)}
              onSelect={(isSelected) => toggle(label, isSelected)}
            />
          ))}
        </div>

        <div className="q-continue-wrap">
          <Button
            design="primary"
            size="md"
            text="Continue"
            disabled={selected.length === 0}
            onClick={() => onNext(selected)}
          />
        </div>
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
