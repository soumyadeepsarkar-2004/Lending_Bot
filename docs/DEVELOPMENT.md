# Development Guide

## Setting up Development Environment

### Prerequisites
- Rust 1.70+
- Soroban CLI
- Node.js (for integration testing)

### Build

```bash
# Build all contracts
cargo build --target wasm32-unknown-unknown --release

# Build specific contract
cd contracts/lending_bot
cargo build --target wasm32-unknown-unknown --release
```

### Testing

```bash
# Run all tests
cargo test

# Run specific contract tests
cd contracts/lending_bot
cargo test
```

### Code Structure

- `contracts/lending_bot/src/lib.rs` - Main contract implementation
- `contracts/lending_bot/tests/` - Contract integration tests
- `scripts/` - Deployment and utility scripts

## Deployment

See `scripts/deploy.sh` for automated deployment to testnet.

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests: `cargo test`
4. Build: `cargo build --target wasm32-unknown-unknown --release`
5. Submit PR
