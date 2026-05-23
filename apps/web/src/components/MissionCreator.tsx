import { Landmark } from "lucide-react";
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
  onCreateMission
}: MissionCreatorProps) {
  const canCreate = state.question.trim().length > 12 && state.budgetXlm > 0;

  return (
    <section className="mission-creator" aria-labelledby="creator-title">
      <div className="section-header">
        <Landmark size={18} className="icon-indigo" />
        <h2 id="creator-title">Research Setup</h2>
      </div>

      <p className="creator-subtitle">
        Create a research mission, fund it with XLM, and pay agents only for verified evidence.
      </p>

      <div className="field-group">
        <label className="input-label">
          <span>Research Question</span>
          <textarea
            value={state.question}
            onChange={(event) => onQuestionChange(event.target.value)}
            placeholder="Type your research question here."
            disabled={state.phase !== "draft"}
            rows={4}
            aria-label="Research question"
          />
        </label>

        <div className="form-row">
          <label className="input-label">
            <span>Budget (XLM)</span>
            <input
              type="number"
              min="1"
              step="1"
              value={state.budgetXlm}
              onChange={(event) => onBudgetChange(Number(event.target.value))}
              disabled={state.phase !== "draft"}
            />
          </label>

          <label className="input-label">
            <span>Research Depth</span>
            <select
              value={state.depth}
              onChange={(event) => onDepthChange(event.target.value as MissionState["depth"])}
              disabled={state.phase !== "draft"}
            >
              <option value="rapid">Rapid Scan</option>
              <option value="standard">Standard Swarm</option>
              <option value="deep">Deep Review</option>
            </select>
          </label>

          <label className="input-label">
            <span>Format</span>
            <select
              value={state.outputType}
              onChange={(event) => onOutputTypeChange(event.target.value as MissionState["outputType"])}
              disabled={state.phase !== "draft"}
            >
              <option value="brief">Decision Brief</option>
              <option value="technical">Technical Memo</option>
              <option value="board">Board Report</option>
            </select>
          </label>
        </div>
      </div>

      {state.phase === "draft" && (
        <button className="btn btn-primary" onClick={onCreateMission} disabled={!canCreate}>
          Create Research Mission
        </button>
      )}
    </section>
  );
}
