# Feynman Swarm

Feynman Swarm is an XLM-powered AI research economy on Stellar.

Users fund a research mission with testnet XLM, specialized agents produce evidence artifacts, a verifier approves or rejects each artifact, and the Soroban contract releases payment only for accepted work.

> Fund questions. Pay evidence. Verify knowledge.

## Why Stellar/XLM?

Stellar is a strong fit for research micro-bounties because Soroban contracts can coordinate escrow and verification while Stellar Asset Contracts expose native XLM and other assets through a standard token interface. The demo uses this model: the contract stores compact hashes, URIs, scores, statuses, and payouts, while long research text stays off-chain.

## Architecture

```text
contracts/
  hello-world/
    src/lib.rs
  feynman-swarm/
    src/lib.rs
    src/test.rs
    Cargo.toml

apps/
  web/
    src/
      App.tsx
      components/
      data/
      lib/
      styles.css
```

The current MVP has two layers:

- `contracts/feynman-swarm`: Soroban escrow contract for mission budgets, artifact submissions, verification, payouts, final reports, and unused-budget refunds.
- `apps/web`: React + Vite command-center dashboard with deterministic demo agents, Freighter-aware wallet connection, mock ledger fallback, evidence cards, final report, and invoice.
- `apps/api`: local Node API bridge for a live LB Responses model pass using GPT 5.4 Medium. The API key stays server-side in an ignored `.env` file.

## Smart Contract API

The contract keeps long research payloads off-chain and stores hashes plus URIs.

```rust
create_run(owner, token, topic_hash, deadline) -> run_id
fund_run(funder, run_id, amount)
register_agent(owner, run_id, agent_address, role)
submit_artifact(agent, run_id, task_id, artifact_hash, artifact_uri)
approve_artifact(owner, run_id, task_id, score, reward)
reject_artifact(owner, run_id, task_id, reason_hash)
finalize_run(owner, run_id, final_report_hash, final_report_uri)
refund_unused(owner, run_id) -> amount
```

Core flow:

```text
budget -> artifacts -> verification -> payout/refund
```

For native XLM on testnet, pass the native Stellar Asset Contract address as the `token` parameter. You can derive the address with Stellar CLI:

```powershell
stellar contract id asset --network testnet --asset native
```

## Frontend Flow

1. Open the Feynman Swarm dashboard.
2. Use the default rural Indonesian school sustainability question or enter a new one.
3. Set the XLM mission budget, depth, and output type.
4. Create the mission.
5. Connect Freighter or use deterministic demo mode.
6. Fund the mission.
7. Start the swarm.
8. Watch Planner, Paper Scout, Web Scout, Repo Scout, Verifier, and Writer progress.
9. Inspect evidence cards and verifier decisions.
10. Generate the final report.
11. Review the invoice and refund unused budget.

## Running Locally

Install and run the frontend:

```powershell
cd C:\Users\Chairulridjal\Downloads\stellar\apps\web
npm install
npm run dev
```

Run the live AI bridge in a second terminal:

```powershell
cd C:\Users\Chairulridjal\Downloads\stellar\apps\api
Copy-Item .env.example .env
# Put the workshop LB_API_KEY in .env
npm run dev
```

Open the printed local URL, usually:

```text
http://127.0.0.1:5173
```

Build the frontend:

```powershell
cd C:\Users\Chairulridjal\Downloads\stellar\apps\web
npm run build
```

## Running Contract Tests

The contract workspace expects Rust, the `wasm32v1-none` target, and Stellar CLI.

```powershell
cd C:\Users\Chairulridjal\Downloads\stellar
cargo test -p feynman-swarm
cargo fmt --all -- --check
stellar contract build --package feynman-swarm
```

If `cargo` or `stellar` is not found, install Rust and Stellar CLI or add them to PATH:

```powershell
rustup target add wasm32v1-none
stellar --version
```

## Demo Mode

The web app does not require live AI APIs, live web search, a deployed contract, or a wallet. If Freighter is not available, the app uses a deterministic mock wallet and mock ledger.

Demo mode mirrors contract semantics:

- mission creation produces a run id
- funding locks the budget
- accepted artifacts create payout intents
- rejected artifacts receive no reward
- finalization unlocks the report
- unused budget can be refunded

When `apps/api` is running, click **Run Live AI Pass** to send the mission ledger to the workshop LB model provider using GPT 5.4 Medium. If the API is unavailable, the deterministic report remains usable.

Set `VITE_FEYNMAN_SWARM_CONTRACT_ID` in `apps/web/.env` after deploying a real contract. The adapter is intentionally conservative until generated bindings are added.

## Demo Script

1. “Feynman Swarm turns a question into a research market: fund the mission, pay evidence, reject weak claims.”
2. Show the default question: “What sustainability project should a rural Indonesian school prioritize: rooftop solar, smart irrigation, or rainwater harvesting?”
3. Create the mission with a 24 XLM budget.
4. Use demo wallet or connect Freighter on Testnet.
5. Fund the mission.
6. Start the swarm and let the agent nodes submit artifacts.
7. Run the verifier. Point out that supported rainwater, solar, irrigation, and synthesis artifacts are paid, while the unsupported “solar always wins” claim is rejected.
8. Generate the final report. The recommendation prioritizes rainwater harvesting first, then solar, then smart irrigation as a learning extension.
9. Show the invoice: budget, spent XLM, refunded XLM, payouts per agent, rejected artifacts, and cost per accepted claim.
10. Refund unused budget.

## Research Notes

Implementation choices were based on current Stellar docs and primary project references:

- Soroban contracts are Rust/Wasm and use the Soroban SDK subset.
- Stellar assets, including native XLM, should be handled through Stellar Asset Contracts and the SEP-41 token interface.
- Freighter dApps should use `@stellar/freighter-api` for connection, network details, and transaction signing.
- Modern agent orchestration patterns favor a manager that coordinates specialized workers, tool calls, handoffs, and traces.
- Agent-payment protocols such as Stellar MPP and x402 are natural future extensions for pay-per-request research APIs.

## Limitations

- The web app currently uses a deterministic local swarm engine rather than live LLM/search calls.
- The Soroban contract code is implemented, but Rust/Stellar CLI verification requires the local toolchain on PATH.
- The frontend includes wallet detection and demo ledger semantics; production contract calls should be wired through generated TypeScript bindings after deployment.
- Research artifacts use sample citations and IPFS-style URIs for demo clarity.
- There is no dispute resolution, agent reputation, or multi-verifier staking yet.

## Future Improvements

- Real Feynman-style research orchestration with OpenAI Agents SDK or Open Deep Research.
- x402 or Stellar MPP for agent-to-agent and API micropayments.
- IPFS or Filecoin artifact storage with content-addressed evidence.
- Generated Stellar TypeScript bindings and deployed testnet contract configuration.
- Agent reputation scores and historical payout records.
- Verifier staking, dispute resolution, and appeal windows.
- Production Freighter signing flow with explicit transaction simulation and status polling.
