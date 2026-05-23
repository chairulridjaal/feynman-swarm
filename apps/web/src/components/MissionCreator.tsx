import { Sparkles, HelpCircle } from "lucide-react";
import type { MissionState } from "../types";

interface MissionCreatorProps {
  state: MissionState;
  onQuestionChange: (question: string) => void;
  onBudgetChange: (budgetXlm: number) => void;
  onDepthChange: (depth: MissionState["depth"]) => void;
  onOutputTypeChange: (outputType: MissionState["outputType"]) => void;
  onCreateMission: () => void;
}

export function MissionCreator({
  state,
  onQuestionChange,
  onBudgetChange,
  onDepthChange,
  onOutputTypeChange,
  onCreateMission,
}: MissionCreatorProps) {
  const canCreate = state.question.trim().length > 12 && state.budgetXlm > 0;

  return (
    <div className="mission-setup-workspace fade-in">
      <div className="setup-title-block">
        <h1>Create research mission</h1>
        <p className="setup-subtitle">
          Define a research question, set your funding budget, and spawn a swarm of verification agents.
        </p>
      </div>

      <div className="setup-columns-grid">
        {/* Left Creator Column */}
        <section className="setup-main-card">
          <div className="card-inner-padding">
            <h2 className="setup-section-title">Mission Parameters</h2>

            <div className="setup-fields-stack">
              <label className="setup-field">
                <span className="setup-field-label">Research Question</span>
                <textarea
                  value={state.question}
                  onChange={(e) => onQuestionChange(e.target.value)}
                  placeholder="e.g. What sustainability project should a rural Indonesian school prioritize: rooftop solar, smart irrigation, or rainwater harvesting?"
                  rows={4}
                  aria-label="Research question"
                />
              </label>

              <div className="setup-form-row">
                <label className="setup-field">
                  <span className="setup-field-label">Funding Budget (XLM)</span>
                  <div className="input-with-tag">
                    <input
                      type="number"
                      min="10"
                      step="5"
                      value={state.budgetXlm}
                      onChange={(e) => onBudgetChange(Number(e.target.value))}
                    />
                    <span className="input-tag font-mono">XLM</span>
                  </div>
                </label>

                <label className="setup-field">
                  <span className="setup-field-label">Research Depth</span>
                  <select
                    value={state.depth}
                    onChange={(e) => onDepthChange(e.target.value as MissionState["depth"])}
                  >
                    <option value="rapid">Rapid Scan</option>
                    <option value="standard">Standard Swarm</option>
                    <option value="deep">Deep Review</option>
                  </select>
                </label>

                <label className="setup-field">
                  <span className="setup-field-label">Expected Output</span>
                  <select
                    value={state.outputType}
                    onChange={(e) => onOutputTypeChange(e.target.value as MissionState["outputType"])}
                  >
                    <option value="brief">Decision Brief</option>
                    <option value="technical">Technical Memo</option>
                    <option value="board">Board Report</option>
                  </select>
                </label>
              </div>
            </div>

            <button
              className="btn-primary-mockup btn-full mt-24"
              onClick={onCreateMission}
              disabled={!canCreate}
            >
              <Sparkles size={16} />
              Create Mission Contract
            </button>
          </div>
        </section>

        {/* Right Info Column */}
        <aside className="setup-sidebar-stack">
          <div className="setup-info-card">
            <h3 className="info-card-title">Research Guarantee</h3>
            <div className="info-card-body">
              <div className="info-bullet">
                <div className="info-bullet-dot" />
                <p>
                  <strong>Freighter Sandbox Wallet</strong> holds funds securely in Soroban escrow.
                </p>
              </div>
              <div className="info-bullet">
                <div className="info-bullet-dot" />
                <p>
                  <strong>Verifier Agent</strong> audits academic, web, and repo sources before releasing rewards.
                </p>
              </div>
              <div className="info-bullet">
                <div className="info-bullet-dot" />
                <p>
                  <strong>Unused budget</strong> returns directly to your wallet upon final memo completion.
                </p>
              </div>
            </div>
          </div>

          <div className="setup-help-box font-mono">
            <HelpCircle size={14} className="icon-text" />
            <span>Stellar Testnet ledger integration active.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
