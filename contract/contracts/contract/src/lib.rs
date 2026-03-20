#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone)]
pub struct Position {
    pub collateral: i128,
    pub debt: i128,
    pub last_update: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct TotalStats {
    pub total_collateral: i128,
    pub total_debt: i128,
    pub total_borrowers: u32,
}

#[contracttype]
pub enum DataKey {
    Position(Address),
    TotalCollateral,
    TotalDebt,
    TotalBorrowers,
    CollateralPrice,
}

const DECIMALS: i128 = 10000000; // 7 decimal places
const LIQUIDATION_BONUS: i128 = 11000000; // 10% bonus for liquidators (110%)
const INTEREST_RATE: i128 = 5000000; // 5% APR (in millionths)
const PRICE_DECIMALS: i128 = 10000000; // Price precision

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    // Permissionless price update - anyone can update collateral price
    // This simulates market-driven oracle prices
    pub fn update_price(env: Env, price: i128) {
        assert!(price > 0, "price must be positive");
        env.storage()
            .instance()
            .set(&DataKey::CollateralPrice, &price);
    }

    pub fn get_price(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::CollateralPrice)
            .unwrap_or(PRICE_DECIMALS)
    }

    pub fn supply(env: Env, user: Address, amount: i128) {
        user.require_auth();
        assert!(amount > 0, "amount must be positive");

        let mut position = Self::get_or_create_position(&env, &user);
        position.collateral += amount;
        position.last_update = env.ledger().timestamp();

        Self::save_position(&env, &user, &position);
        Self::update_total_stats(&env, |s| {
            s.total_collateral += amount;
        });
    }

    pub fn withdraw(env: Env, user: Address, amount: i128) {
        user.require_auth();
        assert!(amount > 0, "amount must be positive");

        let mut position = Self::get_or_create_position(&env, &user);
        assert!(position.collateral >= amount, "insufficient collateral");

        // Check if withdrawal would violate health factor
        if position.debt > 0 {
            let collateral_after = position.collateral - amount;
            let price = Self::get_price(env.clone());
            let health = Self::calculate_health_factor(collateral_after, position.debt, price);
            assert!(health >= 120, "withdrawal would violate health factor");
        }

        position.collateral -= amount;
        position.last_update = env.ledger().timestamp();

        Self::save_position(&env, &user, &position);
        Self::update_total_stats(&env, |s| {
            s.total_collateral -= amount;
        });
    }

    pub fn borrow(env: Env, user: Address, amount: i128) {
        user.require_auth();
        assert!(amount > 0, "amount must be positive");

        let mut position = Self::get_or_create_position(&env, &user);
        let mut new_borrowers = false;

        if position.debt == 0 && amount > 0 {
            new_borrowers = true;
        }

        position.debt += amount;
        position.last_update = env.ledger().timestamp();

        // Check health factor (collateral * liquidation_threshold / debt >= 150%)
        let price = Self::get_price(env.clone());
        let health = Self::calculate_health_factor(position.collateral, position.debt, price);
        assert!(health >= 150, "insufficient collateral ratio");

        Self::save_position(&env, &user, &position);
        Self::update_total_stats(&env, |s| {
            s.total_debt += amount;
            if new_borrowers {
                s.total_borrowers += 1;
            }
        });
    }

    pub fn repay(env: Env, user: Address, amount: i128) {
        user.require_auth();
        assert!(amount > 0, "amount must be positive");

        let mut position = Self::get_or_create_position(&env, &user);
        let was_borrower = position.debt > 0;

        position.debt = position.debt.saturating_sub(amount);
        position.last_update = env.ledger().timestamp();

        Self::save_position(&env, &user, &position);
        Self::update_total_stats(&env, |s| {
            s.total_debt = s.total_debt.saturating_sub(amount);
            if was_borrower && position.debt == 0 {
                s.total_borrowers = s.total_borrowers.saturating_sub(1);
            }
        });
    }

    pub fn liquidate(env: Env, liquidator: Address, borrower: Address, debt_to_cover: i128) {
        liquidator.require_auth();
        assert!(debt_to_cover > 0, "amount must be positive");

        let mut position = Self::get_position(env.clone(), borrower.clone());
        assert!(position.is_some(), "borrower has no position");
        let mut pos = position.unwrap();

        // Calculate current debt with interest
        let current_debt =
            Self::accrue_interest(pos.debt, pos.last_update, env.ledger().timestamp());

        // Health factor must be below 120% for liquidation
        let price = Self::get_price(env.clone());
        let health = Self::calculate_health_factor(pos.collateral, current_debt, price);
        assert!(health < 120, "position is not liquidatable");

        // Limit to outstanding debt
        let actual_debt = debt_to_cover.min(current_debt);

        // Calculate collateral to give (with 10% bonus)
        let collateral_to_give = (actual_debt * LIQUIDATION_BONUS) / DECIMALS;
        assert!(
            pos.collateral >= collateral_to_give,
            "insufficient collateral"
        );

        // Update borrower position
        pos.debt = current_debt - actual_debt;
        pos.collateral = pos.collateral - collateral_to_give;
        pos.last_update = env.ledger().timestamp();

        Self::save_position(&env, &borrower, &pos);

        // Liquidator receives collateral (add to their position)
        let mut liquidator_pos = Self::get_or_create_position(&env, &liquidator);
        liquidator_pos.collateral += collateral_to_give;
        liquidator_pos.last_update = env.ledger().timestamp();
        Self::save_position(&env, &liquidator, &liquidator_pos);

        // Update totals
        Self::update_total_stats(&env, |s| {
            s.total_debt = s.total_debt.saturating_sub(actual_debt);
            s.total_collateral = s.total_collateral.saturating_sub(collateral_to_give);
        });
    }

    pub fn get_position(env: Env, user: Address) -> Option<Position> {
        env.storage().persistent().get(&DataKey::Position(user))
    }

    pub fn get_health_factor(env: Env, user: Address) -> i128 {
        let position = Self::get_position(env.clone(), user.clone());
        let price = Self::get_price(env.clone());
        match position {
            Some(p) if p.debt > 0 => {
                let current_debt =
                    Self::accrue_interest(p.debt, p.last_update, env.ledger().timestamp());
                Self::calculate_health_factor(p.collateral, current_debt, price)
            }
            Some(_) => 0, // No debt = healthy
            None => 0,
        }
    }

    pub fn get_total_stats(env: Env) -> TotalStats {
        let total_collateral: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalCollateral)
            .unwrap_or(0);
        let total_debt: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDebt)
            .unwrap_or(0);
        let total_borrowers: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalBorrowers)
            .unwrap_or(0);
        TotalStats {
            total_collateral,
            total_debt,
            total_borrowers,
        }
    }

    fn get_or_create_position(env: &Env, user: &Address) -> Position {
        env.storage()
            .persistent()
            .get(&DataKey::Position(user.clone()))
            .unwrap_or(Position {
                collateral: 0,
                debt: 0,
                last_update: env.ledger().timestamp(),
            })
    }

    fn save_position(env: &Env, user: &Address, position: &Position) {
        env.storage()
            .persistent()
            .set(&DataKey::Position(user.clone()), position);
        env.storage().persistent().extend_ttl(
            &DataKey::Position(user.clone()),
            0,       // Extend by default amount
            5184000, // ~30 days in ledgers
        );
    }

    fn update_total_stats<F>(env: &Env, update: F)
    where
        F: FnOnce(&mut TotalStats),
    {
        let mut stats = Self::get_total_stats(env.clone());
        update(&mut stats);
        env.storage()
            .instance()
            .set(&DataKey::TotalCollateral, &stats.total_collateral);
        env.storage()
            .instance()
            .set(&DataKey::TotalDebt, &stats.total_debt);
        env.storage()
            .instance()
            .set(&DataKey::TotalBorrowers, &stats.total_borrowers);
    }

    fn calculate_health_factor(collateral: i128, debt: i128, price: i128) -> i128 {
        if debt <= 0 {
            return 0;
        }
        // Returns health factor as percentage (e.g., 200 means 200%)
        // Health = (collateral * price * liquidation_threshold) / (debt * price_decimals)
        (collateral * price * 120) / (debt * PRICE_DECIMALS)
    }

    fn accrue_interest(debt: i128, last_update: u64, current_time: u64) -> i128 {
        if debt <= 0 || last_update >= current_time {
            return debt;
        }
        let elapsed = current_time - last_update;
        // Simple APR: debt * rate * (elapsed / 365 days)
        let interest =
            (debt * INTEREST_RATE * (elapsed as i128)) / (365 * 24 * 60 * 60 * DECIMALS as i128);
        debt + interest
    }
}

mod test;
