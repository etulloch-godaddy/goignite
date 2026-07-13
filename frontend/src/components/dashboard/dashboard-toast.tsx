"use client";

import { useState } from "react";
import CheckmarkIcon from "@ux/icon/checkmark";

export function DashboardToast({ message }: { message: string }) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="dashboard-toast" role="status">
      <span className="dashboard-toast-icon">
        <CheckmarkIcon width={18} height={18} />
      </span>
      <span>{message}</span>
      <button
        type="button"
        className="dashboard-toast-close"
        aria-label="Dismiss notification"
        onClick={() => setOpen(false)}
      >
        &times;
      </button>
    </div>
  );
}
