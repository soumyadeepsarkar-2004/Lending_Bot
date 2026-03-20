# Contributing to Lending_Bot

Thank you for your interest in contributing to the Lending_Bot project! Here are guidelines for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Lending_Bot.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `cargo test --all`
6. Build the contract: `cargo build --target wasm32-unknown-unknown --release`
7. Commit your changes with clear messages
8. Push to your fork and submit a pull request

## Development Requirements

- Rust 1.70+
- Soroban CLI
- Node.js (optional, for integration testing)

## Code Style

- Follow Rust naming conventions
- Use meaningful variable and function names
- Add documentation comments for public functions
- Run `cargo fmt` before committing

## Testing

- Write tests for new features
- Run `cargo test` to verify all tests pass
- Ensure the contract compiles without warnings

## Reporting Issues

If you find a bug, please:
1. Check if the issue already exists
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Your environment details

## Pull Request Process

1. Update documentation as needed
2. Add tests for new features
3. Ensure all tests pass
4. Provide a clear PR description
5. Link any related issues

Thank you for contributing!
