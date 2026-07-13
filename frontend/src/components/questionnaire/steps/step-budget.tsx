"use client";

import { useState } from "react";
import text from "@ux/text";
import Button from "@ux/button";
import RangeInput from "@ux/range-input";

const Heading = text.h2;
const Sub = text.p;
const Label = text.span;

interface StepBudgetProps {
  initial: number;
  onNext: (budget: number) => void;
}

export function StepBudget({ initial, onNext }: StepBudgetProps) {
  const [budget, setBudget] = useState(initial);

  return (
    <div className="q-centered">
      <div className="q-centered-form">
        <Heading as="heading" size={1} className="q-step-heading">
          Budget comfort
        </Heading>
        <Sub as="paragraph" className="q-step-sub">
          How much are you comfortable investing monthly?
        </Sub>

        <div className="q-range-row">
          <RangeInput
            id="budget-comfort"
            min={0}
            max={100}
            step={1}
            value={budget}
            label={<Label as="label" size={2} className="q-range-label">Monthly budget comfort</Label>}
            onChange={(val: number | [number, number] | number[]) => setBudget(Array.isArray(val) ? val[0] : val)}
            stretch
          />
        </div>

        <div className="q-continue-wrap">
          <Button
            design="primary"
            size="md"
            text="Continue"
            onClick={() => onNext(budget)}
          />
        </div>
      </div>
    </div>
  );
}
