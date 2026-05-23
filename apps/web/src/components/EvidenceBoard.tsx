import { Filter, ArrowUpDown, ShieldAlert, BookOpen, Bot, Check, X, Shield, Coins } from "lucide-react";
import type { EvidenceCard, MissionPhase } from "../types";
import { formatXlm } from "../lib/hash";

interface EvidenceBoardProps {
  evidence: EvidenceCard[];
  phase: MissionPhase;
  onAdvance: () => void;
  onRunVerifier: () => void;
  onApprove: (artifactId: string) => void;
  onReject: (artifactId: string) => void;
}

export function EvidenceBoard({
  evidence,
  phase,
  onAdvance,
  onRunVerifier,
  onApprove,
  onReject
}: EvidenceBoardProps) {
  const submittedCount = evidence.filter((card) => card.status !== "queued").length;
  const canAdvance = phase === "running" && submittedCount < evidence.length;
  const canVerify = phase === "verifying";

  return (
    <div className="focused-wizard-container fade-in" style={{ maxWidth: '1000px' }}>
      <div className="wizard-hero-block" style={{ marginBottom: '24px' }}>
        <h1 className="wizard-title">Evidence Board</h1>
        <p className="wizard-subtitle">
          Review the claims submitted by your agents. Accept verified insights to release funds from escrow.
        </p>
      </div>

      <div className="evidence-toolbar">
        <div className="toolbar-left">
          <button className="btn-toolbar-outline">
            <Filter size={14} /> Status: All
          </button>
          <button className="btn-toolbar-outline">
            <ArrowUpDown size={14} /> Sort: Newest
          </button>
        </div>

        <div className="toolbar-right">
          <button className="btn-wizard-outline" onClick={onAdvance} disabled={!canAdvance} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
            Fetch Next Evidence
          </button>
          <button className="btn-wizard-primary" onClick={onRunVerifier} disabled={!canVerify} style={{ padding: '8px 16px', fontSize: '0.8rem', width: 'auto' }}>
            <ShieldAlert size={14} /> Run Verifier Action
          </button>
        </div>
      </div>

      <div className="evidence-masonry-grid">
        {evidence.map((row) => {
          const statusColor = row.status === "paid" || row.status === "approved" ? "emerald" : row.status === "rejected" ? "rose" : "amber";
          const statusLabel = row.status === "approved" ? "Accepted" : row.status.charAt(0).toUpperCase() + row.status.slice(1);
          const needsReview = row.status === "submitted" || row.status === "queued";

          return (
            <div key={row.id} className={`evidence-card-modern status-${row.status}`}>
              
              <div className="card-top-bar">
                <span className={`status-pill pill-${statusColor}`}>
                  <span className="pill-dot" />
                  {statusLabel}
                </span>
                <span className="confidence-text font-mono">
                  {Math.round(row.confidence * 100)}% Conf
                </span>
              </div>

              <div className="card-claim-body">
                <p>{row.claim}</p>
              </div>

              <div className="card-meta-grid">
                <div className="meta-item">
                  <Bot size={12} className="meta-icon" />
                  <span>{row.agentName}</span>
                </div>
                <div className="meta-item">
                  <BookOpen size={12} className="meta-icon" />
                  <span className="truncate">{row.source}</span>
                </div>
                <div className="meta-item">
                  <Coins size={12} className="meta-icon" />
                  <span className="font-mono">{formatXlm(row.proposedRewardXlm)}</span>
                </div>
              </div>

              {needsReview && (
                <div className="card-action-bar">
                  <button className="btn-action-approve" onClick={() => onApprove(row.id)}>
                    <Check size={14} /> Approve
                  </button>
                  <button className="btn-action-reject" onClick={() => onReject(row.id)}>
                    <X size={14} /> Reject
                  </button>
                </div>
              )}
              
              {row.status === "rejected" && (
                <div className="card-rejected-bar">
                  <Shield size={12} />
                  <span>Blocked by Verifier Policy</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
