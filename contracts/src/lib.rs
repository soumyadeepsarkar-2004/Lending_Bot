#![no_std]
use soroban_sdk::{contract, contractimpl, log, symbol_short, token, Address, Env};

#[contract]
pub struct LendingBot;

#[contractimpl]
impl LendingBot {
    /// Initialize the lending pool with a specific token (e.g., USDC)
    pub fn init(env: Env, admin: Address, token_id: Address) {
        admin.require_auth();
        env.storage()
            .instance()
            .set(&symbol_short!("admin"), &admin);
        env.storage()
            .instance()
            .set(&symbol_short!("token"), &token_id);
    }

    /// Lenders deposit tokens into the pool to earn interest
    pub fn deposit(env: Env, lender: Address, amount: i128) {
        lender.require_auth();

        let token_id: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("token"))
            .unwrap();
        let client = token::Client::new(&env, &token_id);

        // Transfer tokens from lender to this contract
        client.transfer(&lender, &env.current_contract_address(), &amount);

        // Update lender's balance in storage
        let mut balance: i128 = env.storage().persistent().get(&lender).unwrap_or(0);
        balance += amount;
        env.storage().persistent().set(&lender, &balance);

        log!(&env, "Deposit successful", lender, amount);
    }

    /// Withdraw funds from the pool
    pub fn withdraw(env: Env, lender: Address, amount: i128) {
        lender.require_auth();

        let mut balance: i128 = env.storage().persistent().get(&lender).unwrap_or(0);
        if balance < amount {
            panic!("Insufficient balance");
        }

        let token_id: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("token"))
            .unwrap();
        let client = token::Client::new(&env, &token_id);

        // Update balance and transfer back
        balance -= amount;
        env.storage().persistent().set(&lender, &balance);
        client.transfer(&env.current_contract_address(), &lender, &amount);
    }

    /// View current balance of a lender
    pub fn get_balance(env: Env, lender: Address) -> i128 {
        env.storage().persistent().get(&lender).unwrap_or(0)
    }
}
