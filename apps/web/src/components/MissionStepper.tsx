import { Check } from "lucide-react";
import type { MissionPhase } from "../types";

interface MissionStepperProps {
  phase: MissionPhase;
}

export function MissionStepper({ phase }: MissionStepperProps) {
  const steps = [
    {
      id: "create",
      label: "Create mission",
      description: "Define question and budget",
      isCompleted: phase !== "draft",
      isActive: phase === "draft"
    },
    {
      id: "fund",
      label: "Fund with XLM",
      description: "Commit escrow budget",
      isCompleted: !["draft", "created"].includes(phase),
      isActive: phase === "created"
    },
    {
      id: "research",
      label: "Agents research",
      description: "Swarm gathers artifacts",
      isCompleted: !["draft", "created", "funded", "running"].includes(phase),
      isActive: ["funded", "running"].includes(phase)
    },
    {
      id: "verify",
      label: "Verify evidence",
      description: "Approve or reject claims",
      isCompleted: phase === "finalized",
      isActive: phase === "verifying"
    },
    {
      id: "complete",
      label: "Final report",
      description: "Invoice and refund ready",
      isCompleted: phase === "finalized",
      isActive: phase === "finalized"
    }
  ];

  return (
    <div className="mission-stepper" aria-label="Research stepper workflow">
      <div className="stepper-track">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const statusClass = step.isCompleted ? "completed" : step.isActive ? "active" : "upcoming";

          return (
            <div key={step.id} className={`stepper-step ${statusClass}`}>
              <div className="step-marker-container">
                <div className="step-circle">
                  {step.isCompleted && step.id !== "complete" ? (
                    <Check size={14} className="icon-check" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {!isLast && <div className="step-line" />}
              </div>
              <div className="step-content">
                <div className="step-label">{step.label}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
