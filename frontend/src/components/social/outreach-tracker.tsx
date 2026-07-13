"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@ux/box";
import Button from "@ux/button";
import text from "@ux/text";
import Select from "@ux/select";
import {
  getOutreach,
  addOutreach,
  updateOutreach,
  type OutreachEntry,
  type OutreachLog,
} from "@/services/api";

const Heading = text.h2;
const Body = text.p;
const Label = text.span;

const STATUS_OPTIONS = [
  { value: "sent", label: "Sent" },
  { value: "replied", label: "Replied" },
  { value: "deal", label: "Deal 🎉" },
  { value: "no_response", label: "No Response" },
];

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "email", label: "Email" },
];

interface Props {
  userId: string;
}

export function OutreachTracker({ userId }: Props) {
  const [log, setLog] = useState<OutreachLog>({ entries: [], summary: { contacted: 0, replied: 0, deals: 0 } });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ brand: "", platform: "instagram", status: "sent", notes: "" });

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
    setSubmitting(true);
    try {
      await addOutreach(userId, form);
      await load();
      setForm({ brand: "", platform: "instagram", status: "sent", notes: "" });
      setShowForm(false);
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (entryId: string, status: string) => {
    try {
      const updated = await updateOutreach(userId, entryId, { status });
      setLog((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.entry_id === entryId ? updated : e)),
      }));
    } catch {
      // silent
    }
  };

  const statusClass = (status: string) => {
    const map: Record<string, string> = {
      sent: "social-badge--sent",
      replied: "social-badge--replied",
      deal: "social-badge--deal",
      no_response: "social-badge--no-response",
    };
    return `social-status-badge ${map[status] ?? ""}`;
  };

  return (
    <Box orientation="vertical" gap="lg">
      <Box orientation="horizontal" blockAlignChildren="center">
        <Heading as="heading" size={3} className="flex-1">Brand Outreach</Heading>
        <Button design="primary" size="sm" text="Log Outreach" onClick={() => setShowForm(!showForm)} />
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
                  <td>{entry.platform}</td>
                  <td>
                    <Select
                      id={`status-${entry.entry_id}`}
                      label=""
                      value={entry.status}
                      options={STATUS_OPTIONS}
                      onChange={(val: string) => handleStatusChange(entry.entry_id, val)}
                      className={statusClass(entry.status)}
                    />
                  </td>
                  <td className="social-notes-cell">{entry.notes ?? "—"}</td>
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
