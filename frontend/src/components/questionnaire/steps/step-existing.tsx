"use client";

import { useState, useCallback } from "react";
import text from "@ux/text";
import Button from "@ux/button";
import Chip from "@ux/chip";
import { existingAssetChipOptions } from "@/lib/questionnaire-chips";

const Heading = text.h2;
const Sub = text.p;
const Label = text.span;

interface StepExistingProps {
  initial: string[];
  onNext: (selected: string[], businessName?: string) => void;
}

export function StepExisting({ initial, onNext }: StepExistingProps) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [businessName, setBusinessName] = useState("");

  const hasName = selected.includes("Name");

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

        {hasName && (
          <div className="q-name-input-wrap">
            <Label as="label" size={0} className="q-name-input-label">
              What&apos;s your business name?
            </Label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Glow Studio"
              className="q-name-input"
              autoFocus
            />
          </div>
        )}

        <div className="q-continue-wrap q-continue-wrap--centered">
          <Button
            design="primary"
            size="md"
            text="Continue"
            onClick={() => onNext(selected, hasName ? businessName.trim() || undefined : undefined)}
          />
        </div>
      </div>
    </div>
  );
}
