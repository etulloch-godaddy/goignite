"use client";

import { useState } from "react";
import text from "@ux/text";
import Button from "@ux/button";

const Heading = text.h2;
const Sub = text.p;

const goals = [
  { id: "side-income", label: "Side income" },
  { id: "full-time", label: "Full-time" },
  { id: "passion", label: "Passion/hobby" },
  { id: "grow", label: "Grow existing" },
];

interface StepGoalProps {
  initial: string;
  onNext: (goal: string) => void | Promise<void>;
}

export function StepGoal({ initial, onNext }: StepGoalProps) {
  const [selected, setSelected] = useState(initial);

  return (
    <div className="q-centered">
      <div className="q-centered-form">
        <Heading as="heading" size={1} className="q-step-heading">
          Main goal?
        </Heading>
        <Sub as="paragraph" className="q-step-sub">
          What best describes your intent
        </Sub>

        <div className="q-goal-grid">
          {goals.map((goal) => (
            <Button
              key={goal.id}
              design="option"
              size="md"
              text={goal.label}
              aria-selected={selected === goal.id}
              className="q-goal-option"
              onClick={() => setSelected(goal.id)}
            />
          ))}
        </div>

        <div className="q-continue-wrap q-continue-wrap--centered">
          <Button
            design="primary"
            size="md"
            text="Continue"
            disabled={!selected}
            onClick={() => onNext(selected)}
          />
        </div>
      </div>
    </div>
  );
}
