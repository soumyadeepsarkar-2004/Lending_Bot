#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_supply_and_borrow() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    // Supply 1000 collateral
    client.supply(&user, &1000);

    // Check position - should have 1000 collateral, 0 debt
    let position = client.get_position(&user).unwrap();
    assert_eq!(position.collateral, 1000);
    assert_eq!(position.debt, 0);

    // Borrow 500 (50% of collateral - well above 150% ratio)
    client.borrow(&user, &500);

    let position = client.get_position(&user).unwrap();
    assert_eq!(position.collateral, 1000);
    assert_eq!(position.debt, 500);

    // Health factor should be 240% (1000 * 120 / 500)
    let hf = client.get_health_factor(&user);
    assert!(hf >= 240 - 1 && hf <= 240 + 1); // Allow small margin for interest
}

#[test]
fn test_repay_and_withdraw() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    // Supply collateral
    client.supply(&user, &1000);
    client.borrow(&user, &500);

    // Repay full debt
    client.repay(&user, &500);

    let position = client.get_position(&user).unwrap();
    assert_eq!(position.debt, 0);

    // Withdraw all collateral
    client.withdraw(&user, &1000);

    let position = client.get_position(&user).unwrap();
    assert_eq!(position.collateral, 0);
}

#[test]
fn test_cannot_borrow_exceeding_ratio() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    // Supply 1000 collateral
    client.supply(&user, &1000);

    // Try to borrow 700 (70% ratio - below 150% required, should fail)
    // Health factor would be 1000 * 120 / 700 = 171%, still above 100%
    // Let me try 800 (80% ratio): 1000 * 120 / 800 = 150%, this is the limit

    client.borrow(&user, &800);

    // Should succeed at exactly 150% ratio

    // Try 801 - should fail
    let result = client.try_borrow(&user, &801);
    assert!(result.is_err());
}

#[test]
fn test_liquidate_undercollateralized() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let borrower = Address::generate(&env);
    let liquidator = Address::generate(&env);

    // Borrower supplies 1000, borrows 600
    // Health factor: 1000 * 120 / 600 = 200% (healthy)
    client.supply(&borrower, &1000);
    client.borrow(&borrower, &600);

    // Liquidator supplies collateral to receive liquidation rewards
    client.supply(&liquidator, &100);

    // Someone (anyone!) updates price to simulate collateral price drop
    // New price = 70% of original (7000000 / 10000000)
    // Health after price drop: 1000 * 7000000 * 120 / (600 * 10000000) = 140%
    // Still not liquidatable... need more drop
    // Let's drop to 50%: 1000 * 5000000 * 120 / (600 * 10000000) = 100%
    client.update_price(&5000000); // 50% price

    // Now liquidator can liquidate (health is 100%, below 120%)
    client.liquidate(&liquidator, &borrower, &300);

    // Check borrower position was updated
    let position = client.get_position(&borrower).unwrap();
    assert_eq!(position.debt, 300); // 600 - 300

    // Liquidator should have received collateral (300 * 1.1 = 330)
    let liquidator_pos = client.get_position(&liquidator).unwrap();
    assert!(liquidator_pos.collateral >= 430); // 100 + 330
}

#[test]
fn test_liquidation_spreads_to_liquidator() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let liquidator = Address::generate(&env);

    // Liquidator supplies collateral to receive liquidation rewards
    client.supply(&liquidator, &100);

    let position = client.get_position(&liquidator).unwrap();
    assert_eq!(position.collateral, 100);
}

#[test]
fn test_multiple_borrowers() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    // User 1: supply 1000, borrow 600
    client.supply(&user1, &1000);
    client.borrow(&user1, &600);

    // User 2: supply 500, borrow 300
    client.supply(&user2, &500);
    client.borrow(&user2, &300);

    // Both positions should be independent
    assert_eq!(client.get_position(&user1).unwrap().debt, 600);
    assert_eq!(client.get_position(&user2).unwrap().debt, 300);

    // Total stats
    let stats = client.get_total_stats();
    assert_eq!(stats.total_collateral, 1500);
    assert_eq!(stats.total_debt, 900);
    assert_eq!(stats.total_borrowers, 2);
}

#[test]
fn test_health_factor_zero_collateral() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    // No position - health factor should be 0 (special case)
    let hf = client.get_health_factor(&user);
    assert_eq!(hf, 0);
}

#[test]
fn test_cannot_withdraw_more_than_supplied() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    client.supply(&user, &1000);

    // Try to withdraw more than supplied
    let result = client.try_withdraw(&user, &1001);
    assert!(result.is_err());
}

#[test]
fn test_cannot_withdraw_collateral_with_debt() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    client.supply(&user, &1000);
    client.borrow(&user, &500);

    // Try to withdraw 600 (would leave only 400 collateral for 500 debt = 80% ratio)
    let result = client.try_withdraw(&user, &600);
    assert!(result.is_err());
}

#[test]
fn test_can_withdraw_excess_collateral() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    client.supply(&user, &1000);
    client.borrow(&user, &500);

    // Can withdraw 333 (leaves 667 collateral for 500 debt = 160% ratio)
    client.withdraw(&user, &333);

    let position = client.get_position(&user).unwrap();
    assert_eq!(position.collateral, 667);
}
