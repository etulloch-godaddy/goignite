"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import text from "@ux/text";
import Select from "@ux/select";
import {
  getOutreach,
  addOutreach,
  updateOutreach,
  clearOutreach,
  type OutreachEntry,
  type OutreachLog,
} from "@/services/api";

const Heading = text.h2;
const Body = text.p;
const Label = text.span;

const STATUS_OPTIONS = [
  { value: "sent", label: "Sent" },
  { value: "replied", label: "Replied" },
  { value: "deal", label: "Deal" },
  { value: "no_response", label: "No Response" },
];

const STATUS_BADGE: Record<string, string> = {
  sent: "social-badge--sent",
  replied: "social-badge--replied",
  deal: "social-badge--deal",
  no_response: "social-badge--no-response",
};

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "email", label: "Email" },
];

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  email: "Email",
};

interface Props {
  userId: string;
}

export function OutreachTracker({ userId }: Props) {
  const [log, setLog] = useState<OutreachLog>({ entries: [], summary: { contacted: 0, replied: 0, deals: 0 } });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ brand: "", platform: "instagram", status: "sent", notes: "" });
  const [dealBrand, setDealBrand] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ id: string; value: string } | null>(null);
  const addInFlight = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOutreach(userId);
      setLog(data);
    } catch {
      setLog({ entries: [], summary: { contacted: 0, replied: 0, deals: 0 } });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.brand.trim()) return;
    if (addInFlight.current) return;
    addInFlight.current = true;
    setSubmitting(true);
    try {
      const newEntry = await addOutreach(userId, form);
      setLog((prev) => ({
        entries: [...prev.entries, newEntry],
        summary: {
          contacted: prev.summary.contacted + 1,
          replied: prev.summary.replied + (["replied", "deal"].includes(newEntry.status) ? 1 : 0),
          deals: prev.summary.deals + (newEntry.status === "deal" ? 1 : 0),
        },
      }));
      setForm({ brand: "", platform: "instagram", status: "sent", notes: "" });
      setShowForm(false);
    } catch {
      // silent
    } finally {
      addInFlight.current = false;
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (entry: OutreachEntry, status: string) => {
    try {
      const updated = await updateOutreach(userId, entry.entry_id, { status });
      setLog((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.entry_id === entry.entry_id ? { ...e, ...updated } : e)),
      }));
      if (status === "deal") setDealBrand(entry.brand);
    } catch {
      // silent
    }
  };

  const handleNotesSave = async (entryId: string) => {
    if (!editingNotes) return;
    try {
      const updated = await updateOutreach(userId, entryId, { notes: editingNotes.value });
      setLog((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.entry_id === entryId ? { ...e, ...updated } : e)),
      }));
    } catch {
      // silent
    } finally {
      setEditingNotes(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all outreach entries? This cannot be undone.")) return;
    try {
      await clearOutreach(userId);
      setLog({ entries: [], summary: { contacted: 0, replied: 0, deals: 0 } });
    } catch {
      // silent
    }
  };

  return (
    <Box orientation="vertical" gap="lg">
      <Box orientation="horizontal" blockAlignChildren="center">
        <Heading as="heading" size={3} className="flex-1">Brand Outreach</Heading>
        <Box orientation="horizontal" gap="sm">
          {log.entries.length > 0 && (
            <Button design="secondary" size="sm" text="Clear All" onClick={handleClearAll} />
          )}
          <Button design="primary" size="sm" text="Log Outreach" onClick={() => setShowForm(!showForm)} />
        </Box>
      </Box>

      {/* Summary */}
      <div className="social-summary-row">
        <div className="social-summary-item">
          <span className="social-stat-value">{log.summary.contacted}</span>
          <span className="social-stat-label">Contacted</span>
        </div>
        <div className="social-summary-item">
          <span className="social-stat-value">{log.summary.replied}</span>
          <span className="social-stat-label">Replied</span>
        </div>
        <div className="social-summary-item">
          <span className="social-stat-value">{log.summary.deals}</span>
          <span className="social-stat-label">Deals</span>
        </div>
      </div>

      {/* Deal banner */}
      {dealBrand && (
        <div className="social-deal-banner">
          <span>Deal logged with <strong>{dealBrand}</strong> — achievement unlocked!</span>
          <button onClick={() => setDealBrand(null)}>✕</button>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <Box orientation="vertical" gap="md" blockPadding="md" inlinePadding="md" elevation="raised" rounding="md" className="social-add-form">
          <Label as="label" size={1}>New Outreach</Label>
          <input
            className="social-input"
            placeholder="Brand name"
            value={form.brand}
            onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
          />
          <Box orientation="horizontal" gap="md">
            <Select
              id="outreach-platform"
              label="Platform"
              value={form.platform}
              options={PLATFORM_OPTIONS}
              onChange={(val: string) => setForm((p) => ({ ...p, platform: val }))}
            />
            <Select
              id="outreach-status"
              label="Status"
              value={form.status}
              options={STATUS_OPTIONS}
              onChange={(val: string) => setForm((p) => ({ ...p, status: val }))}
            />
          </Box>
          <input
            className="social-input"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
          <Box orientation="horizontal" gap="sm">
            <Button design="primary" size="sm" text={submitting ? "Saving…" : "Save"} disabled={submitting} onClick={handleAdd} />
            <Button design="secondary" size="sm" text="Cancel" onClick={() => setShowForm(false)} />
          </Box>
        </Box>
      )}

      {loading && <Body as="paragraph" emphasis="passive">Loading…</Body>}

      {!loading && log.entries.length === 0 && (
        <Body as="paragraph" emphasis="passive">No outreach logged yet. Start reaching out to brands!</Body>
      )}

      {!loading && log.entries.length > 0 && (
        <div className="social-outreach-table-wrap">
          <table className="social-outreach-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {log.entries.map((entry) => (
                <tr key={entry.entry_id}>
                  <td><Label as="label" size={2}>{entry.brand}</Label></td>
                  <td>{PLATFORM_LABELS[entry.platform] ?? entry.platform}</td>
                  <td>
                    <div className="social-status-cell">
                      <span className={`social-status-badge ${STATUS_BADGE[entry.status] ?? ""}`}>
                        {STATUS_OPTIONS.find((o) => o.value === entry.status)?.label ?? entry.status}
                      </span>
                      <select
                        className="social-status-select"
                        value={entry.status}
                        onChange={(e) => handleStatusChange(entry, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="social-notes-cell">
                    {editingNotes?.id === entry.entry_id ? (
                      <input
                        autoFocus
                        className="social-input"
                        value={editingNotes.value}
                        onChange={(e) => setEditingNotes({ id: entry.entry_id, value: e.target.value })}
                        onBlur={() => handleNotesSave(entry.entry_id)}
                        onKeyDown={(e) => e.key === "Enter" && handleNotesSave(entry.entry_id)}
                      />
                    ) : (
                      <span>
                        {entry.notes ?? "—"}
                        <button
                          className="social-edit-notes-btn"
                          onClick={() => setEditingNotes({ id: entry.entry_id, value: entry.notes ?? "" })}
                        >
                          edit
                        </button>
                      </span>
                    )}
                  </td>
                  <td>{new Date(entry.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Box>
  );
}
