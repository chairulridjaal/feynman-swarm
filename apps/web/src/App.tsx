import { useEffect, useReducer, useState } from "react";
import { createInitialState } from "./data/demoMission";
import { missionReducer } from "./lib/swarmEngine";
import { connectFreighterWallet, getDemoWallet } from "./lib/stellar";
import { requestLiveResearch, type LiveAiResponse } from "./lib/liveAi";
import { EvidenceBoard } from "./components/EvidenceBoard";
import { FinalReport } from "./components/FinalReport";
import { ResearchInvoice } from "./components/ResearchInvoice";
import { MissionCreator } from "./components/MissionCreator";
import { WalletPanel } from "./components/WalletPanel";
import { TraceLog } from "./components/TraceLog";
import { AgentStatusGrid } from "./components/AgentStatusGrid";
import { MissionStepper } from "./components/MissionStepper";
import { LiveAiPanel } from "./components/LiveAiPanel";

export default function App() {
  const [state, dispatch] = useReducer(missionReducer, undefined, createInitialState);
  const [liveAi, setLiveAi] = useState<LiveAiResponse | null>(null);
  const [liveAiError, setLiveAiError] = useState("");
  const [isLiveAiLoading, setIsLiveAiLoading] = useState(false);

  useEffect(() => {
    if (state.phase !== "running") {
      return;
    }

    const timer = window.setInterval(() => {
      dispatch({ type: "advance_swarm" });
    }, 1400);

    return () => window.clearInterval(timer);
  }, [state.phase, state.tick]);

  async function handleConnectWallet() {
    const wallet = await connectFreighterWallet();
    dispatch({ type: "set_wallet", wallet });
  }

  async function handleRunLiveAi() {
    setIsLiveAiLoading(true);
    setLiveAiError("");

    try {
      const response = await requestLiveResearch(state);
      setLiveAi(response);
    } catch (error) {
      setLiveAiError(error instanceof Error ? error.message : "Live AI request failed.");
    } finally {
      setIsLiveAiLoading(false);
    }
  }

  // Determine which workspace sections are visible based on step progression
  const showCreatorAndWallet = ["draft", "created"].includes(state.phase);
  const showRunningSwarm = !["draft", "created"].includes(state.phase);

  return (
    <main className="app-shell">
      {/* Premium subtle layout grid */}
      <div className="workspace-container">
        
        {/* Navigation Bar */}
        <header className="workspace-header">
          <div className="brand-logo">
            <span className="logo-text">Feynman Swarm</span>
            <span className="logo-tagline font-mono">Verified Research Escrow</span>
          </div>
          <div className="header-status-area">
            <div className="badge-demo font-mono">SANDBOX DEV SERVER</div>
            {state.wallet.mode !== "unknown" && (
              <div className="badge-connected-wallet font-mono">
                {state.wallet.address.slice(0, 6)}...{state.wallet.address.slice(-6)}
              </div>
            )}
          </div>
        </header>

        {/* Global Progress Stepper */}
        <MissionStepper phase={state.phase} />

        {/* Main Workspace Layout */}
        <div className="workspace-body">
          
          {/* Left Column: Research Actions & Swarm Grid */}
          <div className="workspace-main-column">
            
            {showCreatorAndWallet && (
              <div className="setup-workflow-block fade-in">
                <MissionCreator
                  state={state}
                  onQuestionChange={(question) => dispatch({ type: "set_question", question })}
                  onBudgetChange={(budgetXlm) => dispatch({ type: "set_budget", budgetXlm })}
                  onDepthChange={(depth) => dispatch({ type: "set_depth", depth })}
                  onOutputTypeChange={(outputType) => dispatch({ type: "set_output_type", outputType })}
                  onCreateMission={() => dispatch({ type: "create_mission" })}
                />
                
                {state.phase === "created" && (
                  <div className="fade-in mt-18">
                    <WalletPanel
                      wallet={state.wallet}
                      ledger={state.ledger}
                      phase={state.phase}
                      budgetXlm={state.budgetXlm}
                      onConnectWallet={handleConnectWallet}
                      onDemoWallet={() => dispatch({ type: "set_wallet", wallet: getDemoWallet() })}
                      onFundMission={() => dispatch({ type: "fund_mission" })}
                      onStartSwarm={() => dispatch({ type: "start_swarm" })}
                    />
                  </div>
                )}
              </div>
            )}

            {showRunningSwarm && (
              <div className="running-workflow-block fade-in">
                <AgentStatusGrid
                  agents={state.agents}
                  evidence={state.evidence}
                  phase={state.phase}
                />
                
                <EvidenceBoard
                  evidence={state.evidence}
                  phase={state.phase}
                  onAdvance={() => dispatch({ type: "advance_swarm" })}
                  onRunVerifier={() => dispatch({ type: "run_verifier" })}
                  onApprove={(artifactId) => dispatch({ type: "approve_artifact", artifactId })}
                  onReject={(artifactId) => dispatch({ type: "reject_artifact", artifactId })}
                />

                <FinalReport
                  report={state.report}
                  phase={state.phase}
                  onFinalize={() => dispatch({ type: "finalize_report" })}
                />
              </div>
            )}

          </div>

          {/* Right Column: Receipts, Billing & Event Logging */}
          <div className="workspace-sidebar-column">
            
            {/* Show budget state or receipt depending on phase */}
            {state.phase === "draft" ? (
              <WalletPanel
                wallet={state.wallet}
                ledger={state.ledger}
                phase={state.phase}
                budgetXlm={state.budgetXlm}
                onConnectWallet={handleConnectWallet}
                onDemoWallet={() => dispatch({ type: "set_wallet", wallet: getDemoWallet() })}
                onFundMission={() => dispatch({ type: "fund_mission" })}
                onStartSwarm={() => dispatch({ type: "start_swarm" })}
              />
            ) : (
              <ResearchInvoice
                invoice={state.invoice}
                canRefund={state.phase === "finalized" && state.ledger.refundedXlm === 0}
                onRefund={() => dispatch({ type: "refund_unused" })}
              />
            )}

            <LiveAiPanel
              state={state}
              liveAi={liveAi}
              isLoading={isLiveAiLoading}
              error={liveAiError}
              onRun={handleRunLiveAi}
            />

            <TraceLog entries={state.eventLog} />

          </div>

        </div>

      </div>
    </main>
  );
}
