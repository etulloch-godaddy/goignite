"use client";

import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getOrCreateUserId, patchOnboarding } from "@/services/api";
import { QuestionnaireHeader } from "./questionnaire-header";
import { QuestionnaireBuilding } from "./questionnaire-building";
import { StepWelcome } from "./steps/step-welcome";
import { StepBusinessType } from "./steps/step-business-type";
import { StepPitch } from "./steps/step-pitch";
import { StepConfusion } from "./steps/step-confusion";
import { StepExisting } from "./steps/step-existing";
import { StepGoal } from "./steps/step-goal";

const TOTAL_STEPS = 6;
const TRANSITION_MS = 300;

interface Answers {
  path: string;
  businessTypes: string[];
  pitch: string;
  confusion: string[];
  existing: string[];
  businessName?: string;
  goal: string;
}

const defaultAnswers: Answers = {
  path: "",
  businessTypes: [],
  pitch: "",
  confusion: [],
  existing: [],
  businessName: undefined,
  goal: "",
};

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.max(0, ((current + 1) / total) * 100));
  return (
    <div
      className="q-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current + 1}
    >
      <div className="q-progress-track">
        <div className="q-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface TransitionWrapperProps {
  stepKey: number;
  children: ReactNode;
  onDisplayedKeyChange?: (key: number) => void;
}

function TransitionWrapper({
  stepKey,
  children,
  onDisplayedKeyChange,
}: TransitionWrapperProps) {
  const [displayed, setDisplayed] = useState<{ key: number; node: ReactNode }>({
    key: stepKey,
    node: children,
  });
  const [phase, setPhase] = useState<"idle" | "exit" | "enter" | "entering">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onDisplayedKeyChange?.(displayed.key);
  }, [displayed.key, onDisplayedKeyChange]);

  useEffect(() => {
    if (stepKey === displayed.key) return;

    setPhase("exit");

    timerRef.current = setTimeout(() => {
      setDisplayed({ key: stepKey, node: children });
      setPhase("enter");

      timerRef.current = setTimeout(() => {
        setPhase("idle");
      }, TRANSITION_MS);
    }, 260);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  useEffect(() => {
    if (stepKey === displayed.key) {
      setDisplayed((prev) => ({ ...prev, node: children }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  let className = "q-step";
  if (phase === "idle") className += " q-step--static";
  if (phase === "exit") className += " q-step-exit q-step-exit-active";
  else if (phase === "enter") className += " q-step-enter";

  useEffect(() => {
    if (phase === "enter") {
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase("entering");
        });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [phase]);

  if (phase === "entering") {
    className = "q-step q-step-enter q-step-enter-active";
  }

  return <div className={className}>{displayed.node}</div>;
}

/**
 * Illustrations render in a persistent layer that lives OUTSIDE the step
 * transition, so they don't fade/vanish when navigating between steps.
 * Steps 1–3 share the two-column gif; steps 4–7 share the bottom illustration.
 */
function StepIllustration({ step }: { step: number }) {
  const isTwoCol = step >= 1 && step <= 3;
  const isCentered = step >= 4 && step <= 7;

  if (!isTwoCol && !isCentered) return null;

  return (
    <div className="q-illust-layer" aria-hidden>
      {isTwoCol && (
        <div className="q-two-col">
          <div />
          <div className="q-two-col-illust">
            <Image
              src="/questionnaire/dream-it.gif"
              alt=""
              width={480}
              height={480}
              unoptimized
              priority
            />
          </div>
        </div>
      )}

      {isCentered && (
        <div className="q-bottom-illust">
          <Image
            src="/questionnaire/cursor-ride.png"
            alt=""
            width={400}
            height={400}
          />
        </div>
      )}
    </div>
  );
}

export function QuestionnaireShell() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayedStep, setDisplayedStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);
  const [building, setBuilding] = useState(false);

  const goTo = useCallback((next: number) => {
    setStep(next);
  }, []);

  const handleWelcomeSelect = useCallback(
    (path: string) => {
      setAnswers((prev) => ({ ...prev, path }));
      goTo(1);
    },
    [goTo]
  );

  const handleBusinessType = useCallback(
    (businessTypes: string[]) => {
      setAnswers((prev) => ({ ...prev, businessTypes }));
      goTo(2);
    },
    [goTo]
  );

  const handlePitch = useCallback(
    (pitch: string) => {
      setAnswers((prev) => ({ ...prev, pitch }));
      goTo(3);
    },
    [goTo]
  );

  const handleConfusion = useCallback(
    (confusion: string[]) => {
      setAnswers((prev) => ({ ...prev, confusion }));
      goTo(4);
    },
    [goTo]
  );

  const handleExisting = useCallback(
    (existing: string[], businessName?: string) => {
      setAnswers((prev) => ({ ...prev, existing, businessName }));
      goTo(5);
    },
    [goTo]
  );

  const handleGoal = useCallback(
    async (goal: string) => {
      const finalAnswers = { ...answers, goal };
      setAnswers(finalAnswers);
      setBuilding(true);

      try {
        const userId = await getOrCreateUserId();
        await patchOnboarding(userId, {
          starting_point: finalAnswers.path,
          business_types: finalAnswers.businessTypes,
          creator_type_label: finalAnswers.businessTypes[0],
          pitch: finalAnswers.pitch,
          confusion_areas: finalAnswers.confusion,
          existing_assets: finalAnswers.existing,
          goal: finalAnswers.goal,
          ...(finalAnswers.businessName ? { business_name: finalAnswers.businessName } : {}),
        });
      } catch (error) {
        console.error("Failed to save onboarding data", error);
      }
    },
    [answers]
  );

  const handleBuildComplete = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepWelcome onSelect={handleWelcomeSelect} />;
      case 1:
        return <StepBusinessType initial={answers.businessTypes} onNext={handleBusinessType} />;
      case 2:
        return <StepPitch initial={answers.pitch} onNext={handlePitch} />;
      case 3:
        return <StepConfusion initial={answers.confusion} onNext={handleConfusion} />;
      case 4:
        return <StepExisting initial={answers.existing} onNext={handleExisting} />;
      case 5:
        return <StepGoal initial={answers.goal} onNext={handleGoal} />;
      default:
        return null;
    }
  };

  return (
    <div className="q-page">
      <QuestionnaireHeader />
      {building ? (
        <QuestionnaireBuilding onDone={handleBuildComplete} />
      ) : (
        <>
          {displayedStep > 0 && (
            <ProgressBar current={displayedStep - 1} total={TOTAL_STEPS - 1} />
          )}
          <div className="q-step-container">
            <StepIllustration step={step} />
            <TransitionWrapper stepKey={step} onDisplayedKeyChange={setDisplayedStep}>
              {renderStep()}
            </TransitionWrapper>
          </div>
        </>
      )}
    </div>
  );
}
