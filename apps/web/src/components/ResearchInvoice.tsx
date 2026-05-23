import { ArrowRightLeft, Award, CheckCircle2, FileText, RefreshCw, TrendingUp, Wallet, XCircle } from "lucide-react";
import type { ResearchInvoice as InvoiceModel } from "../types";
import { formatXlm } from "../lib/hash";

interface ResearchInvoiceProps {
  invoice: InvoiceModel;
  canRefund: boolean;
  onRefund: () => void;
}

export function ResearchInvoice({ invoice, canRefund, onRefund }: ResearchInvoiceProps) {
  const roleByAgent: Record<string, string> = {
    Planner: "Mission planner",
    "Paper Scout": "Literature researcher",
    "Web Scout": "Web researcher",
    "Repo Scout": "Data & code researcher",
    Verifier: "Evidence verifier",
    Writer: "Report writer"
  };
  const palette = ["#E0E7FF", "#ECFDF5", "#FFFBEB", "#F0FDFA", "#EEF2F6", "#F5F3FF"];
  const iconPalette = ["#4F46E5", "#10B981", "#F59E0B", "#0D9488", "#4B5563", "#7C3AED"];
  const grouped = invoice.lines.reduce<Record<string, { accepted: number; earned: number; rejected: boolean }>>((rows, line) => {
    const current = rows[line.agentName] ?? { accepted: 0, earned: 0, rejected: false };
    const paid = line.status === "approved" || line.status === "paid";
    rows[line.agentName] = {
      accepted: current.accepted + (paid ? 1 : 0),
      earned: current.earned + line.rewardXlm,
      rejected: current.rejected || line.status === "rejected"
    };
    return rows;
  }, {});
  const payoutRows = Object.entries(grouped).map(([name, row], index) => ({
    name,
    role: roleByAgent[name] ?? "Research contributor",
    accepted: row.accepted,
    earned: row.earned,
    partial: row.rejected || row.earned === 0,
    avatarBg: palette[index % palette.length],
    iconColor: iconPalette[index % iconPalette.length]
  }));
  const spentPct = invoice.budgetXlm === 0 ? 0 : Math.round((invoice.spentXlm / invoice.budgetXlm) * 100);
  const refundPct = invoice.budgetXlm === 0 ? 0 : Math.round((invoice.refundedXlm / invoice.budgetXlm) * 100);

  return (
    <div className="invoice-workspace fade-in font-sans">
      <div className="agents-title-row">
        <div className="title-block">
          <h1>Research invoice.</h1>
          <p className="subtitle">Every payout has a reason. Review how your budget was spent, what was produced, and how contributors were rewarded.</p>
        </div>
      </div>

      <div className="invoice-stats-grid">
        <div className="invoice-stat-card font-sans">
          <div className="card-top font-sans">
            <span className="label">Total budget</span>
            <div className="icon-wrapper bg-blue-light text-blue">
              <Wallet size={16} />
            </div>
          </div>
          <strong className="value font-mono">{formatXlm(invoice.budgetXlm)}</strong>
          <span className="sub font-mono">testnet escrow</span>
        </div>

        <div className="invoice-stat-card font-sans">
          <div className="card-top font-sans">
            <span className="label">Spent</span>
            <div className="icon-wrapper bg-blue-light text-blue">
              <FileText size={16} />
            </div>
          </div>
          <strong className="value font-mono">{formatXlm(invoice.spentXlm)}</strong>
          <span className="sub font-mono">{spentPct}% of budget</span>
        </div>

        <div className="invoice-stat-card font-sans">
          <div className="card-top font-sans">
            <span className="label">{canRefund ? "Refundable" : "Refunded"}</span>
            <div className="icon-wrapper bg-green-light text-green">
              <RefreshCw size={16} />
            </div>
          </div>
          <strong className="value font-mono">{formatXlm(invoice.refundedXlm)}</strong>
          <span className="sub font-mono">{refundPct}% of budget</span>
        </div>

        <div className="invoice-stat-card font-sans">
          <div className="card-top font-sans">
            <span className="label">Accepted artifacts</span>
            <div className="icon-wrapper bg-blue-light text-blue">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <strong className="value font-mono">{invoice.acceptedClaims}</strong>
          <span className="sub font-mono">Out of {invoice.lines.length}</span>
        </div>

        <div className="invoice-stat-card font-sans">
          <div className="card-top font-sans">
            <span className="label">Rejected artifacts</span>
            <div className="icon-wrapper bg-rose-light text-rose">
              <XCircle size={16} />
            </div>
          </div>
          <strong className="value font-mono">{invoice.rejectedClaims}</strong>
          <span className="sub font-mono">Out of {invoice.lines.length}</span>
        </div>
      </div>

      <div className="invoice-layout-grid mt-24">
        <div className="invoice-main-column">
          <section className="setup-main-card">
            <div className="card-inner-padding">
              <h2 className="setup-section-title">Contributor payouts</h2>

              <div className="payout-table-wrapper">
                <table className="payout-custom-table font-sans">
                  <thead>
                    <tr>
                      <th style={{ width: "30%" }}>Agent</th>
                      <th style={{ width: "30%" }}>Role</th>
                      <th style={{ width: "20%" }}>Accepted contributions</th>
                      <th style={{ width: "20%" }} className="text-right">
                        XLM earned
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutRows.map((row) => (
                      <tr key={row.name} className="payout-table-row">
                        <td>
                          <div className="payout-agent-cell">
                            <div className="payout-avatar-circle" style={{ backgroundColor: row.avatarBg, color: row.iconColor }}>
                              {row.name.charAt(0)}
                            </div>
                            <strong className="payout-agent-name">{row.name}</strong>
                            {!row.partial && <CheckCircle2 size={14} className="text-green flex-shrink-0 ml-4" />}
                          </div>
                        </td>
                        <td className="text-muted-custom">{row.role}</td>
                        <td className="font-mono text-center-custom">{row.accepted}</td>
                        <td className="text-right font-mono">
                          <div className="payout-earned-cell">
                            <strong>{formatXlm(row.earned)}</strong>
                            {row.partial && <span className="partial-badge font-sans">Partial</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <aside className="invoice-sidebar-column">
          <section className="setup-main-card">
            <div className="card-inner-padding">
              <h2 className="setup-section-title">Payout insights</h2>

              <div className="insights-stack font-sans">
                <div className="insight-row">
                  <div className="insight-icon bg-blue-light text-blue">
                    <Award size={16} />
                  </div>
                  <div className="insight-content">
                    <span className="label">Cost per accepted claim</span>
                    <strong className="val font-mono">{formatXlm(invoice.costPerAcceptedClaim)}</strong>
                    <span className="desc">{formatXlm(invoice.spentXlm)} / {invoice.acceptedClaims || 0} accepted</span>
                  </div>
                </div>

                <div className="insight-row">
                  <div className="insight-icon bg-blue-light text-blue">
                    <TrendingUp size={16} />
                  </div>
                  <div className="insight-content">
                    <span className="label">Confidence per XLM</span>
                    <strong className="val font-mono">{invoice.spentXlm ? (invoice.acceptedClaims / invoice.spentXlm).toFixed(2) : "0.00"}</strong>
                    <span className="desc">Accepted artifacts per XLM</span>
                  </div>
                </div>

                <div className="insight-row">
                  <div className="insight-icon bg-blue-light text-blue">
                    <RefreshCw size={16} />
                  </div>
                  <div className="insight-content">
                    <span className="label">{canRefund ? "Refundable to you" : "Refunded to you"}</span>
                    <strong className="val font-mono">{formatXlm(invoice.refundedXlm)}</strong>
                    <span className="desc">{canRefund ? "Available for settlement" : "Returned to your wallet"}</span>
                  </div>
                </div>

                <div className="policy-block bg-green-superlight border-green-light font-sans mt-18">
                  <CheckCircle2 size={16} className="text-green flex-shrink-0 mt-2" />
                  <div className="policy-content">
                    <strong className="policy-title text-dark">{canRefund ? "Refund ready" : "Refund processed"}</strong>
                    <p className="policy-desc text-muted-custom">
                      {formatXlm(invoice.refundedXlm)} {canRefund ? "is ready to return" : "has been returned"} to your wallet.
                    </p>
                  </div>
                </div>
              </div>

              {canRefund && (
                <button className="btn btn-secondary btn-full font-mono mt-18" onClick={onRefund}>
                  <ArrowRightLeft size={14} className="btn-icon" />
                  Trigger Settlement Refund
                </button>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
