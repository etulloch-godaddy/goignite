"use client";

import { useState } from "react";
import SparklesFilledIcon from "@ux/icon/sparkles-filled";
import ArrowRightIcon from "@ux/icon/arrow-right";

export function AiCompanion({ businessName }: { businessName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dashboard-companion">
      {open && (
        <div className="dashboard-companion-panel" role="dialog" aria-label="AI companion">
          <div className="dashboard-companion-head">
            <span className="dashboard-companion-head-icon">
              <SparklesFilledIcon width={16} height={16} />
            </span>
            <span className="dashboard-companion-head-title">GoIgnite Assistant</span>
            <button
              type="button"
              className="dashboard-companion-close"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
            >
              &times;
            </button>
          </div>

          <div className="dashboard-companion-body">
            <p className="dashboard-companion-msg">
              Hi! I&apos;m your growth companion for <strong>{businessName}</strong>.
              Ask me anything — from your next mission to pricing or marketing ideas.
            </p>
          </div>

          <div className="dashboard-companion-input">
            <input type="text" placeholder="Ask me anything…" aria-label="Message the assistant" />
            <button type="button" aria-label="Send message">
              <ArrowRightIcon width={16} height={16} />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="dashboard-companion-fab"
        aria-label={open ? "Close AI companion" : "Open AI companion"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <SparklesFilledIcon width={24} height={24} />
      </button>
    </div>
  );
}
