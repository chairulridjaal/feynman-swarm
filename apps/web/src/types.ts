export type MissionPhase =
  | "draft"
  | "created"
  | "funded"
  | "running"
  | "verifying"
  | "finalized";

export type AgentStatus =
  | "idle"
  | "working"
  | "submitted"
  | "verified"
  | "paid"
  | "rejected";

export type EvidenceStatus = "queued" | "submitted" | "approved" | "paid" | "rejected";

export type WalletMode = "unknown" | "mock" | "connected";

export type ContractMode = "mock_ledger" | "soroban";

export interface AgentNode {
  id: string;
  name: string;
  role: string;
  wallet: string;
  status: AgentStatus;
  focus: string;
  x: number;
  y: number;
}

export interface EvidenceCard {
  id: string;
  taskId: number;
  agentId: string;
  agentName: string;
  task: string;
  claim: string;
  source: string;
  confidence: number;
  score: number;
  artifactHash: string;
  artifactUri: string;
  proposedRewardXlm: number;
  status: EvidenceStatus;
  verifierNote: string;
  rejectedReason?: string;
}

export interface InvoiceLine {
  agentName: string;
  rewardXlm: number;
  status: EvidenceStatus;
  artifactId: string;
}

export interface ResearchInvoice {
  budgetXlm: number;
  spentXlm: number;
  refundedXlm: number;
  acceptedClaims: number;
  rejectedClaims: number;
  costPerAcceptedClaim: number;
  lines: InvoiceLine[];
}

export interface FinalReportModel {
  executiveSummary: string;
  recommendation: string;
  confidence: number;
  evidenceRows: Array<{
    claim: string;
    source: string;
    status: EvidenceStatus;
    costXlm: number;
  }>;
  rejectedClaims: string[];
}

export interface WalletState {
  mode: WalletMode;
  address: string;
  network: string;
  networkPassphrase: string;
  rpcUrl: string;
  balanceXlm: number;
  message: string;
}

export interface LedgerState {
  mode: ContractMode;
  contractId: string;
  runId: number | null;
  fundedXlm: number;
  paidXlm: number;
  refundedXlm: number;
  pendingIntentIds: string[];
  message: string;
}

export interface MissionState {
  question: string;
  budgetXlm: number;
  depth: "rapid" | "standard" | "deep";
  outputType: "brief" | "technical" | "board";
  phase: MissionPhase;
  tick: number;
  agents: AgentNode[];
  evidence: EvidenceCard[];
  invoice: ResearchInvoice;
  report: FinalReportModel;
  wallet: WalletState;
  ledger: LedgerState;
  eventLog: string[];
}

export type MissionAction =
  | { type: "set_question"; question: string }
  | { type: "set_budget"; budgetXlm: number }
  | { type: "set_depth"; depth: MissionState["depth"] }
  | { type: "set_output_type"; outputType: MissionState["outputType"] }
  | { type: "create_mission" }
  | { type: "set_wallet"; wallet: WalletState }
  | { type: "fund_mission" }
  | { type: "start_swarm" }
  | { type: "advance_swarm" }
  | { type: "run_verifier" }
  | { type: "approve_artifact"; artifactId: string }
  | { type: "reject_artifact"; artifactId: string }
  | { type: "finalize_report" }
  | { type: "refund_unused" }
  | { type: "reset_demo" };
