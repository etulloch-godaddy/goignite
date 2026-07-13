"use client";

import { useState, useCallback } from "react";
import text from "@ux/text";
import Button from "@ux/button";
import Chip from "@ux/chip";
import { confusionChipOptions } from "@/lib/questionnaire-chips";

const Heading = text.h2;
const Sub = text.p;

const MAX_SELECTIONS = 2;

interface StepConfusionProps {
  initial: string[];
  onNext: (selected: string[]) => void;
}

export function StepConfusion({ initial, onNext }: StepConfusionProps) {
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = useCallback((label: string, isSelected: boolean) => {
    setSelected((prev) => {
      if (isSelected) {
        if (prev.length >= MAX_SELECTIONS) return prev;
        return [...prev, label];
      }
      return prev.filter((s) => s !== label);
    });
  }, []);

  return (
    <div className="q-two-col">
      <div className="q-two-col-form">
        <Heading as="heading" size={1} className="q-step-heading">
          What feels the most confusing right now?
        </Heading>
        <Sub as="paragraph" className="q-step-sub">
          Pick your top 1–2
        </Sub>

        <div className="q-chips-wrap">
          {confusionChipOptions.map(({ label, icon }) => {
            const isSelected = selected.includes(label);
            const atMax = selected.length >= MAX_SELECTIONS && !isSelected;
            return (
              <Chip
                key={label}
                label={label}
                icon={icon}
                size="md"
                selected={isSelected}
                className={atMax ? "q-chip-disabled" : undefined}
                onSelect={(sel) => {
                  if (atMax && sel) return;
                  toggle(label, sel);
                }}
              />
            );
          })}
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
    </div>
  );
}
