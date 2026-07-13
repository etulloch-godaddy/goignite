"use client";

import Image from "next/image";
import text from "@ux/text";
import Button from "@ux/button";

const Heading = text.h1;
const Paragraph = text.p;

interface PathCard {
  id: string;
  label: string;
  image: string;
}

const pathCards: PathCard[] = [
  {
    id: "existing-business",
    label: "I already have a business",
    image: "/questionnaire/information-technology.png",
  },
  {
    id: "have-idea",
    label: "I have an idea",
    image: "/questionnaire/websites-marketing.png",
  },
  {
    id: "not-sure",
    label: "I want to start something, but not sure what yet",
    image: "/questionnaire/hosting-artist.png",
  },
];

interface StepWelcomeProps {
  onSelect: (path: string) => void;
}

export function StepWelcome({ onSelect }: StepWelcomeProps) {
  return (
    <div className="q-welcome">
      <Heading as="title" size={0} className="q-welcome-heading">
        Not sure where to start?{" "}
        <span className="q-welcome-highlight">That&apos;s exactly why we&apos;re here.</span>
      </Heading>

      <Paragraph as="paragraph" className="q-welcome-sub">
        Answer a few quick questions and we&apos;ll give you a clear, step-by-step plan
        — plus tools that grow with you.
      </Paragraph>

      <div className="q-path-cards">
        {pathCards.map((card) => (
          <Button
            key={card.id}
            design="option"
            size="md"
            type="button"
            className="q-path-card"
            onClick={() => onSelect(card.id)}
          >
            <div className="q-path-card-body">
              <span className="q-path-card-label">{card.label}</span>
            </div>
            <div className="q-path-card-img">
              <Image
                src={card.image}
                alt=""
                width={240}
                height={160}
                priority
                className="q-path-card-image"
              />
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
