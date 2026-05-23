import { Sparkles, Activity, ShieldCheck, Database } from "lucide-react";
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
    <div className="focused-wizard-container fade-in">
      <div className="wizard-hero-block">
        <h1 className="wizard-title">What do you want to investigate?</h1>
        <p className="wizard-subtitle">
          Define your question. Our verified agents will synthesize papers, repositories, and web data into a cited report.
        </p>
      </div>

      <div className="wizard-card-center">
        <div className="wizard-input-hero">
          <textarea
            className="hero-textarea"
            value={state.question}
            onChange={(e) => onQuestionChange(e.target.value)}
            placeholder="e.g. Compare the efficiency of rooftop solar vs. rainwater harvesting in rural communities..."
            rows={3}
            aria-label="Research question"
          />
        </div>

        <div className="wizard-parameters-row">
          <div className="param-item">
            <span className="param-label">Funding (XLM)</span>
            <div className="param-input-box">
              <input
                type="number"
                min="10"
                step="5"
                value={state.budgetXlm}
                onChange={(e) => onBudgetChange(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="param-item">
            <span className="param-label">Depth</span>
            <div className="param-select-box">
              <Activity size={14} className="param-icon" />
              <select
                value={state.depth}
                onChange={(e) => onDepthChange(e.target.value as MissionState["depth"])}
              >
                <option value="rapid">Rapid Scan</option>
                <option value="standard">Standard Swarm</option>
                <option value="deep">Deep Review</option>
              </select>
            </div>
          </div>

          <div className="param-item">
            <span className="param-label">Output</span>
            <div className="param-select-box">
              <Database size={14} className="param-icon" />
              <select
                value={state.outputType}
                onChange={(e) => onOutputTypeChange(e.target.value as MissionState["outputType"])}
              >
                <option value="brief">Decision Brief</option>
                <option value="technical">Technical Memo</option>
                <option value="board">Board Report</option>
              </select>
            </div>
          </div>
        </div>

        <div className="wizard-action-footer">
          <button
            className="btn-wizard-primary"
            onClick={onCreateMission}
            disabled={!canCreate}
          >
            <Sparkles size={18} />
            Initialize Swarm Mission
          </button>
        </div>
      </div>

      <div className="wizard-trust-badges">
        <div className="trust-badge">
          <ShieldCheck size={14} className="trust-icon text-emerald" />
          <span>Soroban Escrow</span>
        </div>
        <div className="trust-badge-divider" />
        <div className="trust-badge">
          <Activity size={14} className="trust-icon text-blue" />
          <span>Verifiable Citations</span>
        </div>
      </div>
    </div>
  );
}
