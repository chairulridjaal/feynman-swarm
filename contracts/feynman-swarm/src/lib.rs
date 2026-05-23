#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, symbol_short, token,
    Address, BytesN, Env, String, Symbol,
};

#[contract]
pub struct FeynmanSwarm;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum RunStatus {
    Open,
    Funded,
    Researching,
    Finalized,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ArtifactStatus {
    Pending,
    Paid,
    Rejected,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ResearchRun {
    pub id: u64,
    pub owner: Address,
    pub token: Address,
    pub topic_hash: BytesN<32>,
    pub budget: i128,
    pub remaining_budget: i128,
    pub status: RunStatus,
    pub created_at: u64,
    pub deadline: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Agent {
    pub run_id: u64,
    pub address: Address,
    pub role: Symbol,
    pub total_earned: i128,
    pub registered_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Artifact {
    pub run_id: u64,
    pub task_id: u64,
    pub agent: Address,
    pub role: Symbol,
    pub artifact_hash: BytesN<32>,
    pub artifact_uri: String,
    pub score: u32,
    pub reward: i128,
    pub status: ArtifactStatus,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Rejection {
    pub run_id: u64,
    pub task_id: u64,
    pub reason_hash: BytesN<32>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FinalReport {
    pub run_id: u64,
    pub final_report_hash: BytesN<32>,
    pub final_report_uri: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    NextRunId,
    Run(u64),
    Agent(u64, Address),
    Artifact(u64, u64),
    Rejection(u64, u64),
    FinalReport(u64),
}

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    InvalidDeadline = 1,
    InvalidAmount = 2,
    RunNotFound = 3,
    AgentNotRegistered = 4,
    ArtifactAlreadyExists = 5,
    ArtifactNotFound = 6,
    InvalidRunStatus = 7,
    InvalidArtifactStatus = 8,
    InsufficientBudget = 9,
    Unauthorized = 10,
    RefundNotAvailable = 11,
}

fn next_run_id(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::NextRunId)
        .unwrap_or(1_u64)
}

fn set_next_run_id(env: &Env, id: u64) {
    env.storage().instance().set(&DataKey::NextRunId, &id);
}

fn read_run(env: &Env, run_id: u64) -> ResearchRun {
    env.storage()
        .persistent()
        .get(&DataKey::Run(run_id))
        .unwrap_or_else(|| panic_with_error!(env, Error::RunNotFound))
}

fn write_run(env: &Env, run: &ResearchRun) {
    env.storage().persistent().set(&DataKey::Run(run.id), run);
}

fn require_owner(env: &Env, run: &ResearchRun, owner: &Address) {
    if run.owner != *owner {
        panic_with_error!(env, Error::Unauthorized);
    }
    owner.require_auth();
}

fn ensure_research_can_change(env: &Env, run: &ResearchRun) {
    if run.status != RunStatus::Funded && run.status != RunStatus::Researching {
        panic_with_error!(env, Error::InvalidRunStatus);
    }
}

#[contractimpl]
impl FeynmanSwarm {
    pub fn create_run(
        env: Env,
        owner: Address,
        token: Address,
        topic_hash: BytesN<32>,
        deadline: u64,
    ) -> u64 {
        owner.require_auth();

        if deadline <= env.ledger().timestamp() {
            panic_with_error!(&env, Error::InvalidDeadline);
        }

        let run_id = next_run_id(&env);
        set_next_run_id(&env, run_id + 1);

        let run = ResearchRun {
            id: run_id,
            owner: owner.clone(),
            token,
            topic_hash,
            budget: 0,
            remaining_budget: 0,
            status: RunStatus::Open,
            created_at: env.ledger().timestamp(),
            deadline,
        };

        write_run(&env, &run);
        env.events()
            .publish((symbol_short!("run"), symbol_short!("create")), run_id);
        run_id
    }

    pub fn fund_run(env: Env, funder: Address, run_id: u64, amount: i128) {
        funder.require_auth();

        if amount <= 0 {
            panic_with_error!(&env, Error::InvalidAmount);
        }

        let mut run = read_run(&env, run_id);
        if run.status != RunStatus::Open && run.status != RunStatus::Funded {
            panic_with_error!(&env, Error::InvalidRunStatus);
        }

        let token = token::TokenClient::new(&env, &run.token);
        token.transfer(&funder, &env.current_contract_address(), &amount);

        run.budget += amount;
        run.remaining_budget += amount;
        run.status = RunStatus::Funded;
        write_run(&env, &run);

        env.events().publish(
            (symbol_short!("run"), symbol_short!("fund")),
            (run_id, amount),
        );
    }

    pub fn register_agent(
        env: Env,
        owner: Address,
        run_id: u64,
        agent_address: Address,
        role: Symbol,
    ) {
        let run = read_run(&env, run_id);
        require_owner(&env, &run, &owner);

        if run.status == RunStatus::Finalized || run.status == RunStatus::Cancelled {
            panic_with_error!(&env, Error::InvalidRunStatus);
        }

        let agent = Agent {
            run_id,
            address: agent_address.clone(),
            role: role.clone(),
            total_earned: 0,
            registered_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Agent(run_id, agent_address.clone()), &agent);
        env.events().publish(
            (symbol_short!("agent"), symbol_short!("reg")),
            (run_id, agent_address, role),
        );
    }

    pub fn submit_artifact(
        env: Env,
        agent: Address,
        run_id: u64,
        task_id: u64,
        artifact_hash: BytesN<32>,
        artifact_uri: String,
    ) {
        agent.require_auth();

        let mut run = read_run(&env, run_id);
        ensure_research_can_change(&env, &run);

        let agent_key = DataKey::Agent(run_id, agent.clone());
        let registered: Agent = env
            .storage()
            .persistent()
            .get(&agent_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::AgentNotRegistered));

        let artifact_key = DataKey::Artifact(run_id, task_id);
        if env.storage().persistent().has(&artifact_key) {
            panic_with_error!(&env, Error::ArtifactAlreadyExists);
        }

        let artifact = Artifact {
            run_id,
            task_id,
            agent: agent.clone(),
            role: registered.role,
            artifact_hash,
            artifact_uri,
            score: 0,
            reward: 0,
            status: ArtifactStatus::Pending,
        };

        run.status = RunStatus::Researching;
        write_run(&env, &run);
        env.storage().persistent().set(&artifact_key, &artifact);
        env.events().publish(
            (symbol_short!("art"), symbol_short!("submit")),
            (run_id, task_id, agent),
        );
    }

    pub fn approve_artifact(
        env: Env,
        owner: Address,
        run_id: u64,
        task_id: u64,
        score: u32,
        reward: i128,
    ) {
        if reward <= 0 {
            panic_with_error!(&env, Error::InvalidAmount);
        }

        let mut run = read_run(&env, run_id);
        require_owner(&env, &run, &owner);
        ensure_research_can_change(&env, &run);

        if reward > run.remaining_budget {
            panic_with_error!(&env, Error::InsufficientBudget);
        }

        let artifact_key = DataKey::Artifact(run_id, task_id);
        let mut artifact: Artifact = env
            .storage()
            .persistent()
            .get(&artifact_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ArtifactNotFound));

        if artifact.status != ArtifactStatus::Pending {
            panic_with_error!(&env, Error::InvalidArtifactStatus);
        }

        let agent_key = DataKey::Agent(run_id, artifact.agent.clone());
        let mut agent: Agent = env
            .storage()
            .persistent()
            .get(&agent_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::AgentNotRegistered));

        run.remaining_budget -= reward;
        artifact.score = score;
        artifact.reward = reward;
        artifact.status = ArtifactStatus::Paid;
        agent.total_earned += reward;

        write_run(&env, &run);
        env.storage().persistent().set(&artifact_key, &artifact);
        env.storage().persistent().set(&agent_key, &agent);

        let token = token::TokenClient::new(&env, &run.token);
        token.transfer(&env.current_contract_address(), &artifact.agent, &reward);

        env.events().publish(
            (symbol_short!("art"), symbol_short!("pay")),
            (run_id, task_id, artifact.agent, reward),
        );
    }

    pub fn reject_artifact(
        env: Env,
        owner: Address,
        run_id: u64,
        task_id: u64,
        reason_hash: BytesN<32>,
    ) {
        let run = read_run(&env, run_id);
        require_owner(&env, &run, &owner);
        ensure_research_can_change(&env, &run);

        let artifact_key = DataKey::Artifact(run_id, task_id);
        let mut artifact: Artifact = env
            .storage()
            .persistent()
            .get(&artifact_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::ArtifactNotFound));

        if artifact.status != ArtifactStatus::Pending {
            panic_with_error!(&env, Error::InvalidArtifactStatus);
        }

        artifact.status = ArtifactStatus::Rejected;
        let rejection = Rejection {
            run_id,
            task_id,
            reason_hash,
        };

        env.storage().persistent().set(&artifact_key, &artifact);
        env.storage()
            .persistent()
            .set(&DataKey::Rejection(run_id, task_id), &rejection);
        env.events().publish(
            (symbol_short!("art"), symbol_short!("reject")),
            (run_id, task_id),
        );
    }

    pub fn finalize_run(
        env: Env,
        owner: Address,
        run_id: u64,
        final_report_hash: BytesN<32>,
        final_report_uri: String,
    ) {
        let mut run = read_run(&env, run_id);
        require_owner(&env, &run, &owner);

        if run.status != RunStatus::Funded && run.status != RunStatus::Researching {
            panic_with_error!(&env, Error::InvalidRunStatus);
        }

        run.status = RunStatus::Finalized;
        write_run(&env, &run);

        let report = FinalReport {
            run_id,
            final_report_hash,
            final_report_uri,
        };
        env.storage()
            .persistent()
            .set(&DataKey::FinalReport(run_id), &report);
        env.events()
            .publish((symbol_short!("run"), symbol_short!("final")), run_id);
    }

    pub fn refund_unused(env: Env, owner: Address, run_id: u64) -> i128 {
        let mut run = read_run(&env, run_id);
        require_owner(&env, &run, &owner);

        let now = env.ledger().timestamp();
        if run.status != RunStatus::Finalized && now <= run.deadline {
            panic_with_error!(&env, Error::RefundNotAvailable);
        }

        let refund = run.remaining_budget;
        if refund <= 0 {
            return 0;
        }

        run.remaining_budget = 0;
        write_run(&env, &run);

        let token = token::TokenClient::new(&env, &run.token);
        token.transfer(&env.current_contract_address(), &run.owner, &refund);

        env.events().publish(
            (symbol_short!("run"), symbol_short!("refund")),
            (run_id, refund),
        );
        refund
    }

    pub fn get_run(env: Env, run_id: u64) -> ResearchRun {
        read_run(&env, run_id)
    }

    pub fn get_agent(env: Env, run_id: u64, agent: Address) -> Agent {
        env.storage()
            .persistent()
            .get(&DataKey::Agent(run_id, agent))
            .unwrap_or_else(|| panic_with_error!(&env, Error::AgentNotRegistered))
    }

    pub fn get_artifact(env: Env, run_id: u64, task_id: u64) -> Artifact {
        env.storage()
            .persistent()
            .get(&DataKey::Artifact(run_id, task_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::ArtifactNotFound))
    }

    pub fn get_rejection(env: Env, run_id: u64, task_id: u64) -> Rejection {
        env.storage()
            .persistent()
            .get(&DataKey::Rejection(run_id, task_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::ArtifactNotFound))
    }

    pub fn get_final_report(env: Env, run_id: u64) -> FinalReport {
        env.storage()
            .persistent()
            .get(&DataKey::FinalReport(run_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::RunNotFound))
    }
}

mod test;
