import { Filter, ArrowUpDown, BookOpen, Check, X, ShieldAlert, Cpu, Bot } from "lucide-react";
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

  // Mock table rows to match Image 3 exactly
  const tableRows = [
    {
      claim: "Rooftop solar systems can reduce school electricity costs by 20–40% in rural Indonesia.",
      sourceName: "IRENA Report",
      sourceLink: "irena.org/publications/...",
      agentName: "Agent Nova",
      agentRole: "Researcher",
      confidenceVal: 0.92,
      confidenceLabel: "High",
      proposedXlm: "18 XLM",
      proposedUsd: "≈ $5.98 USD",
      status: "paid",
      statusLabel: "Paid",
      verificationLabel: "Verified on May 18, 2025",
      id: "artifact-solar-001"
    },
    {
      claim: "Smart irrigation can reduce water use by 30–50% for smallholder farms.",
      sourceName: "FAO AquaCrop",
      sourceLink: "fao.org/aquacrop/...",
      agentName: "Agent Terra",
      agentRole: "Researcher",
      confidenceVal: 0.86,
      confidenceLabel: "High",
      proposedXlm: "16 XLM",
      proposedUsd: "≈ $5.32 USD",
      status: "accepted",
      statusLabel: "Accepted",
      verificationLabel: "Accepted on May 17, 2025",
      id: "artifact-rain-001"
    },
    {
      claim: "Rainwater harvesting can meet 60–80% of a school's non-potable water needs.",
      sourceName: "World Bank WASH",
      sourceLink: "worldbank.org/en/topic/...",
      agentName: "Agent Aqua",
      agentRole: "Researcher",
      confidenceVal: 0.78,
      confidenceLabel: "Medium",
      proposedXlm: "14 XLM",
      proposedUsd: "≈ $4.66 USD",
      status: "accepted",
      statusLabel: "Accepted",
      verificationLabel: "Accepted on May 16, 2025",
      id: "artifact-irrigation-001"
    },
    {
      claim: "The cost of rooftop solar has declined 70% in the last decade globally.",
      sourceName: "Our World in Data",
      sourceLink: "ourworldindata.org/...",
      agentName: "Agent Helios",
      agentRole: "Researcher",
      confidenceVal: 0.62,
      confidenceLabel: "Medium",
      proposedXlm: "12 XLM",
      proposedUsd: "≈ $3.99 USD",
      status: "pending",
      statusLabel: "Pending",
      verificationLabel: "Under review",
      id: "artifact-uncertain-001"
    },
    {
      claim: "Rainwater harvesting alone can fully replace all drinking water needs in schools.",
      sourceName: "Community Blog",
      sourceLink: "greenfuture.id/blog/...",
      agentName: "Agent Ripple",
      agentRole: "Researcher",
      confidenceVal: 0.18,
      confidenceLabel: "Low",
      proposedXlm: "10 XLM",
      proposedUsd: "≈ $3.33 USD",
      status: "rejected",
      statusLabel: "Rejected",
      verificationLabel: "Rejected on May 15, 2025",
      id: "artifact-weak-001"
    },
    {
      claim: "Smart irrigation increases crop yields by 25–35% in rice farming.",
      sourceName: "AGRIC Journal",
      sourceLink: "agricjournal.org/2024/...",
      agentName: "Agent Paddy",
      agentRole: "Researcher",
      confidenceVal: 0.55,
      confidenceLabel: "Medium",
      proposedXlm: "12 XLM",
      proposedUsd: "≈ $3.99 USD",
      status: "pending",
      statusLabel: "Pending",
      verificationLabel: "Under review",
      id: "artifact-writer-001"
    }
  ];

  return (
    <div className="evidence-workspace fade-in font-sans">
      
      {/* Title Row with Top Right Stats */}
      <div className="agents-title-row">
        <div className="title-block">
          <h1>Evidence board</h1>
          <p className="subtitle">
            Agents submit claims. Verification decides what gets paid.
          </p>
        </div>
        
        <div className="stat-cards-row">
          <div className="stat-inline-group">
            <div className="stat-inline-cell">
              <span className="label">Total proposed</span>
              <strong className="val font-mono">210 XLM</strong>
            </div>
            <div className="stat-inline-divider" />
            <div className="stat-inline-cell">
              <span className="label">Total approved</span>
              <strong className="val text-green font-mono">140 XLM</strong>
            </div>
            <div className="stat-inline-divider" />
            <div className="stat-inline-cell">
              <span className="label">Total paid</span>
              <strong className="val text-green font-mono">73 XLM</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Trigger & Filters Row */}
      <div className="evidence-filter-bar">
        <div className="filter-buttons-left">
          <button className="btn btn-secondary btn-sm">
            <Filter size={12} className="btn-icon" />
            Status: All
          </button>
          <button className="btn btn-secondary btn-sm">
            <ArrowUpDown size={12} className="btn-icon" />
            Sort: Newest
          </button>
        </div>

        <div className="btn-toolbar">
          <button className="btn btn-secondary btn-sm" onClick={onAdvance} disabled={!canAdvance}>
            Submit Next
          </button>
          <button className="btn btn-primary btn-sm" onClick={onRunVerifier} disabled={!canVerify}>
            Run Verifier
          </button>
        </div>
      </div>

      {/* Elegant Table container */}
      <div className="evidence-table-card">
        <div className="table-responsive">
          <table className="evidence-custom-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Claim</th>
                <th style={{ width: "15%" }}>Source</th>
                <th style={{ width: "13%" }}>Agent</th>
                <th style={{ width: "10%" }}>Confidence</th>
                <th style={{ width: "12%" }}>Proposed reward</th>
                <th style={{ width: "10%" }} className="text-right">Status & verification</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => {
                const statusColor = row.status === "paid" || row.status === "accepted"
                  ? "emerald"
                  : row.status === "rejected"
                  ? "rose"
                  : "amber";
                  
                const ringColor = row.confidenceVal >= 0.8
                  ? "#10B981"
                  : row.confidenceVal >= 0.5
                  ? "#F59E0B"
                  : "#EF4444";

                return (
                  <tr key={row.id} className={`table-row-custom row-status-${row.status}`}>
                    {/* Claim Column */}
                    <td className="cell-claim">
                      <p className="claim-text">{row.claim}</p>
                    </td>

                    {/* Source Column */}
                    <td className="cell-source">
                      <div className="source-group font-sans">
                        <div className="source-header">
                          <BookOpen size={12} className="source-icon" />
                          <strong>{row.sourceName}</strong>
                        </div>
                        <span className="source-link font-mono">{row.sourceLink}</span>
                      </div>
                    </td>

                    {/* Agent Column */}
                    <td className="cell-agent">
                      <div className="agent-avatar-group font-sans">
                        <div className="agent-avatar-circle text-blue bg-blue-light">
                          <Bot size={12} />
                        </div>
                        <div>
                          <strong>{row.agentName}</strong>
                          <span className="agent-role-sub">{row.agentRole}</span>
                        </div>
                      </div>
                    </td>

                    {/* Confidence Column */}
                    <td className="cell-confidence">
                      <div className="confidence-meter font-sans">
                        {/* Custom Circular SVG ring */}
                        <svg className="confidence-svg" width="22" height="22" viewBox="0 0 22 22">
                          <circle cx="11" cy="11" r="9" stroke="#E5E7EB" strokeWidth="2.5" fill="transparent" />
                          <circle
                            cx="11"
                            cy="11"
                            r="9"
                            stroke={ringColor}
                            strokeWidth="2.5"
                            fill="transparent"
                            strokeDasharray="56.54"
                            strokeDashoffset={56.54 - (56.54 * row.confidenceVal)}
                            strokeLinecap="round"
                            transform="rotate(-90 11 11)"
                          />
                        </svg>
                        <div className="confidence-details">
                          <strong className="pct font-mono">{row.confidenceVal.toFixed(2)}</strong>
                          <span className={`label text-${statusColor}`}>{row.confidenceLabel}</span>
                        </div>
                      </div>
                    </td>

                    {/* Proposed Reward Column */}
                    <td className="cell-reward font-mono">
                      <div className="reward-stack">
                        <strong>{row.proposedXlm}</strong>
                        <span className="usd-equivalent">{row.proposedUsd}</span>
                      </div>
                    </td>

                    {/* Status & Verification Column */}
                    <td className="cell-status text-right">
                      <div className="status-verify-group">
                        <div className="status-badge-inline">
                          <span className={`badge-dot bg-${statusColor}`} />
                          <span className={`badge-text font-sans text-${statusColor}-strong`}>
                            {row.statusLabel}
                          </span>
                        </div>
                        <span className="verify-label-sub font-mono">{row.verificationLabel}</span>
                        
                        {row.status === "pending" && (
                          <div className="table-row-actions mt-4">
                            <button className="row-action-btn check-btn" onClick={() => onApprove(row.id)}>
                              <Check size={12} />
                            </button>
                            <button className="row-action-btn cross-btn" onClick={() => onReject(row.id)}>
                              <X size={12} />
                            </button>
                          </div>
                        )}

                        {row.status === "rejected" && (
                          <button className="btn-view-reason font-sans mt-4">
                            View reason
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
