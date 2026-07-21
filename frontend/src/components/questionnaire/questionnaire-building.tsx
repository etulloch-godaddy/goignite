"use client";

import { useEffect, useState } from "react";
import text from "@ux/text";
import CheckmarkIcon from "@ux/icon/checkmark";

const BUILD_STEPS = [
  "Reviewing your answers",
  "Personalizing your roadmap",
  "Setting up your dashboard",
];

const STEP_MS = 1200;
const FINISH_DELAY_MS = 600;

export function QuestionnaireBuilding({ onDone }: { onDone: () => void }) {
  const Heading = text.h2;
  const Paragraph = text.p;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timers = BUILD_STEPS.map((_, i) =>
      setTimeout(() => setActive(i), i * STEP_MS)
    );
    const done = setTimeout(onDone, BUILD_STEPS.length * STEP_MS + FINISH_DELAY_MS);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className="q-building">
      <div className="q-building-inner">
        <div className="q-building-spinner" aria-hidden />
        <Heading as="heading" size={2} className="q-building-title">
          Creating your dashboard
        </Heading>
        <Paragraph as="paragraph" className="q-building-sub">
          Turning your answers into a personalized plan&hellip;
        </Paragraph>

        <ul className="q-building-steps">
          {BUILD_STEPS.map((label, i) => {
            const done = i < active;
            const isActive = i === active;
            return (
              <li
                key={label}
                className={
                  "q-building-step" +
                  (done ? " is-done" : "") +
                  (isActive ? " is-active" : "")
                }
              >
                <span className="q-building-step-mark">
                  {done ? <CheckmarkIcon width={13} height={13} /> : null}
                </span>
                <span>{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
