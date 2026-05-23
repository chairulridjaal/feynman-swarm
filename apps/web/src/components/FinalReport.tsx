import { FileText, Award, Calendar, CheckCircle2 } from "lucide-react";
import type { FinalReportModel, MissionPhase } from "../types";
import { formatXlm } from "../lib/hash";

interface FinalReportProps {
  report: FinalReportModel;
  phase: MissionPhase;
  onFinalize: () => void;
}

export function FinalReport({ report, phase, onFinalize }: FinalReportProps) {
  const canFinalize = phase === "verifying";
  const unlocked = phase === "finalized";

  return (
    <section className="final-report" aria-labelledby="report-title">
      <div className="section-header-row">
        <div className="section-header">
          <FileText size={18} className="icon-indigo" />
          <h2 id="report-title">Research Decision Memo</h2>
        </div>
        {canFinalize && (
          <button className="btn btn-indigo btn-sm" onClick={onFinalize}>
            Compile & Finalize Report
          </button>
        )}
      </div>

      {!unlocked && !canFinalize && (
        <div className="report-locked-state font-mono">
          <p>Memo compilation will unlock once evidence verification is active or completed.</p>
        </div>
      )}

      {(unlocked || canFinalize) && (
        <div className="memo-document">
          <div className="memo-meta-grid font-mono">
            <div className="meta-cell">
              <span>Status</span>
              <strong className={unlocked ? "text-green" : "text-amber"}>
                {unlocked ? "VERIFIED & PUBLISHED" : "DRAFT COMPILING"}
              </strong>
            </div>
            <div className="meta-cell">
              <span>Verified Claims</span>
              <strong>{report.evidenceRows.filter((r) => r.status === "approved" || r.status === "paid").length} Claims</strong>
            </div>
            <div className="meta-cell">
              <span>Swarm Confidence</span>
              <strong>{Math.round(report.confidence * 100)}%</strong>
            </div>
            <div className="meta-cell">
              <span>Escrow Settlement</span>
              <strong>{formatXlm(report.evidenceRows.reduce((sum, r) => sum + r.costXlm, 0))}</strong>
            </div>
          </div>

          <div className="memo-section">
            <h3>Executive Summary</h3>
            <p className="memo-text">{report.executiveSummary}</p>
          </div>

          <div className="memo-section memo-recommendation">
            <div className="rec-header">
              <Award size={16} className="icon-indigo" />
              <span>Nuanced Recommendation</span>
            </div>
            <p className="rec-text">{report.recommendation}</p>
          </div>

          <div className="memo-section">
            <h3>Verified Evidence & Cost Breakdown</h3>
            <div className="memo-table-wrapper">
              <table className="memo-table font-mono">
                <thead>
                  <tr>
                    <th>Evidence Claim</th>
                    <th>Source Document</th>
                    <th className="text-right">Payout Escrow</th>
                  </tr>
                </thead>
                <tbody>
                  {report.evidenceRows.map((row, idx) => {
                    const isAccepted = row.status === "approved" || row.status === "paid";
                    if (!isAccepted) return null;

                    return (
                      <tr key={`${row.claim}-${idx}`}>
                        <td>{row.claim}</td>
                        <td className="text-muted">{row.source}</td>
                        <td className="text-right text-indigo">{formatXlm(row.costXlm)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {report.rejectedClaims.length > 0 && (
            <div className="memo-section memo-rejected font-mono">
              <h3>Rejected or Uncertain Claims</h3>
              <p className="section-desc">
                The verifier filtered out the following claims due to high microclimate uncertainty, lack of verified citations, or budget constraints:
              </p>
              <ul className="rejected-list">
                {report.rejectedClaims.map((claim, idx) => (
                  <li key={`${claim}-${idx}`}>{claim}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
