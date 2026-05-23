import type { EvidenceCard, ResearchInvoice } from "../types";

export function buildInvoice(budgetXlm: number, evidence: EvidenceCard[]): ResearchInvoice {
  const paid = evidence.filter((card) => card.status === "paid" || card.status === "approved");
  const rejected = evidence.filter((card) => card.status === "rejected");
  const spentXlm = roundXlm(paid.reduce((sum, card) => sum + card.proposedRewardXlm, 0));
  const refundedXlm = roundXlm(Math.max(0, budgetXlm - spentXlm));
  const acceptedClaims = paid.length;

  return {
    budgetXlm,
    spentXlm,
    refundedXlm,
    acceptedClaims,
    rejectedClaims: rejected.length,
    costPerAcceptedClaim: acceptedClaims === 0 ? 0 : roundXlm(spentXlm / acceptedClaims),
    lines: evidence.map((card) => ({
      agentName: card.agentName,
      rewardXlm: card.status === "paid" || card.status === "approved" ? card.proposedRewardXlm : 0,
      status: card.status,
      artifactId: card.id
    }))
  };
}

export function roundXlm(value: number): number {
  return Math.round(value * 100) / 100;
}
