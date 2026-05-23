import { Shield, Sparkles, Wallet, Zap } from "lucide-react";
import type { LedgerState, MissionPhase, WalletState } from "../types";
import { formatXlm, shortAddress } from "../lib/hash";

interface WalletPanelProps {
  wallet: WalletState;
  ledger: LedgerState;
  phase: MissionPhase;
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
  budgetXlm,
  onConnectWallet,
  onDemoWallet,
  onFundMission,
  onStartSwarm
}: WalletPanelProps) {
  const missionCreated = phase !== "draft";
  const canFund = missionCreated && phase === "created" && wallet.mode !== "unknown";
  const canStart = phase === "funded";

  return (
    <section className="wallet-panel" aria-label="Wallet control">
      <div className="section-header">
        <Wallet size={18} className="icon-indigo" />
        <h2>Funding and Wallet</h2>
      </div>

      <div className="status-grid">
        <div className="status-row">
          <span>Stellar Wallet</span>
          <strong className="status-value">
            {wallet.mode === "unknown" ? <span className="text-muted">Disconnected</span> : shortAddress(wallet.address)}
          </strong>
        </div>
        <div className="status-row">
          <span>Stellar Network</span>
          <strong className={`status-value network-${wallet.network.toLowerCase()}`}>{wallet.network}</strong>
        </div>
        <div className="status-row">
          <span>Balance</span>
          <strong className="status-value font-mono">{formatXlm(wallet.balanceXlm)}</strong>
        </div>
        <div className="status-row">
          <span>Escrow Smart Contract</span>
          <strong className="status-value">
            {ledger.contractId ? shortAddress(ledger.contractId) : "Demo Sandbox Ledger"}
          </strong>
        </div>
      </div>

      {(wallet.message || ledger.message) && (
        <div className="panel-notifications font-mono">
          {wallet.message && <p className="notify-text">{wallet.message}</p>}
          {ledger.message && <p className="notify-text">{ledger.message}</p>}
        </div>
      )}

      {wallet.mode === "unknown" && (
        <div className="wallet-connect-buttons">
          <button className="btn btn-secondary" onClick={onConnectWallet}>
            <Zap size={14} className="btn-icon" />
            Connect Freighter
          </button>
          <button className="btn btn-secondary" onClick={onDemoWallet}>
            <Sparkles size={14} className="btn-icon" />
            Use Sandbox Wallet
          </button>
        </div>
      )}

      {canFund && (
        <button className="btn btn-primary" onClick={onFundMission}>
          <Shield size={14} className="btn-icon" />
          Fund Mission ({formatXlm(budgetXlm)})
        </button>
      )}

      {canStart && (
        <button className="btn btn-indigo" onClick={onStartSwarm}>
          Start Swarm operations
        </button>
      )}

      {phase !== "draft" && phase !== "created" && phase !== "funded" && (
        <div className="escrow-locked-notice">
          <div className="locked-dot" />
          <span>{formatXlm(budgetXlm)} locked securely in research escrow.</span>
        </div>
      )}
    </section>
  );
}
