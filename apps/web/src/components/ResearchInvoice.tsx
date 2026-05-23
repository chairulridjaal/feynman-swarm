import { ArrowRightLeft, Receipt } from "lucide-react";
import type { ResearchInvoice as InvoiceModel } from "../types";
import { formatXlm } from "../lib/hash";

interface ResearchInvoiceProps {
  invoice: InvoiceModel;
  canRefund: boolean;
  onRefund: () => void;
}

export function ResearchInvoice({ invoice, canRefund, onRefund }: ResearchInvoiceProps) {
  return (
    <section className="research-invoice" aria-labelledby="invoice-title">
      <div className="section-header">
        <Receipt size={18} className="icon-indigo" />
        <h2 id="invoice-title">Research Receipt</h2>
      </div>

      <div className="receipt-paper">
        <div className="receipt-header">
          <span className="receipt-brand">Feynman Swarm Ledger</span>
          <span className="receipt-date font-mono">Run ID #001</span>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Escrow</span>
            <strong className="summary-value font-mono">{formatXlm(invoice.budgetXlm)}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Spent</span>
            <strong className="summary-value font-mono text-dark">{formatXlm(invoice.spentXlm)}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Refunded</span>
            <strong className="summary-value font-mono text-green">{formatXlm(invoice.refundedXlm)}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Cost/Claim</span>
            <strong className="summary-value font-mono">{formatXlm(invoice.costPerAcceptedClaim)}</strong>
          </div>
        </div>

        <div className="receipt-divider" />

        <h3 className="receipt-section-title">Itemized Claims and Payouts</h3>
        <div className="receipt-lines">
          {invoice.lines.map((line, index) => (
            <div className="receipt-line font-mono" key={`${line.artifactId}-${index}`}>
              <div className="line-left">
                <span className="line-agent">{line.agentName}</span>
                <span className={`line-status status-${line.status}`}>{line.status}</span>
              </div>
              <strong className="line-reward">{formatXlm(line.rewardXlm)}</strong>
            </div>
          ))}
        </div>

        <div className="receipt-divider double" />

        <div className="receipt-total-row">
          <span>Net Escrow Settlement</span>
          <strong className="font-mono">{formatXlm(invoice.spentXlm)}</strong>
        </div>
      </div>

      {canRefund && (
        <button className="btn btn-secondary btn-full font-mono" onClick={onRefund}>
          <ArrowRightLeft size={14} className="btn-icon" />
          Refund Unused XLM to Funder
        </button>
      )}
    </section>
  );
}
