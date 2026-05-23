import type { AgentNode, EvidenceCard, FinalReportModel, MissionState } from "../types";
import { deterministicHash } from "../lib/hash";
import { buildInvoice } from "../lib/invoiceMath";

export const defaultQuestion =
  "What sustainability project should a rural Indonesian school prioritize: rooftop solar, smart irrigation, or rainwater harvesting?";

export const demoAgents: AgentNode[] = [
  {
    id: "planner",
    name: "Planner",
    role: "Mission planner",
    wallet: "GDSK...PLANR",
    status: "idle",
    focus: "Breaks the question into verifiable subtasks.",
    x: 50,
    y: 14
  },
  {
    id: "paper-scout",
    name: "Paper Scout",
    role: "Academic evidence",
    wallet: "GBHX...PAPER",
    status: "idle",
    focus: "Finds technical evidence on solar and water systems.",
    x: 22,
    y: 34
  },
  {
    id: "web-scout",
    name: "Web Scout",
    role: "Deployment examples",
    wallet: "GCGT...WEB01",
    status: "idle",
    focus: "Checks practical rural school deployment examples.",
    x: 78,
    y: 34
  },
  {
    id: "repo-scout",
    name: "Repo Scout",
    role: "Open-source hardware",
    wallet: "GBOF...REPOS",
    status: "idle",
    focus: "Finds maintainable kits and monitoring tools.",
    x: 28,
    y: 70
  },
  {
    id: "verifier",
    name: "Verifier",
    role: "Evidence referee",
    wallet: "GDVX...VERIFY",
    status: "idle",
    focus: "Approves supported claims and rejects weak ones.",
    x: 50,
    y: 52
  },
  {
    id: "writer",
    name: "Writer",
    role: "Final report",
    wallet: "GDRT...WRITE",
    status: "idle",
    focus: "Converts verified artifacts into a decision memo.",
    x: 72,
    y: 72
  }
];

export const demoEvidence: EvidenceCard[] = [
  {
    id: "artifact-solar-001",
    taskId: 1,
    agentId: "paper-scout",
    agentName: "Paper Scout",
    task: "Evaluate rooftop solar for classroom continuity",
    claim: "A small rooftop PV system can cover core lighting, phone charging, and limited fan use during outages.",
    source: "IEA PVPS rural electrification guidance and Indonesian solar irradiation norms",
    confidence: 0.84,
    score: 90,
    artifactHash: deterministicHash("solar-core-lighting"),
    artifactUri: "ipfs://feynman-swarm/solar-core-lighting",
    proposedRewardXlm: 4.8,
    status: "queued",
    verifierNote: "Strong fit for outages, but maintenance training is required."
  },
  {
    id: "artifact-rain-001",
    taskId: 2,
    agentId: "web-scout",
    agentName: "Web Scout",
    task: "Assess rainwater harvesting for sanitation and gardens",
    claim: "Rainwater harvesting has the fastest operational payoff when water supply is seasonal or expensive.",
    source: "UNICEF WASH school guidance and Indonesian school sanitation examples",
    confidence: 0.88,
    score: 93,
    artifactHash: deterministicHash("rainwater-wash-garden"),
    artifactUri: "ipfs://feynman-swarm/rainwater-wash-garden",
    proposedRewardXlm: 3.9,
    status: "queued",
    verifierNote: "Best first project if the school has roof catchment and basic gutter maintenance."
  },
  {
    id: "artifact-irrigation-001",
    taskId: 3,
    agentId: "repo-scout",
    agentName: "Repo Scout",
    task: "Check smart irrigation as a teachable open-source system",
    claim: "Smart irrigation is educationally valuable, but it should follow rainwater storage rather than lead the budget.",
    source: "Open-source Arduino soil-moisture kits and school garden maintenance references",
    confidence: 0.78,
    score: 81,
    artifactHash: deterministicHash("smart-irrigation-open-hardware"),
    artifactUri: "ipfs://feynman-swarm/smart-irrigation-open-hardware",
    proposedRewardXlm: 3.2,
    status: "queued",
    verifierNote: "Approved as a phase-two add-on, not the first infrastructure spend."
  },
  {
    id: "artifact-uncertain-001",
    taskId: 4,
    agentId: "repo-scout",
    agentName: "Repo Scout",
    task: "Verify local groundwater borehole viability",
    claim: "Drilling a deep borehole will solve all school water needs permanently.",
    source: "Regional geological report snapshot",
    confidence: 0.58,
    score: 64,
    artifactHash: deterministicHash("borehole-uncertainty"),
    artifactUri: "ipfs://feynman-swarm/borehole-uncertainty",
    proposedRewardXlm: 2.8,
    status: "queued",
    verifierNote: "Uncertain: regional tables lack local village-level topography, and borehole drilling exceeds the core school budget.",
    rejectedReason: "High geological uncertainty and budget-cap violation."
  },
  {
    id: "artifact-weak-001",
    taskId: 5,
    agentId: "web-scout",
    agentName: "Web Scout",
    task: "Validate claim that solar always beats water projects",
    claim: "Solar should always be prioritized because it is more innovative than water infrastructure.",
    source: "Uncited vendor blog summary",
    confidence: 0.52,
    score: 46,
    artifactHash: deterministicHash("weak-solar-always-first"),
    artifactUri: "ipfs://feynman-swarm/rejected-solar-always-first",
    proposedRewardXlm: 2.5,
    status: "queued",
    verifierNote: "Rejected: unsupported absolute claim and weak source quality.",
    rejectedReason: "Innovation is not an outcome metric; local water scarcity changes the priority."
  },
  {
    id: "artifact-writer-001",
    taskId: 6,
    agentId: "writer",
    agentName: "Writer",
    task: "Synthesize the decision memo",
    claim: "Prioritize rainwater harvesting first, design the roof and tank layout to support later solar and irrigation phases.",
    source: "Synthesis of approved solar, rainwater, and open hardware artifacts",
    confidence: 0.86,
    score: 88,
    artifactHash: deterministicHash("final-synthesis-rainwater-first"),
    artifactUri: "ipfs://feynman-swarm/final-synthesis-rainwater-first",
    proposedRewardXlm: 4.2,
    status: "queued",
    verifierNote: "Approved because it preserves optionality and matches operational constraints."
  }
];

export function buildFinalReport(evidence: EvidenceCard[], budgetXlm: number): FinalReportModel {
  const invoice = buildInvoice(budgetXlm, evidence);
  const accepted = evidence.filter((card) => card.status === "paid" || card.status === "approved");
  const rejected = evidence.filter((card) => card.status === "rejected");

  return {
    executiveSummary:
      "Based on swarm analysis, we recommend immediate funding of rainwater harvesting as the foundational school project. Small-scale rooftop solar lighting is supported as a secondary resilience upgrade, while high-cost options like deep groundwater drilling are rejected due to geological uncertainty and budget constraints.",
    recommendation:
      "Allocate primary budget to install a gravity-fed rainwater harvesting system for school sanitation and garden irrigation. Direct any secondary funding to a small rooftop solar battery pack for evening classroom lighting. Postpone borehole drilling indefinitely and delay smart irrigation sensors until rainwater storage is operational.",
    confidence: accepted.length >= 4 ? 0.89 : 0.72,
    evidenceRows: evidence.map((card) => ({
      claim: card.claim,
      source: card.source,
      status: card.status,
      costXlm: card.status === "paid" || card.status === "approved" ? card.proposedRewardXlm : 0
    })),
    rejectedClaims: rejected.map((card) => `${card.claim} — Rejected: ${card.rejectedReason || "Weak evidence."}`).concat(
      invoice.acceptedClaims === 0 ? ["No claims have been accepted yet."] : []
    )
  };
}

export function createInitialState(): MissionState {
  const budgetXlm = 24;
  const evidence = demoEvidence.map((card) => ({ ...card }));

  return {
    question: defaultQuestion,
    budgetXlm,
    depth: "standard",
    outputType: "technical",
    phase: "draft",
    tick: 0,
    agents: demoAgents.map((agent) => ({ ...agent })),
    evidence,
    invoice: buildInvoice(budgetXlm, evidence),
    report: buildFinalReport(evidence, budgetXlm),
    wallet: {
      mode: "unknown",
      address: "",
      network: "TESTNET",
      networkPassphrase: "Test SDF Network ; September 2015",
      rpcUrl: "https://soroban-testnet.stellar.org",
      balanceXlm: 100,
      message: "Wallet not connected."
    },
    ledger: {
      mode: "mock_ledger",
      contractId: import.meta.env.VITE_FEYNMAN_SWARM_CONTRACT_ID ?? "",
      runId: null,
      fundedXlm: 0,
      paidXlm: 0,
      refundedXlm: 0,
      pendingIntentIds: [],
      message: "Demo ledger is ready."
    },
    eventLog: ["Mission console initialized with deterministic seed rural-id-school-sustainability-v1."]
  };
}
