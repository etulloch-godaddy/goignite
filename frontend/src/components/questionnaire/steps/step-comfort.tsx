"use client";

import { useState, useCallback } from "react";
import text from "@ux/text";
import Button from "@ux/button";
import RangeInput from "@ux/range-input";

const Heading = text.h2;
const Sub = text.p;
const Label = text.span;

interface ComfortLevels {
  business: number;
  money: number;
  marketing: number;
}

interface StepComfortProps {
  initial: ComfortLevels;
  onNext: (levels: ComfortLevels) => void;
}

export function StepComfort({ initial, onNext }: StepComfortProps) {
  const [levels, setLevels] = useState<ComfortLevels>(initial);

  const handleChange = useCallback((key: keyof ComfortLevels, val: number | number[] | [number, number]) => {
    const numeric = Array.isArray(val) ? val[0] : val;
    setLevels((prev) => ({ ...prev, [key]: numeric }));
  }, []);

  return (
    <div className="q-centered q-centered--top">
      <div className="q-centered-form">
        <Heading as="heading" size={1} className="q-step-heading">
          How comfortable are you with…
        </Heading>
        <Sub as="paragraph" className="q-step-sub">
          Slide to indicate your comfort level
        </Sub>

        <div className="q-range-row">
          <RangeInput
            id="comfort-business"
            min={0}
            max={100}
            step={1}
            value={levels.business}
            label={<Label as="label" size={2} className="q-range-label">Business &amp; legal basics</Label>}
            onChange={(val: number | [number, number] | number[]) => handleChange("business", val)}
            stretch
          />
        </div>

        <div className="q-range-row">
          <RangeInput
            id="comfort-money"
            min={0}
            max={100}
            step={1}
            value={levels.money}
            label={<Label as="label" size={2} className="q-range-label">Money &amp; pricing</Label>}
            onChange={(val: number | [number, number] | number[]) => handleChange("money", val)}
            stretch
          />
        </div>

        <div className="q-range-row">
          <RangeInput
            id="comfort-marketing"
            min={0}
            max={100}
            step={1}
            value={levels.marketing}
            label={<Label as="label" size={2} className="q-range-label">Marketing &amp; finding customers</Label>}
            onChange={(val: number | [number, number] | number[]) => handleChange("marketing", val)}
            stretch
          />
        </div>

        <div className="q-continue-wrap">
          <Button
            design="primary"
            size="md"
            text="Continue"
            onClick={() => onNext(levels)}
          />
        </div>
      </div>
    </div>
  );
}
