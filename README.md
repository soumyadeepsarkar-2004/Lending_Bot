# Lending_Bot 🤖🏦

A lightweight, high-performance decentralized lending protocol built on **Stellar Soroban**. This project enables users to participate in automated liquidity provision and peer-to-peer lending with the safety and speed of Rust-based smart contracts.

## Project Description
**Lending_Bot** is a Soroban-native smart contract designed to bridge the gap between casual lenders and automated yield strategies. By utilizing Stellar's low-latency network, it provides a seamless way for users to deposit assets into a managed pool, which can then be utilized for automated lending operations or liquidity bootstrapping.

## What it does
The contract acts as a decentralized vault. It manages the accounting of user deposits, handles the secure transfer of Stellar Asset Contract (SAC) tokens, and maintains a persistent state of lender balances. It serves as the backend engine for a bot-driven lending strategy where liquidity is deployed dynamically to maximize returns.

## Features
* **Secure Deposits**: Direct integration with the Soroban Token Interface for safe asset handling.
* **Persistent Accounting**: Uses Soroban’s `persistent` storage to ensure user balances are recorded across ledger upgrades.
* **Atomic Transactions**: Guaranteed "all-or-nothing" execution for deposits and withdrawals, preventing fund loss.
* **Admin Control**: Initializable state to set specific lending assets (e.g., USDC, XLM).
* **Efficient Gas Usage**: Optimized Rust code to minimize resource fees on the Stellar network.

## Deployed Smart Contract Link
**Contract ID**: `CC7...YOUR_DEPLOYED_ADDRESS_HERE`  
**Network**: Stellar Testnet (Protocol 22+)  
**Explorer**: [View on Stellar.Expert](https://stellar.expert/explorer/testnet/contract/YOUR_DEPLOYED_ADDRESS_HERE)

---

### Getting Started
1. **Build**: `cargo build --target wasm32-unknown-unknown --release`
2. **Test**: `cargo test`
3. **Deploy**: `soroban contract deploy --wasm target/wasm32-unknown-unknown/release/lending_bot.wasm --source your_account --network testnet`
