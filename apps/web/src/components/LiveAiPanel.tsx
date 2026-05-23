import { BrainCircuit, ExternalLink, Loader2 } from "lucide-react";
import type { MissionState } from "../types";
import type { LiveAiResponse } from "../lib/liveAi";

interface LiveAiPanelProps {
  state: MissionState;
  liveAi: LiveAiResponse | null;
  isLoading: boolean;
  error: string;
  onRun: () => void;
}

export function LiveAiPanel({ state, liveAi, isLoading, error, onRun }: LiveAiPanelProps) {
  const canRun = state.phase !== "draft";

  return (
    <section className="live-ai-panel" aria-labelledby="live-ai-title">
      <div className="section-header-row">
        <div className="section-header">
          <BrainCircuit size={18} className="icon-indigo" />
          <h2 id="live-ai-title">Live AI Research</h2>
        </div>
        <span className="phase-badge">GPT 5.4 Medium</span>
      </div>

      <p className="live-ai-copy">
        Runs a live LB Responses pass over the mission ledger. The demo still works offline, but this adds a real model
        verifier-writer for the workshop.
      </p>

      <button className="btn btn-indigo btn-full" onClick={onRun} disabled={!canRun || isLoading}>
        {isLoading ? <Loader2 size={15} className="spin-icon" /> : <BrainCircuit size={15} />}
        {isLoading ? "Running live research" : "Run Live AI Pass"}
      </button>

      {error && <div className="live-ai-error font-mono">{error}</div>}

      {liveAi && (
        <div className="live-ai-result">
          <div className="memo-meta-grid font-mono">
            <div className="meta-cell">
              <span>Provider</span>
              <strong>{liveAi.provider}</strong>
            </div>
            <div className="meta-cell">
              <span>Model</span>
              <strong>{liveAi.model}</strong>
            </div>
            <div className="meta-cell">
              <span>Confidence</span>
              <strong>{Math.round(liveAi.result.confidence * 100)}%</strong>
            </div>
            <div className="meta-cell">
              <span>Mode</span>
              <strong>LIVE</strong>
            </div>
          </div>

          <div className="memo-section">
            <h3>Live Executive Summary</h3>
            <p className="memo-text">{liveAi.result.executiveSummary}</p>
          </div>

          <div className="memo-section memo-recommendation">
            <div className="rec-header">
              <BrainCircuit size={16} className="icon-indigo" />
              <span>Live Recommendation</span>
            </div>
            <p className="rec-text">{liveAi.result.recommendation}</p>
          </div>

          {liveAi.result.citations.length > 0 && (
            <div className="memo-section">
              <h3>Live Citations</h3>
              <div className="live-citation-list">
                {liveAi.result.citations.map((citation) => (
                  <a href={citation.url || "#"} target="_blank" rel="noreferrer" key={`${citation.title}-${citation.url}`}>
                    <ExternalLink size={13} />
                    <span>{citation.title}</span>
                    <em>{citation.note}</em>
                  </a>
                ))}
              </div>
            </div>
          )}

          {liveAi.result.paymentNotes.length > 0 && (
            <div className="memo-section">
              <h3>Payment Notes</h3>
              <ul className="live-note-list">
                {liveAi.result.paymentNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
