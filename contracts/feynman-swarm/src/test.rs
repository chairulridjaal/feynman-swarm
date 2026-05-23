#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{token, Address, BytesN, Env, String};

fn hash(env: &Env, seed: u8) -> BytesN<32> {
    BytesN::from_array(env, &[seed; 32])
}

fn setup() -> (
    Env,
    FeynmanSwarmClient<'static>,
    Address,
    Address,
    Address,
    token::TokenClient<'static>,
) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(FeynmanSwarm, ());
    let client = FeynmanSwarmClient::new(&env, &contract_id);

    let issuer = Address::generate(&env);
    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(issuer);
    let token_address = sac.address();
    let token = token::TokenClient::new(&env, &token_address);
    let token_admin = token::StellarAssetClient::new(&env, &token_address);

    token_admin.mint(&owner, &100_000_000);

    (env, client, owner, agent, token_address, token)
}

#[test]
fn pays_accepted_artifact_and_refunds_unused_budget() {
    let (env, client, owner, agent, token_address, token) = setup();

    let run_id = client.create_run(&owner, &token_address, &hash(&env, 1), &1_000);
    client.fund_run(&owner, &run_id, &50_000_000);
    client.register_agent(&owner, &run_id, &agent, &symbol_short!("paper"));
    client.submit_artifact(
        &agent,
        &run_id,
        &1,
        &hash(&env, 2),
        &String::from_str(&env, "ipfs://paper-scout"),
    );
    client.approve_artifact(&owner, &run_id, &1, &91, &18_500_000);
    client.finalize_run(
        &owner,
        &run_id,
        &hash(&env, 3),
        &String::from_str(&env, "ipfs://final-report"),
    );
    let refund = client.refund_unused(&owner, &run_id);

    let run = client.get_run(&run_id);
    let artifact = client.get_artifact(&run_id, &1);
    let registered_agent = client.get_agent(&run_id, &agent);
    let report = client.get_final_report(&run_id);

    assert_eq!(run.status, RunStatus::Finalized);
    assert_eq!(run.budget, 50_000_000);
    assert_eq!(run.remaining_budget, 0);
    assert_eq!(artifact.status, ArtifactStatus::Paid);
    assert_eq!(artifact.reward, 18_500_000);
    assert_eq!(registered_agent.total_earned, 18_500_000);
    assert_eq!(refund, 31_500_000);
    assert_eq!(report.final_report_hash, hash(&env, 3));
    assert_eq!(token.balance(&agent), 18_500_000);
    assert_eq!(token.balance(&owner), 81_500_000);
}

#[test]
fn rejected_artifact_keeps_budget_available() {
    let (env, client, owner, agent, token_address, token) = setup();

    let run_id = client.create_run(&owner, &token_address, &hash(&env, 4), &1_000);
    client.fund_run(&owner, &run_id, &20_000_000);
    client.register_agent(&owner, &run_id, &agent, &symbol_short!("web"));
    client.submit_artifact(
        &agent,
        &run_id,
        &7,
        &hash(&env, 5),
        &String::from_str(&env, "ipfs://weak-claim"),
    );
    client.reject_artifact(&owner, &run_id, &7, &hash(&env, 6));

    let run = client.get_run(&run_id);
    let artifact = client.get_artifact(&run_id, &7);
    let rejection = client.get_rejection(&run_id, &7);

    assert_eq!(run.remaining_budget, 20_000_000);
    assert_eq!(artifact.status, ArtifactStatus::Rejected);
    assert_eq!(rejection.reason_hash, hash(&env, 6));
    assert_eq!(token.balance(&agent), 0);
}
