import { Lightbulb, Wallet, Users, ShieldCheck, User, FileText, Check } from "lucide-react";

interface MissionStepperProps {
  activeStep: number;
  maxStep: number;
  onStepClick: (step: number) => void;
}

export function MissionStepper({ activeStep, maxStep, onStepClick }: MissionStepperProps) {
  const steps = [
    { id: 1, label: "Create mission", icon: Lightbulb },
    { id: 2, label: "Fund with XLM", icon: Wallet },
    { id: 3, label: "Agents research", icon: Users },
    { id: 4, label: "Verify evidence", icon: ShieldCheck },
    { id: 5, label: "Pay contributors", icon: User },
    { id: 6, label: "Final report", icon: FileText },
  ];

  return (
    <div className="mission-stepper-container" aria-label="Research stepper workflow">
      <div className="stepper-track-line" />
      <div className="stepper-track">
        {steps.map((step) => {
          const isCompleted = step.id < activeStep || step.id <= maxStep;
          const isActive = step.id === activeStep;
          const isLocked = step.id > maxStep;
          const IconComponent = step.icon;

          return (
            <button
              key={step.id}
              className={`stepper-step ${isActive ? "active" : ""} ${
                isCompleted && !isActive ? "completed" : ""
              } ${isLocked ? "locked" : ""}`}
              onClick={() => !isLocked && onStepClick(step.id)}
              disabled={isLocked}
            >
              <div className="step-circle-container">
                <div className="step-circle">
                  {step.id < activeStep && !isActive ? (
                    <Check size={12} className="icon-check" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
              </div>
              <div className="step-content">
                <IconComponent size={14} className="step-icon" />
                <span className="step-label">{step.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
