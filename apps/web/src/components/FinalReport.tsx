import { Download, Share2, FileText, CheckCircle, ExternalLink, Link2, Zap } from "lucide-react";
import type { FinalReportModel, MissionPhase, ResearchInvoice } from "../types";
import { formatXlm } from "../lib/hash";

interface FinalReportProps {
  report: FinalReportModel;
  invoice: ResearchInvoice;
  phase: MissionPhase;
  onFinalize: () => void;
}

export function FinalReport({ report, invoice }: FinalReportProps) {
  const acceptedRows = report.evidenceRows.filter((row) => row.status === "approved" || row.status === "paid");

  return (
    <div className="split-pane-layout fade-in">
      
      {/* Left Pane: Document Viewer */}
      <div className="pane-document">
        
        <div className="doc-header">
          <div className="doc-title-group">
            <span className="doc-kicker font-mono">FEYNMAN INTELLIGENCE MEMO</span>
            <h1 className="doc-title">Final Analysis & Recommendation</h1>
          </div>
          
          <div className="doc-actions">
            <button className="btn-doc-action">
              <Share2 size={14} /> Share
            </button>
            <button className="btn-doc-primary">
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>

        <div className="doc-body">
          <section className="doc-section">
            <h2 className="doc-h2">Executive Summary</h2>
            <p className="doc-p">{report.executiveSummary}</p>
          </section>

          <section className="doc-section mt-32">
            <div className="section-header-flex">
              <h2 className="doc-h2">Primary Recommendation</h2>
              <span className="badge-confidence bg-emerald-light text-emerald font-mono">
                {Math.round(report.confidence * 100)}% Confidence Score
              </span>
            </div>
            
            <div className="recommendation-callout">
              <Zap size={18} className="callout-icon text-amber" />
              <div className="callout-content">
                <p className="doc-p strong">{report.recommendation}</p>
              </div>
            </div>
          </section>

          <section className="doc-section mt-32">
            <h2 className="doc-h2">Critical Uncertainty Drivers</h2>
            <p className="doc-p">
              Rainfall in dry years, maintenance behavior, procurement quality, and the limited scope of demo citations remain the main uncertainty drivers. 
              The swarm flagged <strong>{report.rejectedClaims.length} sources</strong> as unreliable during the verification phase.
            </p>
          </section>
        </div>
      </div>

      {/* Right Pane: Citations & Escrow Panel */}
      <div className="pane-sidebar">
        
        <div className="sidebar-section">
          <h3 className="sidebar-h3">Verified Evidence Sources</h3>
          <div className="citation-list">
            {acceptedRows.map((row, idx) => (
              <div key={idx} className="citation-card">
                <div className="citation-top">
                  <span className="citation-num">{idx + 1}</span>
                  <p className="citation-claim">{row.claim}</p>
                </div>
                <div className="citation-bottom">
                  <div className="citation-source">
                    <Link2 size={12} className="text-muted" />
                    <span className="truncate">{row.source}</span>
                  </div>
                  <span className="citation-cost font-mono">paid {formatXlm(row.costXlm)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-section mt-32">
          <h3 className="sidebar-h3">Escrow Ledger</h3>
          
          <div className="ledger-receipt">
            <div className="receipt-row">
              <span className="label">Initial Funding</span>
              <span className="value font-mono">{formatXlm(invoice.budgetXlm)}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Total Paid to Agents</span>
              <span className="value font-mono text-dark">{formatXlm(invoice.spentXlm)}</span>
            </div>
            <div className="receipt-divider" />
            <div className="receipt-row highlight">
              <span className="label">Remaining (Refundable)</span>
              <span className="value font-mono">{formatXlm(invoice.refundedXlm)}</span>
            </div>
          </div>
          
          <div className="receipt-footer">
            <CheckCircle size={12} className="text-emerald" />
            <span>Audit trail permanently recorded on Stellar Testnet</span>
          </div>
        </div>

      </div>
    </div>
  );
}
