import { 
  FileText, Award, Sparkles, AlertTriangle, XCircle, DollarSign, ArrowRight, Download, Share2 
} from "lucide-react";
import type { FinalReportModel, MissionPhase } from "../types";

interface FinalReportProps {
  report: FinalReportModel;
  phase: MissionPhase;
  onFinalize: () => void;
}

export function FinalReport({ report, phase, onFinalize }: FinalReportProps) {
  const canFinalize = phase === "verifying";
  const unlocked = phase === "finalized";

  // Data to match Image 5 exactly
  const keyEvidence = [
    {
      evidence: "Rainfall reliability",
      shows: "4–5 month dry season; high inter-annual variability",
      source: "BMKG (2020–2023)"
    },
    {
      evidence: "Water demand",
      shows: "≈8–12 m³/day for students, staff, sanitation, cleaning",
      source: "WHO WASH & SNI 03-7065"
    },
    {
      evidence: "Rainwater potential",
      shows: "≈450–650 m²/year from 600 m² roof (0.75 runoff)",
      source: "Tanks for Everything (2021)"
    },
    {
      evidence: "Irrigation efficiency",
      shows: "Smart drip cuts use 30–50% vs. conventional",
      source: "FAO Irrigation Brief (2019)"
    },
    {
      evidence: "Solar viability",
      shows: "Payback 4–6 yrs with clear load profile & maintenance",
      source: "IRENA (2022), Case studies"
    }
  ];

  return (
    <div className="report-workspace fade-in font-sans">
      
      {/* Title Row with Buttons */}
      <div className="agents-title-row">
        <div className="title-block">
          <div className="report-title-badge-row">
            <h1>Final report</h1>
            <span className="report-ready-badge bg-emerald-light text-emerald font-sans">
              <span className="status-badge-dot bg-emerald" />
              Report ready
            </span>
          </div>
          <p className="subtitle">Research complete. Review the findings and recommendations.</p>
        </div>

        <div className="btn-toolbar">
          <button className="btn btn-secondary btn-sm">
            <Download size={14} className="btn-icon" />
            Download PDF
          </button>
          <button className="btn-primary-mockup btn-sm" style={{ padding: "8px 16px" }}>
            <Share2 size={14} className="btn-icon" />
            Share Report
          </button>
        </div>
      </div>

      {/* Two Column Layout Grid */}
      <div className="report-layout-grid mt-24">
        
        {/* Left Column: Report content cards */}
        <div className="report-main-column">
          
          {/* Executive Summary Card */}
          <section className="setup-main-card">
            <div className="card-inner-padding">
              <div className="card-header-with-icon">
                <div className="icon-wrapper bg-blue-light text-blue"><FileText size={16} /></div>
                <h2 className="setup-section-title">Executive summary</h2>
              </div>
              <p className="report-body-text mt-12">
                Water reliability is the binding constraint for the school. Rainfall is seasonal and storage is limited, causing periodic shortages that disrupt classes and hygiene. Among the options evaluated—rooftop solar, smart irrigation, and rainwater harvesting—interventions that secure water now deliver the highest impact per dollar.
              </p>
            </div>
          </section>

          {/* Recommendation Card */}
          <section className="setup-main-card mt-24">
            <div className="card-inner-padding">
              <div className="card-header-with-icon-badge">
                <div className="card-header-with-icon">
                  <div className="icon-wrapper bg-blue-light text-blue"><Sparkles size={16} /></div>
                  <h2 className="setup-section-title">Recommendation</h2>
                </div>
                <span className="primary-tag font-mono">Primary</span>
              </div>

              <div className="recommendation-memo-box mt-12">
                <p className="rec-text-memo">
                  Prioritize rainwater harvesting and smart irrigation to stabilize water supply and reduce waste. Add rooftop solar when there is a clear load profile and a maintenance plan in place.
                </p>
              </div>
            </div>
          </section>

          {/* Key Evidence Card */}
          <section className="setup-main-card mt-24">
            <div className="card-inner-padding">
              <div className="card-header-with-icon">
                <div className="icon-wrapper bg-blue-light text-blue"><Award size={16} /></div>
                <h2 className="setup-section-title">Key evidence</h2>
              </div>

              <div className="evidence-table-wrapper mt-12">
                <table className="evidence-custom-table font-sans">
                  <thead>
                    <tr>
                      <th style={{ width: "30%" }}>Evidence</th>
                      <th style={{ width: "45%" }}>What it shows</th>
                      <th style={{ width: "25%" }}>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keyEvidence.map((row, idx) => (
                      <tr key={idx} className="evidence-table-row">
                        <td>
                          <div className="evidence-cell-name">
                            <span className="bullet-dot-blue" />
                            <strong>{row.evidence}</strong>
                          </div>
                        </td>
                        <td className="text-dark-sub font-sans">{row.shows}</td>
                        <td className="text-muted-custom font-mono">{row.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Uncertainty Card */}
          <section className="setup-main-card mt-24">
            <div className="card-inner-padding">
              <div className="uncertainty-flex-row">
                <div className="uncertainty-left">
                  <div className="card-header-with-icon">
                    <div className="icon-wrapper bg-blue-light text-blue"><AlertTriangle size={16} /></div>
                    <h2 className="setup-section-title">Uncertainty</h2>
                  </div>
                  <p className="report-body-text mt-12">
                    Rainfall in dry years, future tariff or fuel prices, behavior change for maintenance, and procurement/installation quality.
                  </p>
                </div>
                
                <div className="uncertainty-right">
                  <div className="confidence-pill bg-amber-light text-amber border-amber-light">
                    <span className="status-badge-dot bg-amber" />
                    Medium Confidence
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Rejected Claims Card */}
          <section className="setup-main-card mt-24">
            <div className="card-inner-padding">
              <div className="card-header-with-icon">
                <div className="icon-wrapper bg-rose-light text-rose"><XCircle size={16} /></div>
                <h2 className="setup-section-title">Rejected claims</h2>
              </div>
              <ul className="rejected-claims-bullets mt-12 font-sans">
                <li>
                  <span className="bullet-dash-rose" />
                  <p>Rooftop solar alone will solve reliability—false without storage and O&M plan.</p>
                </li>
                <li>
                  <span className="bullet-dash-rose" />
                  <p>Smart irrigation without a reliable source—limited benefit.</p>
                </li>
              </ul>
            </div>
          </section>

          {/* Budget Summary Card */}
          <section className="setup-main-card mt-24">
            <div className="card-inner-padding">
              <div className="card-header-with-icon">
                <div className="icon-wrapper bg-blue-light text-blue"><DollarSign size={16} /></div>
                <h2 className="setup-section-title">Budget summary</h2>
              </div>
              <p className="report-body-text mt-12 font-sans">
                Total budget allocated: <strong>100 XLM (~$33.60 USD)</strong>. Funds were allocated across agents, data sources, and verification.
              </p>
            </div>
          </section>
        </div>

        {/* Right Column: Assessment Side Card details */}
        <div className="report-sidebar-column">
          
          {/* Overall assessment Card with Radial Dial */}
          <section className="setup-main-card">
            <div className="card-inner-padding">
              <h2 className="setup-section-title">Overall assessment</h2>
              
              <div className="radial-dial-container mt-16 font-sans">
                {/* Radial Gauge SVG */}
                <div className="radial-gauge-wrapper">
                  <svg className="radial-gauge" width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="#10B981"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="263.89"
                      strokeDashoffset={263.89 - (263.89 * 0.82)}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="radial-score font-sans">
                    <span className="score-val">82</span>
                    <span className="score-total">/100</span>
                  </div>
                </div>
                
                <span className="status-badge-custom bg-emerald-light text-emerald mt-12">
                  <span className="status-badge-dot bg-emerald" />
                  High confidence
                </span>
              </div>
            </div>
          </section>

          {/* Mission Card */}
          <section className="setup-main-card mt-24">
            <div className="card-inner-padding">
              <h2 className="setup-section-title">Mission</h2>
              <p className="report-sidebar-quest mt-8 font-sans">
                What sustainability project should a rural Indonesian school prioritize: rooftop solar, smart irrigation, or rainwater harvesting?
              </p>
            </div>
          </section>

          {/* Top Recommendation list */}
          <section className="setup-main-card mt-24">
            <div className="card-inner-padding">
              <h2 className="setup-section-title">Top recommendation</h2>
              
              <div className="rec-rank-list font-sans mt-12">
                <div className="rank-item">
                  <div className="rank-num">1</div>
                  <span className="rank-label">Rainwater harvesting</span>
                  <strong className="rank-score font-mono">9.1/10</strong>
                </div>
                <div className="rank-item">
                  <div className="rank-num">2</div>
                  <span className="rank-label">Smart irrigation</span>
                  <strong className="rank-score font-mono">8.4/10</strong>
                </div>
                <div className="rank-item">
                  <div className="rank-num font-grey">3</div>
                  <span className="rank-label text-muted-custom">Rooftop solar</span>
                  <strong className="rank-score text-muted-custom font-mono">7.2/10</strong>
                </div>
              </div>

              <button className="btn-link-action font-sans mt-16 btn-full">
                View full analysis
                <ArrowRight size={14} />
              </button>
            </div>
          </section>

          {/* Budget progress Card */}
          <section className="setup-main-card mt-24">
            <div className="card-inner-padding">
              <h2 className="setup-section-title">Budget summary</h2>
              
              <div className="sidebar-budget-breakdown font-sans mt-12">
                <div className="sidebar-budget-row">
                  <span>Total budget</span>
                  <strong className="font-mono">100 XLM</strong>
                </div>
                <div className="sidebar-budget-row mt-8">
                  <span>Spent to date</span>
                  <strong className="font-mono text-dark">98.7 XLM</strong>
                </div>

                <div className="sidebar-budget-progress mt-12">
                  <div className="progress-fill-indigo" style={{ width: "98.7%" }} />
                </div>
                <div className="sidebar-budget-pct-row font-mono mt-4">
                  <span className="pct">98.7%</span>
                </div>

                <p className="sidebar-budget-footer font-sans mt-12">Unspent funds will be returned.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
