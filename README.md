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

## Deployed Smart Contract

**Contract ID**: `CCKQU7RZS4PKK25VRZFT7HXAQJ2IX43IJMRUPMAKVKRDJGAP4GJZDRL6Q`  
**Network**: Stellar Testnet (Protocol 22+)  

> **Note**: Contract addresses on Stellar Testnet may need redeployment after testnet upgrades. If the address is no longer active, follow the deployment instructions below to deploy your own instance.

### Deployment Screenshot
![Deployed Contract Screenshot](./Screenshot%202026-03-19%20150103.png)

---

### Getting Started

#### Quick Links
- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup, building, and testing
- **[API Documentation](./docs/API.md)** - Contract methods and usage examples
- **[Deployment Script](./scripts/deploy.sh)** - Automated deployment to testnet

#### Prerequisites
- Rust 1.70+ with `wasm32-unknown-unknown` target
- Soroban CLI
- Node.js (for testing interactions)

#### Build Instructions
```bash
# cd into the contract directory
cd contracts/lending_bot

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Run tests (if any)
cargo test

# Deploy to Testnet
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/lending_bot.wasm \
  --source YOUR_ACCOUNT_SECRET \
  --network testnet
```

#### After Deployment

Once deployed, you'll receive a **Contract ID**. You can verify it on Stellar.Expert:
```
https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID
```

To interact with the contract or verify it's deployed:
```bash
soroban contract info --id YOUR_CONTRACT_ID --network testnet
```

### Project Structure
```
Lending_Bot/
├── contracts/
│   ├── src/
│   │   └── lib.rs        # Smart contract implementation
│   ├── tests/            # Integration tests
│   └── Cargo.toml        # Contract package config
├── docs/
│   ├── DEVELOPMENT.md    # Development guide
│   └── API.md            # Contract API documentation
├── scripts/
│   ├── deploy.sh         # Deployment script
│   └── test.sh           # Test runner script
├── Cargo.toml            # Workspace root config
├── .gitignore            # Git ignore rules
├── .prettierignore       # Prettier ignore rules
├── LICENSE               # MIT License
├── README.md             # This file
└── Screenshot 2026...    # Deployment proof
```

## Directory Overview

- **`contracts/`** - Smart contract source code and tests
- **`docs/`** - Documentation (development guide & API reference)
- **`scripts/`** - Utility scripts for deployment and testing

### Contract Methods

- **`init(admin, token_id)`** - Initialize the lending pool
- **`deposit(amount)`** - Deposit tokens into the pool
- **`withdraw(amount)`** - Withdraw tokens from the pool
- **`get_balance(lender)`** - Check lender's current balance

---

### License
MIT License - Feel free to use this code for your projects!
