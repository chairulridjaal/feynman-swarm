import { Cpu } from "lucide-react";
import type { AgentNode, EvidenceCard, MissionPhase } from "../types";
import { formatXlm } from "../lib/hash";

interface AgentStatusGridProps {
  agents: AgentNode[];
  evidence: EvidenceCard[];
  phase: MissionPhase;
}

const statusText: Record<AgentNode["status"], string> = {
  idle: "Idle",
  working: "Active Research",
  submitted: "Artifact Submitted",
  verified: "Claims Verified",
  paid: "Payout Released",
  rejected: "Artifact Rejected"
};

export function AgentStatusGrid({ agents, evidence, phase }: AgentStatusGridProps) {
  const getProgress = (status: AgentNode["status"]) => {
    switch (status) {
      case "idle":
        return 0;
      case "working":
        return 50;
      case "submitted":
        return 85;
      case "verified":
      case "paid":
      case "rejected":
        return 100;
      default:
        return 0;
    }
  };

  const getEarnedXlm = (agentId: string) => {
    return evidence
      .filter((card) => card.agentId === agentId && (card.status === "approved" || card.status === "paid"))
      .reduce((sum, card) => sum + card.proposedRewardXlm, 0);
  };

  return (
    <section className="agent-status-section" aria-label="AI Swarm Operations">
      <div className="section-header-row">
        <div className="section-header">
          <Cpu size={18} className="icon-indigo" />
          <h2>AI Research Agents</h2>
        </div>
        <span className="phase-badge">{phase}</span>
      </div>

      <div className="agent-grid">
        {agents.map((agent) => {
          const progress = getProgress(agent.status);
          const earned = getEarnedXlm(agent.id);
          const isWorking = agent.status === "working";

          return (
            <article key={agent.id} className={`agent-card status-${agent.status}`}>
              <div className="agent-card-header">
                <div>
                  <h3 className="agent-name">{agent.name}</h3>
                  <span className="agent-role">{agent.role}</span>
                </div>
                <span className={`agent-badge badge-${agent.status}`}>{statusText[agent.status]}</span>
              </div>

              <div className="agent-card-body">
                <div className="agent-task-line">
                  <span className="label">Current Task</span>
                  <p className="task-desc">{agent.status === "idle" ? "Awaiting mission start." : agent.focus}</p>
                </div>

                <div className="agent-earnings-line">
                  <span>Earned</span>
                  <strong className="font-mono text-indigo">{earned > 0 ? formatXlm(earned) : "0.0 XLM"}</strong>
                </div>

                {agent.status !== "idle" && (
                  <div className="progress-container">
                    <div className="progress-bar-track">
                      <div className={`progress-bar-fill ${isWorking ? "pulsing" : ""}`} style={{ width: `${progress}%` }} />
                    </div>
                    <span className="progress-label font-mono">{progress}%</span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
