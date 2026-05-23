import { Shield, Sparkles, ChevronRight, Lock, Wallet } from "lucide-react";
import type { LedgerState, MissionPhase, WalletState } from "../types";
import { formatXlm } from "../lib/hash";

interface WalletPanelProps {
  wallet: WalletState;
  ledger: LedgerState;
  phase: MissionPhase;
  question: string;
  budgetXlm: number;
  onConnectWallet: () => void;
  onDemoWallet: () => void;
  onFundMission: () => void;
  onStartSwarm: () => void;
}

export function WalletPanel({
  wallet,
  ledger,
  phase,
  question,
  budgetXlm,
  onConnectWallet,
  onDemoWallet,
  onFundMission,
  onStartSwarm,
}: WalletPanelProps) {
  const isDemo = wallet.mode === "mock";
  const isWalletConnected = wallet.mode !== "unknown";
  
  const totalBudget = budgetXlm || 100;
  const platformFee = totalBudget * 0.05;
  const contributorPortion = totalBudget - platformFee;
  
  const canFund = phase === "created" && isWalletConnected;
  const isAlreadyFunded = phase === "funded";

  return (
    <div className="focused-wizard-container fade-in">
      <div className="wizard-hero-block">
        <h1 className="wizard-title">Fund your mission</h1>
        <p className="wizard-subtitle">
          Securely escrow XLM to activate the swarm. You only pay for verified, accepted evidence.
        </p>
      </div>

      <div className="wizard-card-center invoice-style-card">
        <div className="invoice-header">
          <div className="invoice-brand">
            <div className="brand-dot" />
            <span>Feynman Escrow</span>
          </div>
          <span className="network-badge font-mono">Stellar Testnet</span>
        </div>

        <div className="invoice-body">
          <h3 className="invoice-question">"{question}"</h3>
          
          <div className="invoice-breakdown">
            <div className="breakdown-row">
              <span className="label">Research payout pool</span>
              <span className="value font-mono">{contributorPortion.toFixed(0)} XLM</span>
            </div>
            <div className="breakdown-row text-muted-custom">
              <span className="label">Platform fee (5%)</span>
              <span className="value font-mono">{platformFee.toFixed(0)} XLM</span>
            </div>
            <div className="breakdown-row total-row">
              <span className="label">Total to escrow</span>
              <span className="value font-mono highlight">{totalBudget} XLM</span>
            </div>
          </div>
        </div>

        <div className="invoice-footer">
          {isWalletConnected ? (
            <div className="wallet-active-section">
              <div className="wallet-balance-row">
                <span className="label">Your balance:</span>
                <strong className="font-mono">{isDemo ? "250.42 XLM" : formatXlm(wallet.balanceXlm)}</strong>
              </div>

              {phase === "created" && (
                <button className="btn-wizard-primary full-width mt-16" onClick={onFundMission}>
                  <Sparkles size={16} />
                  Authorize {totalBudget} XLM
                </button>
              )}

              {isAlreadyFunded && (
                <button className="btn-wizard-success full-width mt-16" onClick={onStartSwarm}>
                  <ChevronRight size={16} />
                  Start Swarm Operations
                </button>
              )}
            </div>
          ) : (
            <div className="wallet-connect-section">
              <p className="connect-prompt">Connect a wallet to proceed with funding.</p>
              <div className="connect-btn-group">
                <button className="btn-wizard-outline" onClick={onConnectWallet}>
                  <Wallet size={14} />
                  Connect Freighter
                </button>
                <button className="btn-wizard-secondary" onClick={onDemoWallet}>
                  Use Demo Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="wizard-trust-badges mt-24">
        <div className="trust-badge">
          <Lock size={14} className="trust-icon text-muted" />
          <span className="text-muted">Unused funds are automatically refunded</span>
        </div>
      </div>
    </div>
  );
}
