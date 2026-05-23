import { buildFinalReport } from "../data/demoMission";
import { buildInvoice, roundXlm } from "./invoiceMath";
import type { AgentNode, EvidenceCard, MissionAction, MissionState } from "../types";

const submissionOrder = [
  "artifact-solar-001",
  "artifact-rain-001",
  "artifact-irrigation-001",
  "artifact-uncertain-001",
  "artifact-weak-001",
  "artifact-writer-001"
];

export function missionReducer(state: MissionState, action: MissionAction): MissionState {
  switch (action.type) {
    case "set_question":
      return { ...state, question: action.question };
    case "set_budget":
      return recalculate({ ...state, budgetXlm: action.budgetXlm });
    case "set_depth":
      return { ...state, depth: action.depth };
    case "set_output_type":
      return { ...state, outputType: action.outputType };
    case "create_mission":
      return {
        ...state,
        phase: "created",
        ledger: { ...state.ledger, runId: 1, message: "Run 1 created in the demo ledger." },
        eventLog: prependLog(state, "Research mission created. Topic hash stored, long text kept off-chain.")
      };
    case "set_wallet":
      return {
        ...state,
        wallet: action.wallet,
        eventLog: prependLog(
          state,
          action.wallet.mode === "connected"
            ? `Freighter connected on ${action.wallet.network}.`
            : "Demo wallet connected with testnet-style balance."
        )
      };
    case "fund_mission":
      return {
        ...state,
        phase: "funded",
        wallet: {
          ...state.wallet,
          balanceXlm: roundXlm(Math.max(0, state.wallet.balanceXlm - state.budgetXlm)),
          message: `${state.budgetXlm} XLM committed to the mission.`
        },
        ledger: {
          ...state.ledger,
          fundedXlm: state.budgetXlm,
          message:
            state.ledger.mode === "soroban"
              ? "Funding intent prepared for Soroban submission."
              : "Funding confirmed in mock ledger."
        },
        eventLog: prependLog(state, `Mission funded with ${state.budgetXlm} XLM.`)
      };
    case "start_swarm":
      return {
        ...state,
        phase: "running",
        tick: 0,
        agents: state.agents.map((agent) => ({
          ...agent,
          status: agent.id === "verifier" ? "idle" : "working"
        })),
        eventLog: prependLog(state, "Swarm started. Agents are collecting evidence artifacts.")
      };
    case "advance_swarm":
      return advanceSwarm(state);
    case "run_verifier":
      return runVerifier(state);
    case "approve_artifact":
      return setArtifactDecision(state, action.artifactId, "paid");
    case "reject_artifact":
      return setArtifactDecision(state, action.artifactId, "rejected");
    case "finalize_report":
      return recalculate({
        ...state,
        phase: "finalized",
        agents: state.agents.map((agent) => ({
          ...agent,
          status:
            agent.id === "planner" || agent.id === "verifier" || agent.id === "writer"
              ? "verified"
              : agent.status === "submitted"
                ? "verified"
                : agent.status
        })),
        ledger: {
          ...state.ledger,
          paidXlm: buildInvoice(state.budgetXlm, state.evidence).spentXlm,
          message: "Final report hash and URI recorded in the demo ledger."
        },
        eventLog: prependLog(state, "Final report generated with citations, rejected claims, and invoice.")
      });
    case "refund_unused": {
      const invoice = buildInvoice(state.budgetXlm, state.evidence);
      return {
        ...state,
        ledger: {
          ...state.ledger,
          refundedXlm: invoice.refundedXlm,
          message: `${invoice.refundedXlm} XLM unused budget refunded.`
        },
        wallet: {
          ...state.wallet,
          balanceXlm: roundXlm(state.wallet.balanceXlm + invoice.refundedXlm),
          message: "Unused budget returned."
        },
        eventLog: prependLog(state, `Refunded ${invoice.refundedXlm} XLM of unused research budget.`)
      };
    }
    case "reset_demo":
      return state;
    default:
      return state;
  }
}

function advanceSwarm(state: MissionState): MissionState {
  if (state.phase !== "running") {
    return state;
  }

  const nextTick = state.tick + 1;
  const artifactId = submissionOrder[state.tick];
  const evidence = state.evidence.map((card) =>
    card.id === artifactId ? { ...card, status: "submitted" as const } : card
  );
  const submittedAgentIds = new Set(evidence.filter((card) => card.status === "submitted").map((card) => card.agentId));
  const allSubmitted = nextTick >= submissionOrder.length;

  return recalculate({
    ...state,
    tick: nextTick,
    phase: allSubmitted ? "verifying" : "running",
    agents: updateAgentStatusesForSubmissions(state.agents, submittedAgentIds, allSubmitted),
    evidence,
    eventLog: prependLog(
      state,
      artifactId
        ? `Artifact ${artifactId} submitted for verifier review.`
        : "All evidence artifacts are queued for verification."
    )
  });
}

function runVerifier(state: MissionState): MissionState {
  if (state.phase !== "verifying") {
    return state;
  }

  const evidence = state.evidence.map((card) => {
    if (card.status !== "submitted") {
      return card;
    }

    if (card.score >= 80 && card.confidence >= 0.75) {
      return { ...card, status: "paid" as const };
    }

    return { ...card, status: "rejected" as const };
  });

  const paidAgentIds = new Set(evidence.filter((card) => card.status === "paid").map((card) => card.agentId));
  const rejectedAgentIds = new Set(evidence.filter((card) => card.status === "rejected").map((card) => card.agentId));
  const invoice = buildInvoice(state.budgetXlm, evidence);

  return recalculate({
    ...state,
    phase: "finalized",
    evidence,
    agents: state.agents.map((agent) => {
      if (agent.id === "verifier") {
        return { ...agent, status: "verified" };
      }
      if (agent.id === "writer") {
        return { ...agent, status: "verified" };
      }
      if (paidAgentIds.has(agent.id)) {
        return { ...agent, status: "paid" };
      }
      if (rejectedAgentIds.has(agent.id)) {
        return { ...agent, status: "rejected" };
      }
      return agent;
    }),
    ledger: {
      ...state.ledger,
      paidXlm: invoice.spentXlm,
      pendingIntentIds: evidence
        .filter((card) => card.status === "paid")
        .map((card) => `${card.id}:${card.agentId}:${card.proposedRewardXlm}:${state.ledger.contractId || "mock"}`),
      message: `${invoice.spentXlm} XLM released for accepted evidence; final report URI recorded.`
    },
    eventLog: prependLog(state, "Verifier sweep complete. Accepted artifacts were paid, weak claims were rejected, and the final report unlocked.")
  });
}

function setArtifactDecision(
  state: MissionState,
  artifactId: string,
  decision: "paid" | "rejected"
): MissionState {
  const evidence = state.evidence.map((card) =>
    card.id === artifactId && (card.status === "submitted" || card.status === "approved" || card.status === "rejected")
      ? { ...card, status: decision }
      : card
  );
  return recalculate({
    ...state,
    evidence,
    eventLog: prependLog(state, `${artifactId} manually marked ${decision}.`)
  });
}

function updateAgentStatusesForSubmissions(
  agents: AgentNode[],
  submittedAgentIds: Set<string>,
  allSubmitted: boolean
): AgentNode[] {
  return agents.map((agent) => {
    if (agent.id === "verifier") {
      return { ...agent, status: allSubmitted ? "working" : "idle" };
    }

    if (submittedAgentIds.has(agent.id)) {
      return { ...agent, status: "submitted" };
    }

    return { ...agent, status: agent.status === "idle" ? "working" : agent.status };
  });
}

function recalculate(state: MissionState): MissionState {
  return {
    ...state,
    invoice: buildInvoice(state.budgetXlm, state.evidence),
    report: buildFinalReport(state.evidence, state.budgetXlm)
  };
}

function prependLog(state: MissionState, message: string): string[] {
  return [message, ...state.eventLog].slice(0, 8);
}
