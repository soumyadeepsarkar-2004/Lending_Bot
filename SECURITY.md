# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in Lending_Bot, please email the maintainers privately instead of using the issue tracker. This allows us to fix the issue before it's disclosed publicly.

**Security contact**: Please file an issue marked as "security" for visibility to maintainers.

## Security Considerations

### Current Limitations
- Contract is deployed on Stellar Testnet for demonstration purposes
- Fully tested security audit not yet completed
- Use at your own risk on production networks

### Best Practices for Users

1. **Admin Keys**: Store admin private keys securely using a hardware wallet or secure key management system
2. **Token Verification**: Always verify token addresses before interacting with the contract
3. **Testing**: Test interactions on testnet before moving to production
4. **Authorization**: The contract enforces authorization checks via `require_auth()`
5. **Balance Validation**: Withdrawal validates sufficient balance before transfer

### Contract Security Features

- **Authorization Enforcement**: All sensitive operations require caller authorization
- **Persistent Storage**: User balances are stored securely in Soroban persistent storage
- **Atomic Transactions**: Deposit and withdrawal operations are atomic (all-or-nothing)
- **Token Interface Compliance**: Uses standard Soroban Token Interface for safe token transfers

## Known Issues

None currently known. Please report any security concerns responsibly.

## Security Updates

We will release security patches as needed. Monitor releases for important updates.

## Disclaimer

This contract is provided as-is for educational and demonstration purposes. The developers make no guarantee of its correctness or security. Use at your own risk.
