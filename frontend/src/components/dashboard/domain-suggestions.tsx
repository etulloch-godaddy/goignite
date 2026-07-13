"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@ux/alert";
import Box from "@ux/box";
import Button from "@ux/button";
import Spinner from "@ux/spinner";
import text from "@ux/text";
import ArrowRightIcon from "@ux/icon/arrow-right";
import CheckmarkIcon from "@ux/icon/checkmark";
import RefreshIcon from "@ux/icon/refresh";
import WorldIcon from "@ux/icon/world";
import { getAiDomainSuggestions, type ApiDomainSuggestion } from "@/services/api";
import { DashboardSection } from "./dashboard-section";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; suggestions: ApiDomainSuggestion[]; mock: boolean };

function formatPrice(suggestion: ApiDomainSuggestion): { value: string; period: string } {
  if (suggestion.price == null) return { value: "Available", period: "" };
  const currency = suggestion.currency ?? "USD";
  const symbol = currency === "USD" ? "$" : `${currency} `;
  return { value: `${symbol}${suggestion.price.toFixed(2)}`, period: "/yr" };
}

function splitDomain(domain: string): { name: string; tld: string } {
  const dot = domain.lastIndexOf(".");
  if (dot <= 0) return { name: domain, tld: "" };
  return { name: domain.slice(0, dot), tld: domain.slice(dot) };
}

export function DomainSuggestions({ userId }: { userId?: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    if (!userId) return;
    setState({ status: "loading" });
    try {
      const data = await getAiDomainSuggestions(userId);
      setState({ status: "success", suggestions: data.suggestions, mock: data.mock });
    } catch {
      setState({ status: "error" });
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const Title = text.span;

  return (
    <DashboardSection id="domain">
      <div className="dashboard-section-head">
        <div className="dashboard-section-heading">
          <Title as="heading" size={1} className="dashboard-section-title">
            Domain name ideas
          </Title>
          <p className="dashboard-section-subtitle">
            AI-suggested names based on your business profile, checked live for availability.
          </p>
        </div>
        {state.status === "success" && state.suggestions.length > 0 && (
          <button type="button" className="dashboard-domain-refresh" onClick={load}>
            <RefreshIcon width={15} height={15} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {!userId && (
        <div className="dashboard-domain-note">
          <span className="dashboard-match-logo">
            <WorldIcon width={22} height={22} />
          </span>
          <div className="dashboard-domain-note-title">Sign in to get suggestions</div>
          <p className="dashboard-domain-note-text">
            Domain suggestions unlock once your profile is connected.
          </p>
        </div>
      )}

      {userId && state.status === "success" && state.mock && (
        <Alert emphasis="info" title="Demo suggestions" blockPadding="sm" inlinePadding="sm">
          Showing locally-generated name ideas — connect an AI key to get Claude-generated
          suggestions.
        </Alert>
      )}

      {userId && state.status === "loading" && (
        <div className="dashboard-domain-note">
          <Box orientation="horizontal" gap="sm" blockAlignChildren="center">
            <Spinner size="sm" />
            <span className="dashboard-domain-note-text">Finding available domains…</span>
          </Box>
        </div>
      )}

      {userId && state.status === "error" && (
        <div className="dashboard-domain-note">
          <span className="dashboard-match-logo dashboard-match-logo--peach">
            <WorldIcon width={22} height={22} />
          </span>
          <div className="dashboard-domain-note-title">Couldn&apos;t load suggestions</div>
          <p className="dashboard-domain-note-text">
            Something went wrong while checking domain availability.
          </p>
          <Button design="secondary" size="sm" text="Try again" onClick={load} />
        </div>
      )}

      {userId && state.status === "success" && state.suggestions.length === 0 && (
        <div className="dashboard-domain-note">
          <span className="dashboard-match-logo">
            <WorldIcon width={22} height={22} />
          </span>
          <div className="dashboard-domain-note-title">No available domains found</div>
          <p className="dashboard-domain-note-text">
            All the suggested names were taken. Try again for a fresh batch.
          </p>
          <Button design="secondary" size="sm" text="Refresh" onClick={load} />
        </div>
      )}

      {userId && state.status === "success" && state.suggestions.length > 0 && (
        <div className="dashboard-domain-grid">
          {state.suggestions.map((suggestion) => {
            const price = formatPrice(suggestion);
            const { name, tld } = splitDomain(suggestion.domain);
            return (
              <div key={suggestion.domain} className="dashboard-domain-card">
                <div className="dashboard-domain-card-top">
                  <span className="dashboard-match-logo">
                    <WorldIcon width={20} height={20} />
                  </span>
                  <span className="dashboard-domain-price">
                    {price.value}
                    {price.period && (
                      <span className="dashboard-domain-price-period">{price.period}</span>
                    )}
                  </span>
                </div>

                <div className="dashboard-domain-name">
                  {name}
                  {tld && <span className="dashboard-domain-tld">{tld}</span>}
                </div>

                <div className="dashboard-domain-status">
                  <span className="dashboard-domain-status-check">
                    <CheckmarkIcon width={11} height={11} />
                  </span>
                  Available now
                </div>

                <a
                  className="dashboard-domain-cta"
                  href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(
                    suggestion.domain,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Make it mine</span>
                  <ArrowRightIcon width={15} height={15} />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}
