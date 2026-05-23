import { Check, X, ShieldAlert, CheckCircle2, AlertTriangle, Play } from "lucide-react";
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
  onReject,
}: EvidenceBoardProps) {
  const submittedCount = evidence.filter((card) => card.status !== "queued").length;
  const canAdvance = phase === "running" && submittedCount < evidence.length;
  const canVerify = phase === "verifying";

  const getStatusBadge = (status: EvidenceCard["status"]) => {
    switch (status) {
      case "paid":
      case "approved":
        return (
          <span className="badge badge-success">
            <CheckCircle2 size={12} className="badge-icon" />
            Accepted & Paid
          </span>
        );
      case "rejected":
        return (
          <span className="badge badge-danger">
            <ShieldAlert size={12} className="badge-icon" />
            Rejected
          </span>
        );
      case "submitted":
        return (
          <span className="badge badge-warning">
            <AlertTriangle size={12} className="badge-icon" />
            Under Review
          </span>
        );
      case "queued":
      default:
        return <span className="badge badge-muted">Queued</span>;
    }
  };

  return (
    <section className="evidence-board" aria-label="Evidence workspace">
      <div className="section-header-row">
        <div className="section-header">
          <h2>Evidence Ledger</h2>
        </div>
        <div className="btn-toolbar">
          <button className="btn btn-secondary btn-sm" onClick={onAdvance} disabled={!canAdvance}>
            <Play size={12} className="btn-icon" />
            Submit Next Artifact
          </button>
          <button className="btn btn-primary btn-sm" onClick={onRunVerifier} disabled={!canVerify}>
            Run Verifier Engine
          </button>
        </div>
      </div>

      <div className="evidence-grid">
        {evidence.map((card) => {
          const isSubmitted = card.status === "submitted";
          const isRejected = card.status === "rejected";
          const hasConfidence = card.status !== "queued";

          return (
            <article className={`evidence-card border-${card.status}`} key={card.id}>
              <div className="card-header">
                <div>
                  <span className="card-agent font-mono">{card.agentName}</span>
                  <h4 className="card-task">{card.task}</h4>
                </div>
                {getStatusBadge(card.status)}
              </div>

              <div className="card-body">
                <p className="card-claim">“{card.claim}”</p>
                <div className="card-source font-mono">
                  <span className="label">Source:</span>
                  <span className="value">{card.source}</span>
                </div>

                {hasConfidence && (
                  <div className="card-metrics-row font-mono">
                    <div className="metric">
                      <span>Confidence</span>
                      <strong>{Math.round(card.confidence * 100)}%</strong>
                    </div>
                    <div className="metric">
                      <span>Score</span>
                      <strong>{card.score}/100</strong>
                    </div>
                    <div className="metric">
                      <span>Reward</span>
                      <strong>{formatXlm(card.proposedRewardXlm)}</strong>
                    </div>
                  </div>
                )}

                {!hasConfidence && (
                  <div className="queued-placeholder font-mono text-muted">
                    Artifact awaiting swarm collection...
                  </div>
                )}

                {card.verifierNote && card.status !== "queued" && (
                  <div className={`verifier-feedback ${isRejected ? "rejected" : "accepted"}`}>
                    <span className="feedback-label font-mono">Verifier Evaluation:</span>
                    <p className="feedback-note">{card.verifierNote}</p>
                  </div>
                )}

                {isSubmitted && (
                  <div className="manual-actions-row">
                    <button
                      className="btn btn-success btn-xs"
                      onClick={() => onApprove(card.id)}
                      aria-label={`Approve ${card.id}`}
                    >
                      <Check size={12} className="btn-icon" />
                      Approve & Pay
                    </button>
                    <button
                      className="btn btn-danger btn-xs"
                      onClick={() => onReject(card.id)}
                      aria-label={`Reject ${card.id}`}
                    >
                      <X size={12} className="btn-icon" />
                      Reject Claim
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
