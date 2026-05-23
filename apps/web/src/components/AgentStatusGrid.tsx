import { 
  ListTodo, FileText, Globe, GitBranch, ShieldAlert, Pencil, Wallet, BarChart3, CheckCircle2, Clock 
} from "lucide-react";
import type { AgentNode, EvidenceCard, MissionPhase } from "../types";
import { formatXlm } from "../lib/hash";

interface AgentStatusGridProps {
  agents: AgentNode[];
  evidence: EvidenceCard[];
  phase: MissionPhase;
}

const statusText: Record<AgentNode["status"], string> = {
  idle: "Idle",
  working: "Working",
  submitted: "Working",
  verified: "Working",
  paid: "Working",
  rejected: "Working",
};

const agentIcons: Record<string, any> = {
  planner: ListTodo,
  "paper-scout": FileText,
  "web-scout": Globe,
  "repo-scout": GitBranch,
  verifier: ShieldAlert,
  writer: Pencil,
};

export function AgentStatusGrid({ agents, evidence, phase }: AgentStatusGridProps) {
  // Progress calculations
  const getProgress = (status: AgentNode["status"], id: string) => {
    if (status === "idle") return 0;
    if (status === "working") {
      if (id === "planner") return 85;
      if (id === "paper-scout") return 60;
      if (id === "web-scout") return 40;
      return 0;
    }
    return 100;
  };

  // Status mapping
  const getAgentStatusCustom = (status: AgentNode["status"], id: string): "working" | "queued" | "ready" | "working-green" => {
    if (status === "idle") return "queued";
    if (status === "working") {
      if (["planner", "paper-scout", "web-scout"].includes(id)) return "working-green";
      return "queued";
    }
    if (id === "writer") return "ready";
    return "working-green";
  };

  return (
    <div className="agents-workspace fade-in">
      
      {/* Title Block with Right Side Stats Cards */}
      <div className="agents-title-row">
        <div className="title-block">
          <h1>Agents at work</h1>
          <p className="subtitle">
            The swarm is gathering evidence across papers, the web, and open-source sources.
          </p>
        </div>
        
        <div className="stat-cards-row">
          {/* Stat Card 1 */}
          <div className="mini-stat-card">
            <div className="mini-stat-icon text-indigo">
              <Wallet size={16} />
            </div>
            <div className="mini-stat-content">
              <span className="stat-label">Total budget</span>
              <strong className="stat-val font-mono">100 XLM</strong>
              <span className="stat-subtext font-mono">≈ $33.60 USD</span>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="mini-stat-card">
            <div className="mini-stat-icon text-blue">
              <BarChart3 size={16} />
            </div>
            <div className="mini-stat-content">
              <span className="stat-label">Status</span>
              <strong className="stat-val text-blue font-mono">
                <span className="status-indicator-dot bg-blue" />
                Active
              </strong>
              <span className="stat-subtext">Swarm running</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="agents-layout-grid">
        
        {/* Left Column: Grid of 6 Agents */}
        <div className="agents-main-column">
          <div className="agents-cards-grid">
            {agents.map((agent) => {
              const Icon = agentIcons[agent.id] || Globe;
              const customStatus = getAgentStatusCustom(agent.status, agent.id);
              const progress = getProgress(agent.status, agent.id);

              return (
                <div key={agent.id} className="agent-box">
                  <div className="agent-box-header">
                    <div className="agent-title-group">
                      <div className={`agent-icon-circle bg-blue-light text-blue`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <h3 className="agent-title-text">{agent.name}</h3>
                        <span className="agent-status-label-custom">
                          <span className={`status-dot-custom bg-${customStatus === "working-green" ? "emerald" : customStatus === "ready" ? "blue" : "amber"}`} />
                          {customStatus === "working-green" ? "Working" : customStatus === "ready" ? "Ready" : "Queued"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="agent-desc-text">
                    {agent.id === "planner" && "Decomposing the question and building the research plan."}
                    {agent.id === "paper-scout" && "Searching academic papers and extracting key findings."}
                    {agent.id === "web-scout" && "Scanning the web for reports and credible sources."}
                    {agent.id === "repo-scout" && "Finding relevant open-source repositories and data."}
                    {agent.id === "verifier" && "Verifying claims and checking source credibility."}
                    {agent.id === "writer" && "Ready to draft the comparative research report."}
                  </p>

                  <div className="agent-progress-track">
                    <div className="progress-bar-fill-blue" style={{ width: `${progress}%` }} />
                    <span className="progress-pct font-mono">{progress}%</span>
                  </div>

                  <div className="agent-earned-footer font-mono">
                    {agent.id === "planner" && "Earned 12 XL"}
                    {agent.id === "paper-scout" && "Earned 18 XL"}
                    {agent.id === "web-scout" && "Earned 9 XL"}
                    {agent.id === "repo-scout" && "Pending 8 XL"}
                    {agent.id === "verifier" && "Pending 10 XL"}
                    {agent.id === "writer" && "Pending 12 XL"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Mission Activity timeline */}
        <aside className="agents-sidebar-column">
          <section className="setup-main-card">
            <div className="card-inner-padding">
              <h2 className="setup-section-title">Mission activity</h2>

              <div className="activity-timeline-list font-sans">
                {/* Timeline Item 1 */}
                <div className="activity-item">
                  <div className="activity-icon-node bg-green-light text-green border-green-light">
                    <CheckCircle2 size={12} />
                  </div>
                  <div className="activity-item-content">
                    <div className="activity-item-top font-sans">
                      <strong className="activity-text">Planner decomposed the question</strong>
                      <span className="activity-time font-mono">9:41 AM</span>
                    </div>
                    <p className="activity-details">Defined 5 research angles and success criteria.</p>
                  </div>
                  <div className="activity-item-line" />
                </div>

                {/* Timeline Item 2 */}
                <div className="activity-item">
                  <div className="activity-icon-node bg-blue-light text-blue">
                    <FileText size={12} />
                  </div>
                  <div className="activity-item-content">
                    <div className="activity-item-top font-sans">
                      <strong className="activity-text">Paper Scout submitted 2 evidence artifacts</strong>
                      <span className="activity-time font-mono">9:45 AM</span>
                    </div>
                    <p className="activity-details">Added a systematic review and case study.</p>
                  </div>
                  <div className="activity-item-line" />
                </div>

                {/* Timeline Item 3 */}
                <div className="activity-item">
                  <div className="activity-icon-node bg-blue-light text-blue">
                    <Globe size={12} />
                  </div>
                  <div className="activity-item-content">
                    <div className="activity-item-top font-sans">
                      <strong className="activity-text">Web Scout found 8 relevant sources</strong>
                      <span className="activity-time font-mono">9:47 AM</span>
                    </div>
                    <p className="activity-details">Includes government reports and NGO publications.</p>
                  </div>
                  <div className="activity-item-line" />
                </div>

                {/* Timeline Item 4 */}
                <div className="activity-item">
                  <div className="activity-icon-node bg-grey-light text-dark">
                    <Clock size={12} />
                  </div>
                  <div className="activity-item-content">
                    <div className="activity-item-top font-sans">
                      <strong className="activity-text">Verifier is waiting for new claims</strong>
                      <span className="activity-time font-mono">9:48 AM</span>
                    </div>
                    <p className="activity-details">Needs more content from scouts to continue.</p>
                  </div>
                  <div className="activity-item-line" />
                </div>

                {/* Timeline Item 5 */}
                <div className="activity-item">
                  <div className="activity-icon-node bg-grey-light text-dark">
                    <Pencil size={12} />
                  </div>
                  <div className="activity-item-content">
                    <div className="activity-item-top font-sans">
                      <strong className="activity-text">Writer is ready</strong>
                      <span className="activity-time font-mono">9:48 AM</span>
                    </div>
                    <p className="activity-details">Will begin drafting once verification is complete.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
