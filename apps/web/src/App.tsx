import { useEffect, useReducer, useState } from "react";
import { createInitialState } from "./data/demoMission";
import { missionReducer } from "./lib/swarmEngine";
import { connectFreighterWallet, getDemoWallet } from "./lib/stellar";
import { EvidenceBoard } from "./components/EvidenceBoard";
import { FinalReport } from "./components/FinalReport";
import { ResearchInvoice } from "./components/ResearchInvoice";
import { MissionCreator } from "./components/MissionCreator";
import { WalletPanel } from "./components/WalletPanel";
import { AgentStatusGrid } from "./components/AgentStatusGrid";
import { MissionStepper } from "./components/MissionStepper";
import { LiveAiPanel } from "./components/LiveAiPanel";
import { requestLiveResearch } from "./lib/liveAi";
import type { LiveAiResponse } from "./lib/liveAi";
import { Bot, ChevronDown } from "lucide-react";

export default function App() {
  const [state, dispatch] = useReducer(missionReducer, undefined, createInitialState);
  const [activeStep, setActiveStep] = useState<number>(1);

  // Live AI Research State
  const [liveAi, setLiveAi] = useState<LiveAiResponse | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string>("");
  const [reportTab, setReportTab] = useState<"sandbox" | "live">("sandbox");

  async function handleRunLiveAi() {
    setIsLiveLoading(true);
    setLiveError("");
    try {
      const res = await requestLiveResearch(state);
      setLiveAi(res);
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : "Live AI Pass failed.");
    } finally {
      setIsLiveLoading(false);
    }
  }

  // Map simulated backend phases directly to unlocked navigation steps
  let maxStep = 1;
  if (state.phase === "created") {
    maxStep = 2;
  } else if (["funded", "running"].includes(state.phase)) {
    maxStep = 3;
  } else if (state.phase === "verifying") {
    maxStep = 4;
  } else if (state.phase === "finalized") {
    maxStep = 6; // Unlocks both Step 5 (Invoice) and Step 6 (Memo)
  }

  // Automatically lead the user to the active screen as phase updates.
  // Stay on funding after escrow is funded so the user can explicitly start the swarm.
  useEffect(() => {
    if (state.phase === "finalized") {
      setActiveStep(5); // Transition first to research invoice payouts
    } else if (state.phase === "funded") {
      setActiveStep(2);
    } else {
      setActiveStep(maxStep);
    }
  }, [state.phase, maxStep]);

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

  return (
    <main className="app-shell bg-workspace font-sans">
      <div className="workspace-container">
        
        {/* Workspace Top Header matching images */}
        <header className="workspace-header-custom font-sans">
          <div className="brand-logo-custom">
            <div className="brand-logo-circle bg-blue text-white">
              <Bot size={16} />
            </div>
            <span className="brand-name">Feynman Swarm</span>
            <button className="badge-demo-outline font-sans" onClick={() => dispatch({ type: "set_wallet", wallet: getDemoWallet() })}>
              Demo Mode
            </button>
          </div>

          <div className="header-wallet-area">
            {state.wallet.mode === "unknown" ? (
              <button className="btn-wallet-connect font-sans" onClick={handleConnectWallet}>
                <span className="wallet-icon-svg" />
                Connect Wallet
              </button>
            ) : (
              <button className="btn-wallet-connected font-sans">
                <span className="wallet-icon-svg" />
                <div className="wallet-connected-details font-sans">
                  <span className="wallet-connected-label">Connected Wallet</span>
                  <strong className="wallet-connected-addr font-mono">
                    {state.wallet.address.slice(0, 6)}...{state.wallet.address.slice(-4)}
                  </strong>
                </div>
                <span className="wallet-indicator-green" />
                <ChevronDown size={14} className="ml-8" />
              </button>
            )}
          </div>
        </header>

        {/* Global Progress Stepper at bottom in some views, top in others. 
            We place it beautifully in the flow, matching the image screens! */}
        
        <div className="workspace-body-custom mt-24">
          
          {/* RENDER ACTIVE SCREEN BASED ON STEPPER INDEX */}
          {activeStep === 1 && (
            <MissionCreator
              state={state}
              onQuestionChange={(question) => dispatch({ type: "set_question", question })}
              onBudgetChange={(budgetXlm) => dispatch({ type: "set_budget", budgetXlm })}
              onDepthChange={(depth) => dispatch({ type: "set_depth", depth })}
              onOutputTypeChange={(outputType) => dispatch({ type: "set_output_type", outputType })}
              onCreateMission={() => dispatch({ type: "create_mission" })}
            />
          )}

          {activeStep === 2 && (
            <WalletPanel
              wallet={state.wallet}
              ledger={state.ledger}
              phase={state.phase}
              question={state.question}
              budgetXlm={state.budgetXlm}
              onConnectWallet={handleConnectWallet}
              onDemoWallet={() => dispatch({ type: "set_wallet", wallet: getDemoWallet() })}
              onFundMission={() => dispatch({ type: "fund_mission" })}
              onStartSwarm={() => dispatch({ type: "start_swarm" })}
            />
          )}

          {activeStep === 3 && (
            <AgentStatusGrid
              agents={state.agents}
              evidence={state.evidence}
              phase={state.phase}
              budgetXlm={state.budgetXlm}
            />
          )}

          {activeStep === 4 && (
            <EvidenceBoard
              evidence={state.evidence}
              phase={state.phase}
              onAdvance={() => dispatch({ type: "advance_swarm" })}
              onRunVerifier={() => dispatch({ type: "run_verifier" })}
              onApprove={(artifactId) => dispatch({ type: "approve_artifact", artifactId })}
              onReject={(artifactId) => dispatch({ type: "reject_artifact", artifactId })}
            />
          )}

          {activeStep === 5 && (
            <ResearchInvoice
              invoice={state.invoice}
              canRefund={state.phase === "finalized" && state.ledger.refundedXlm === 0}
              onRefund={() => dispatch({ type: "refund_unused" })}
            />
          )}

          {activeStep === 6 && (
            <div className="report-step-container fade-in">
              <div className="report-tabs-bar">
                <button
                  className={`tab-btn ${reportTab === "sandbox" ? "active" : ""}`}
                  onClick={() => setReportTab("sandbox")}
                >
                  Sandbox Demo Memo
                </button>
                <button
                  className={`tab-btn ${reportTab === "live" ? "active" : ""}`}
                  onClick={() => setReportTab("live")}
                >
                  Live GPT Research Pass
                </button>
              </div>

              {reportTab === "sandbox" ? (
                <FinalReport
                  report={state.report}
                  invoice={state.invoice}
                  phase={state.phase}
                  onFinalize={() => dispatch({ type: "finalize_report" })}
                />
              ) : (
                <LiveAiPanel
                  state={state}
                  liveAi={liveAi}
                  isLoading={isLiveLoading}
                  error={liveError}
                  onRun={handleRunLiveAi}
                />
              )}
            </div>
          )}

        </div>

        {/* Global Progress Stepper at the bottom of the workspace body */}
        <footer className="workspace-footer-custom mt-24">
          <MissionStepper
            activeStep={activeStep}
            maxStep={maxStep}
            onStepClick={(step) => setActiveStep(step)}
          />
        </footer>

      </div>
    </main>
  );
}
