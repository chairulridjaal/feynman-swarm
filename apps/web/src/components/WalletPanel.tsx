import { Lightbulb, Shield, HelpCircle, FileText, CheckCircle2, RotateCcw, Lock, Info, Sparkles } from "lucide-react";
import type { LedgerState, MissionPhase, WalletState } from "../types";
import { formatXlm } from "../lib/hash";

interface WalletPanelProps {
  wallet: WalletState;
  ledger: LedgerState;
  phase: MissionPhase;
  budgetXlm: number;
  onConnectWallet: () => void;
  onDemoWallet: () => void;
  onFundMission: () => void;
  onStartSwarm: () => void;
}

export function WalletPanel({
  wallet,
  ledger,
  phase,
  budgetXlm,
  onConnectWallet,
  onDemoWallet,
  onFundMission,
  onStartSwarm,
}: WalletPanelProps) {
  const isDemo = wallet.mode === "mock";
  const isWalletConnected = wallet.mode !== "unknown";
  
  // Calculate breakdown values
  const totalBudget = budgetXlm || 100;
  const platformFee = totalBudget * 0.05;
  const contributorPortion = totalBudget - platformFee;
  
  const canFund = phase === "created" && isWalletConnected;
  const isAlreadyFunded = phase === "funded";

  return (
    <div className="fund-mission-workspace fade-in">
      <div className="setup-title-block">
        <h1>Fund your mission</h1>
        <p className="setup-subtitle">
          Your mission has been created and is ready to be funded. Add XLM to activate the research and start the work.
        </p>
      </div>

      <div className="fund-columns-grid">
        
        {/* Left wider Column */}
        <div className="fund-main-column">
          
          {/* Mission summary card */}
          <section className="setup-main-card">
            <div className="card-inner-padding">
              <h2 className="setup-section-title">Mission summary</h2>
              
              <div className="summary-bullets-stack">
                <div className="summary-bullet">
                  <div className="bullet-icon-container bg-blue-light text-blue">
                    <Lightbulb size={16} />
                  </div>
                  <div className="bullet-content">
                    <span className="bullet-label">Research question</span>
                    <p className="bullet-text">
                      What sustainability project should a rural Indonesian school prioritize: rooftop solar, smart irrigation, or rainwater harvesting?
                    </p>
                  </div>
                </div>

                <div className="summary-bullet">
                  <div className="bullet-icon-container bg-grey-light text-dark">
                    <Shield size={16} />
                  </div>
                  <div className="bullet-content">
                    <span className="bullet-label">Target budget</span>
                    <strong className="bullet-text-bold">{totalBudget} XLM</strong>
                  </div>
                </div>

                <div className="summary-bullet">
                  <div className="bullet-icon-container bg-blue-light text-blue">
                    <FileText size={16} />
                  </div>
                  <div className="bullet-content">
                    <span className="bullet-label">Expected output</span>
                    <p className="bullet-text">
                      A verified research report with comparative analysis, evidence citations, and recommendations.
                    </p>
                  </div>
                </div>

                <div className="summary-bullet">
                  <div className="bullet-icon-container bg-green-light text-green">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="bullet-content">
                    <span className="bullet-label">Mission status</span>
                    <div className="bullet-status-row">
                      <span className="status-badge-custom bg-emerald-light text-emerald">
                        <span className="status-badge-dot bg-emerald" />
                        Ready to fund
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Funding control card */}
          <section className="setup-main-card mt-24">
            <div className="card-inner-padding">
              <h2 className="setup-section-title">Fund your mission</h2>
              
              {isWalletConnected ? (
                <>
                  <div className="funding-inputs-row">
                    <label className="funding-input-field flex-2">
                      <span className="input-field-label">Budget to fund</span>
                      <div className="funding-input-container">
                        <div className="stellar-symbol-icon" />
                        <input type="number" readOnly value={totalBudget} />
                        <span className="input-tag font-mono">XLM</span>
                        <button className="btn-max-tag font-mono">Max</button>
                      </div>
                    </label>

                    <div className="funding-input-field">
                      <span className="input-field-label">
                        Network
                        <Info size={12} className="info-icon-grey" />
                      </span>
                      <div className="network-pill-box">
                        <span className="network-pill-dot bg-blue" />
                        <span className="font-mono">Stellar Testnet</span>
                      </div>
                    </div>

                    <div className="funding-input-field flex-1.5">
                      <span className="input-field-label">
                        Your balance
                        <Info size={12} className="info-icon-grey" />
                      </span>
                      <div className="balance-pill-box">
                        <strong className="font-mono">{isDemo ? "250.42 XLM" : formatXlm(wallet.balanceXlm)}</strong>
                        <span className="usd-valuation font-mono">≈ $83.01 USD</span>
                      </div>
                    </div>
                  </div>

                  {phase === "created" && (
                    <button className="btn-primary-mockup btn-full mt-24" onClick={onFundMission}>
                      <Sparkles size={16} />
                      Fund Mission with {totalBudget} XLM
                    </button>
                  )}

                  {isAlreadyFunded && (
                    <button className="btn-indigo-mockup btn-full mt-24" onClick={onStartSwarm}>
                      Start Swarm Operations
                    </button>
                  )}

                  <div className="escrow-lock-footer font-sans">
                    <Lock size={12} />
                    <span>Funds are held in escrow and released upon verified completion.</span>
                  </div>
                </>
              ) : (
                <div className="disconnected-funding-box">
                  <p>Please connect your Stellar Freighter or Sandbox Wallet at the top right to enable secure Soroban escrow funding.</p>
                  <div className="wallet-connect-buttons mt-16">
                    <button className="btn btn-secondary" onClick={onConnectWallet}>
                      Connect Freighter
                    </button>
                    <button className="btn btn-primary" onClick={onDemoWallet}>
                      Use Sandbox Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right narrower Column */}
        <div className="fund-sidebar-column">
          
          {/* Payment preview card */}
          <section className="setup-main-card">
            <div className="card-inner-padding">
              <h2 className="setup-section-title">Payment preview</h2>
              
              <div className="breakdown-stack">
                <span className="stack-heading">Budget breakdown</span>
                <div className="breakdown-row">
                  <span>Total budget</span>
                  <strong className="font-mono">{totalBudget} XLM</strong>
                </div>
                <div className="breakdown-row text-muted-custom">
                  <span>
                    Platform fee (5%)
                    <HelpCircle size={12} className="info-icon-grey" />
                  </span>
                  <strong className="font-mono">{platformFee.toFixed(0)} XLM</strong>
                </div>
                <div className="breakdown-row highlight-payout">
                  <span>To research & contributors</span>
                  <strong className="font-mono">{contributorPortion.toFixed(0)} XLM</strong>
                </div>
              </div>

              <div className="estimated-timeline-box font-sans">
                <div className="timeline-labels-row">
                  <span className="timeline-label">Estimated timeline</span>
                  <strong className="timeline-val font-mono">3–7 days</strong>
                </div>
                <p className="timeline-subtext">May vary based on research depth</p>
              </div>

              <div className="refund-policy-stack">
                <span className="stack-heading">Refund policy</span>
                
                <div className="policy-block bg-blue-superlight border-indigo-light">
                  <Shield size={16} className="text-blue flex-shrink-0" />
                  <div className="policy-content">
                    <strong className="policy-title text-dark">Risk-free funding</strong>
                    <p className="policy-desc text-muted-custom">
                      If the mission is not started within 7 days, you can cancel and receive a full refund.
                    </p>
                  </div>
                </div>

                <div className="policy-block bg-green-superlight border-green-light">
                  <RotateCcw size={16} className="text-green flex-shrink-0" />
                  <div className="policy-content">
                    <strong className="policy-title text-dark">Unused funds return to you</strong>
                    <p className="policy-desc text-muted-custom">
                      Any unused XLM will be returned to your wallet after the mission is completed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="policy-lock-footer font-sans mt-24">
                <Shield size={14} />
                <span>Your funds are secure. No payments are made until evidence is verified.</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
