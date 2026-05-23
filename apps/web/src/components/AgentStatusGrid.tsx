import {
  ListTodo,
  FileText,
  Globe,
  GitBranch,
  ShieldAlert,
  Pencil,
  Check,
  CircleDashed,
  ArrowRight
} from "lucide-react";
import type { AgentNode, EvidenceCard, MissionPhase } from "../types";
import { formatXlm } from "../lib/hash";

interface AgentStatusGridProps {
  agents: AgentNode[];
  evidence: EvidenceCard[];
  phase: MissionPhase;
  budgetXlm: number;
}

const agentIcons: Record<string, typeof ListTodo> = {
  planner: ListTodo,
  "paper-scout": FileText,
  "web-scout": Globe,
  "repo-scout": GitBranch,
  verifier: ShieldAlert,
  writer: Pencil
};

export function AgentStatusGrid({ agents, evidence, phase, budgetXlm }: AgentStatusGridProps) {
  const getAgentStatusCustom = (status: AgentNode["status"], id: string): "queued" | "working" | "done" => {
    if (status === "idle") return "queued";
    if (status === "working") return "working";
    if (id === "writer" && phase === "verifying") return "queued"; // Wait for verification
    if (status === "verified" || status === "submitted") return "done";
    return "working";
  };

  const getAgentReward = (agentId: string) => {
    const agentEvidence = evidence.filter((card) => card.agentId === agentId);
    const paid = agentEvidence
      .filter((card) => card.status === "paid" || card.status === "approved")
      .reduce((sum, card) => sum + card.proposedRewardXlm, 0);
    const pending = agentEvidence
      .filter((card) => card.status === "submitted" || card.status === "queued")
      .reduce((sum, card) => sum + card.proposedRewardXlm, 0);

    if (paid > 0) return formatXlm(paid);
    if (pending > 0) return `Pending`;
    return "-";
  };

  // Reorder agents for pipeline logic
  const pipelineOrder = ["planner", "paper-scout", "web-scout", "repo-scout", "verifier", "writer"];
  const orderedAgents = pipelineOrder
    .map((id) => agents.find((a) => a.id === id))
    .filter((a): a is AgentNode => a !== undefined);

  return (
    <div className="focused-wizard-container fade-in" style={{ maxWidth: '800px' }}>
      <div className="wizard-hero-block">
        <h1 className="wizard-title">Swarm Pipeline</h1>
        <p className="wizard-subtitle">
          Watch your agents decompose the task, gather evidence, verify sources, and draft the final memo in real time.
        </p>
      </div>

      <div className="pipeline-container">
        {orderedAgents.map((agent, index) => {
          const Icon = agentIcons[agent.id] || Globe;
          const customStatus = getAgentStatusCustom(agent.status, agent.id);
          const isLast = index === orderedAgents.length - 1;
          
          return (
            <div key={agent.id} className={`pipeline-node status-${customStatus}`}>
              <div className="pipeline-node-inner">
                
                <div className="node-icon-box">
                  <Icon size={18} />
                </div>
                
                <div className="node-content">
                  <span className="node-name">{agent.name}</span>
                  <span className="node-desc">{agent.focus}</span>
                </div>

                <div className="node-status-area">
                  <span className="node-reward font-mono">{getAgentReward(agent.id)}</span>
                  <div className="node-status-indicator">
                    {customStatus === "done" && <Check size={14} className="text-emerald" />}
                    {customStatus === "working" && <CircleDashed size={14} className="text-blue spin-icon" />}
                    {customStatus === "queued" && <div className="queued-dot" />}
                  </div>
                </div>

              </div>

              {!isLast && (
                <div className="pipeline-connector">
                  <div className="connector-line" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
