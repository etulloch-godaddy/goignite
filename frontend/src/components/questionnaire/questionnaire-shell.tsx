"use client";

import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateUserId, patchOnboarding } from "@/services/api";
import { QuestionnaireHeader } from "./questionnaire-header";
import { StepWelcome } from "./steps/step-welcome";
import { StepBusinessType } from "./steps/step-business-type";
import { StepPitch } from "./steps/step-pitch";
import { StepConfusion } from "./steps/step-confusion";
import { StepComfort } from "./steps/step-comfort";
import { StepExisting } from "./steps/step-existing";
import { StepGoal } from "./steps/step-goal";
import { StepBudget } from "./steps/step-budget";

const TOTAL_STEPS = 8;
const TRANSITION_MS = 300;

interface Answers {
  path: string;
  businessTypes: string[];
  pitch: string;
  confusion: string[];
  comfort: { business: number; money: number; marketing: number };
  existing: string[];
  goal: string;
  budget: number;
}

const defaultAnswers: Answers = {
  path: "",
  businessTypes: [],
  pitch: "",
  confusion: [],
  comfort: { business: 50, money: 50, marketing: 50 },
  existing: [],
  goal: "",
  budget: 50,
};

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="q-progress">
      {Array.from({ length: total }, (_, i) => {
        let cls = "q-dot";
        if (i === current) cls += " q-dot--active";
        else if (i < current) cls += " q-dot--done";
        return <span key={i} className={cls} />;
      })}
    </div>
  );
}

interface TransitionWrapperProps {
  stepKey: number;
  children: ReactNode;
}

function TransitionWrapper({ stepKey, children }: TransitionWrapperProps) {
  const [displayed, setDisplayed] = useState<{ key: number; node: ReactNode }>({
    key: stepKey,
    node: children,
  });
  const [phase, setPhase] = useState<"idle" | "exit" | "enter" | "entering">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <div className="q-step-container">
      <div className={className}>{displayed.node}</div>
    </div>
  );
}

export function QuestionnaireShell() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);

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

  const handleComfort = useCallback(
    (comfort: { business: number; money: number; marketing: number }) => {
      setAnswers((prev) => ({ ...prev, comfort }));
      goTo(5);
    },
    [goTo]
  );

  const handleExisting = useCallback(
    (existing: string[]) => {
      setAnswers((prev) => ({ ...prev, existing }));
      goTo(6);
    },
    [goTo]
  );

  const handleGoal = useCallback(
    (goal: string) => {
      setAnswers((prev) => ({ ...prev, goal }));
      goTo(7);
    },
    [goTo]
  );

  const handleBudget = useCallback(
    async (budget: number) => {
      const finalAnswers = { ...answers, budget };
      setAnswers(finalAnswers);

      try {
        const userId = await getOrCreateUserId();
        await patchOnboarding(userId, {
          starting_point: finalAnswers.path,
          business_types: finalAnswers.businessTypes,
          creator_type_label: finalAnswers.businessTypes[0],
          pitch: finalAnswers.pitch,
          confusion_areas: finalAnswers.confusion,
          comfort_business: finalAnswers.comfort.business,
          comfort_money: finalAnswers.comfort.money,
          comfort_marketing: finalAnswers.comfort.marketing,
          existing_assets: finalAnswers.existing,
          goal: finalAnswers.goal,
          budget_comfort: finalAnswers.budget,
        });
      } catch (error) {
        // Best-effort persistence — don't block navigation, but surface the failure.
        console.error("Failed to save onboarding data", error);
      }

      router.push("/dashboard");
    },
    [answers, router]
  );

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
        return <StepComfort initial={answers.comfort} onNext={handleComfort} />;
      case 5:
        return <StepExisting initial={answers.existing} onNext={handleExisting} />;
      case 6:
        return <StepGoal initial={answers.goal} onNext={handleGoal} />;
      case 7:
        return <StepBudget initial={answers.budget} onNext={handleBudget} />;
      default:
        return null;
    }
  };

  return (
    <div className="q-page">
      <QuestionnaireHeader />
      {step > 0 && <ProgressDots current={step - 1} total={TOTAL_STEPS - 1} />}
      <TransitionWrapper stepKey={step}>{renderStep()}</TransitionWrapper>
    </div>
  );
}
