"use client";

import { useState, useCallback } from "react";
import text from "@ux/text";
import Button from "@ux/button";
import Chip from "@ux/chip";
import { existingAssetChipOptions } from "@/lib/questionnaire-chips";

const Heading = text.h2;
const Sub = text.p;

interface StepExistingProps {
  initial: string[];
  onNext: (selected: string[]) => void;
}

export function StepExisting({ initial, onNext }: StepExistingProps) {
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = useCallback((label: string, isSelected: boolean) => {
    setSelected((prev) =>
      isSelected ? [...prev, label] : prev.filter((s) => s !== label)
    );
  }, []);

  return (
    <div className="q-centered">
      <div className="q-centered-form">
        <Heading as="heading" size={1} className="q-step-heading">
          What do you have already?
        </Heading>
        <Sub as="paragraph" className="q-step-sub">
          Select all that apply
        </Sub>

        <div className="q-chips-wrap q-chips-wrap--centered">
          {existingAssetChipOptions.map(({ label, icon }) => (
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

        <div className="q-continue-wrap q-continue-wrap--centered">
          <Button
            design="primary"
            size="md"
            text="Continue"
            onClick={() => onNext(selected)}
          />
        </div>
      </div>
    </div>
  );
}
