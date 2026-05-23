import type { EvidenceCard, MissionState } from "../types";

export interface LiveAiCitation {
  title: string;
  url: string;
  note: string;
}

export interface LiveAiResult {
  executiveSummary: string;
  recommendation: string;
  confidence: number;
  citations: LiveAiCitation[];
  rejectedClaims: string[];
  paymentNotes: string[];
}

export interface LiveAiResponse {
  mode: "live";
  provider: string;
  model: string;
  receivedAt: string;
  rawText: string;
  result: LiveAiResult;
}

export async function requestLiveResearch(state: MissionState): Promise<LiveAiResponse> {
  const apiUrl = import.meta.env.VITE_AI_API_URL || "http://127.0.0.1:8787";
  const evidence = state.evidence.map((card: EvidenceCard) => ({
    id: card.id,
    agentName: card.agentName,
    task: card.task,
    claim: card.claim,
    source: card.source,
    confidence: card.confidence,
    score: card.score,
    proposedRewardXlm: card.proposedRewardXlm,
    status: card.status
  }));

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/live-research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: state.question,
      budgetXlm: state.budgetXlm,
      depth: state.depth,
      outputType: state.outputType,
      evidence
    })
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error || "Live AI request failed.");
  }

  return body as LiveAiResponse;
}
