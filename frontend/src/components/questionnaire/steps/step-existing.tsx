"use client";

import { useMemo, useState } from "react";
import text from "@ux/text";
import Button from "@ux/button";
import { suggestBusinessNames } from "@/lib/business-name-ideas";

const Heading = text.h2;
const Sub = text.p;
const Label = text.span;
const Caption = text.p;

interface StepExistingProps {
  initial?: string;
  pitch?: string;
  businessTypes?: string[];
  onNext: (businessName?: string) => void;
}

export function StepExisting({
  initial = "",
  pitch = "",
  businessTypes = [],
  onNext,
}: StepExistingProps) {
  const [businessName, setBusinessName] = useState(initial);
  const trimmed = businessName.trim();

  const ideas = useMemo(
    () => suggestBusinessNames(pitch, businessTypes),
    [pitch, businessTypes]
  );

  return (
    <div className="q-centered">
      <div className="q-centered-form q-name-step">
        <Heading as="heading" size={1} className="q-step-heading">
          What&apos;s your business name?
        </Heading>
        <Sub as="paragraph" className="q-step-sub">
          We&apos;ll use this across your dashboard, site, and domain ideas.
        </Sub>

        <div className="q-name-input-wrap q-name-input-wrap--static">
          <Label
            as="label"
            size={0}
            id="q-business-name-label"
            className="q-name-input-label"
          >
            Business name
          </Label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Glow Studio"
            className="q-name-input"
            aria-labelledby="q-business-name-label"
            autoFocus
          />
        </div>

        <div className="q-name-ideas">
          <Caption as="caption" className="q-name-ideas-label">
            Don&apos;t have one yet? Ideas from Airo
          </Caption>
          <div className="q-name-ideas-list">
            {ideas.map((idea) => {
              const selected = trimmed.toLowerCase() === idea.toLowerCase();
              return (
                <button
                  key={idea}
                  type="button"
                  className={
                    "q-name-idea" + (selected ? " q-name-idea--selected" : "")
                  }
                  onClick={() => setBusinessName(idea)}
                >
                  {idea}
                </button>
              );
            })}
          </div>
        </div>

        <div className="q-continue-wrap q-continue-wrap--centered">
          <Button
            design="primary"
            size="md"
            text="Continue"
            disabled={!trimmed}
            onClick={() => onNext(trimmed)}
          />
        </div>
      </div>
    </div>
  );
}
