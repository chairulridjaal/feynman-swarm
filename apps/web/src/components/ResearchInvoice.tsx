import { 
  Wallet, FileCheck, CheckCircle2, XCircle, ArrowRightLeft, ShieldAlert, Award, TrendingUp, RefreshCw, FileText 
} from "lucide-react";
import type { ResearchInvoice as InvoiceModel } from "../types";
import { formatXlm } from "../lib/hash";

interface ResearchInvoiceProps {
  invoice: InvoiceModel;
  canRefund: boolean;
  onRefund: () => void;
}

export function ResearchInvoice({ invoice, canRefund, onRefund }: ResearchInvoiceProps) {
  // Contributor payouts rows to match Image 4 exactly
  const payoutRows = [
    {
      name: "Planner",
      role: "Mission planner",
      accepted: 1,
      earned: "12.00 XLM",
      partial: false,
      avatarBg: "#E0E7FF",
      iconColor: "#4F46E5"
    },
    {
      name: "Paper Scout",
      role: "Literature researcher",
      accepted: 1,
      earned: "12.00 XLM",
      partial: false,
      avatarBg: "#ECFDF5",
      iconColor: "#10B981"
    },
    {
      name: "Web Scout",
      role: "Web researcher",
      accepted: 1,
      earned: "12.00 XLM",
      partial: false,
      avatarBg: "#FFFBEB",
      iconColor: "#F59E0B"
    },
    {
      name: "Repo Scout",
      role: "Data & code researcher",
      accepted: 1,
      earned: "12.00 XLM",
      partial: false,
      avatarBg: "#F0FDFA",
      iconColor: "#0D9488"
    },
    {
      name: "Verifier",
      role: "Evidence verifier",
      accepted: 1,
      earned: "12.00 XLM",
      partial: false,
      avatarBg: "#EEF2F6",
      iconColor: "#4B5563"
    },
    {
      name: "Writer",
      role: "Report writer",
      accepted: 0,
      earned: "12.00 XLM",
      partial: true,
      avatarBg: "#F5F3FF",
      iconColor: "#7C3AED"
    }
  ];

  return (
    <div className="invoice-workspace fade-in font-sans">
      
      {/* Title block */}
      <div className="agents-title-row">
        <div className="title-block">
          <h1>Research invoice.</h1>
          <p className="subtitle">
            Every payout has a reason. Review how your budget was spent, what was produced, and how contributors were rewarded.
          </p>
        </div>
      </div>

      {/* Horizontal Stats Row - 5 Cards */}
      <div className="invoice-stats-grid">
        {/* Card 1: Total Budget */}
        <div className="invoice-stat-card font-sans">
          <div className="card-top font-sans">
            <span className="label">Total budget</span>
            <div className="icon-wrapper bg-blue-light text-blue"><Wallet size={16} /></div>
          </div>
          <strong className="value font-mono">100 XLM</strong>
          <span className="sub font-mono">≈ $33.60 USD</span>
        </div>

        {/* Card 2: Spent */}
        <div className="invoice-stat-card font-sans">
          <div className="card-top font-sans">
            <span className="label">Spent</span>
            <div className="icon-wrapper bg-blue-light text-blue"><FileText size={16} /></div>
          </div>
          <strong className="value font-mono">72 XLM</strong>
          <span className="sub font-mono">72% of budget</span>
        </div>

        {/* Card 3: Refunded */}
        <div className="invoice-stat-card font-sans">
          <div className="card-top font-sans">
            <span className="label">Refunded</span>
            <div className="icon-wrapper bg-green-light text-green"><RefreshCw size={16} /></div>
          </div>
          <strong className="value font-mono">28 XLM</strong>
          <span className="sub font-mono">28% of budget</span>
        </div>

        {/* Card 4: Accepted Artifacts */}
        <div className="invoice-stat-card font-sans">
          <div className="card-top font-sans">
            <span className="label">Accepted artifacts</span>
            <div className="icon-wrapper bg-blue-light text-blue"><CheckCircle2 size={16} /></div>
          </div>
          <strong className="value font-mono">5</strong>
          <span className="sub font-mono">Out of 6</span>
        </div>

        {/* Card 5: Rejected Artifacts */}
        <div className="invoice-stat-card font-sans">
          <div className="card-top font-sans">
            <span className="label">Rejected artifacts</span>
            <div className="icon-wrapper bg-rose-light text-rose"><XCircle size={16} /></div>
          </div>
          <strong className="value font-mono">1</strong>
          <span className="sub font-mono">Out of 6</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="invoice-layout-grid mt-24">
        
        {/* Left Column: Contributor Payouts */}
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
                      <th style={{ width: "20%" }} className="text-right">XLM earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutRows.map((row) => (
                      <tr key={row.name} className="payout-table-row">
                        {/* Agent Avatar & Name */}
                        <td>
                          <div className="payout-agent-cell">
                            <div className="payout-avatar-circle" style={{ backgroundColor: row.avatarBg, color: row.iconColor }}>
                              {row.name.charAt(0)}
                            </div>
                            <strong className="payout-agent-name">{row.name}</strong>
                            {!row.partial && (
                              <CheckCircle2 size={14} className="text-green flex-shrink-0 ml-4" />
                            )}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="text-muted-custom">{row.role}</td>

                        {/* Accepted Contributions */}
                        <td className="font-mono text-center-custom">{row.accepted}</td>

                        {/* XLM Earned */}
                        <td className="text-right font-mono">
                          <div className="payout-earned-cell">
                            <strong>{row.earned}</strong>
                            {row.partial && (
                              <span className="partial-badge font-sans">Partial</span>
                            )}
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

        {/* Right Column: Payout Insights */}
        <aside className="invoice-sidebar-column">
          <section className="setup-main-card">
            <div className="card-inner-padding">
              <h2 className="setup-section-title">Payout insights</h2>

              <div className="insights-stack font-sans">
                {/* Insight 1: Cost per Claim */}
                <div className="insight-row">
                  <div className="insight-icon bg-blue-light text-blue"><Award size={16} /></div>
                  <div className="insight-content">
                    <span className="label">Cost per accepted claim</span>
                    <strong className="val font-mono">14.40 XLM</strong>
                    <span className="desc">72 XLM ÷ 5 accepted</span>
                  </div>
                </div>

                {/* Insight 2: Confidence per XLM */}
                <div className="insight-row">
                  <div className="insight-icon bg-blue-light text-blue"><TrendingUp size={16} /></div>
                  <div className="insight-content">
                    <span className="label">Confidence per XLM</span>
                    <strong className="val font-mono">0.86</strong>
                    <span className="desc">Average confidence 86%</span>
                  </div>
                </div>

                {/* Insight 3: Refunded to you */}
                <div className="insight-row">
                  <div className="insight-icon bg-blue-light text-blue"><RefreshCw size={16} /></div>
                  <div className="insight-content">
                    <span className="label">Refunded to you</span>
                    <strong className="val font-mono">28 XLM</strong>
                    <span className="desc">Returned to your wallet</span>
                  </div>
                </div>

                {/* Green Refund Status Card */}
                <div className="policy-block bg-green-superlight border-green-light font-sans mt-18">
                  <CheckCircle2 size={16} className="text-green flex-shrink-0 mt-2" />
                  <div className="policy-content">
                    <strong className="policy-title text-dark">Refund processed</strong>
                    <p className="policy-desc text-muted-custom">
                      28 XLM has been returned to your wallet. It may take a few moments to appear on-chain.
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
