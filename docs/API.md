# API Documentation

## Contract Methods

### `init(env: Env, admin: Address, token_id: Address)`
Initializes the lending pool with a specific token.

**Parameters:**
- `admin: Address` - Admin account address
- `token_id: Address` - Stellar Asset Contract token address (e.g., USDC)

**Auth:** Requires admin authorization

**Example:**
```bash
soroban contract invoke \
  --id {CONTRACT_ID} \
  --source {ADMIN_SECRET} \
  --network testnet \
  -- init \
  --admin {ADMIN_ADDRESS} \
  --token_id {TOKEN_ADDRESS}
```

---

### `deposit(env: Env, lender: Address, amount: i128)`
Deposits tokens into the lending pool.

**Parameters:**
- `lender: Address` - Lender account address
- `amount: i128` - Amount of tokens to deposit (in smallest unit)

**Auth:** Requires lender authorization

**Returns:** None

**Example:**
```bash
soroban contract invoke \
  --id {CONTRACT_ID} \
  --source {LENDER_SECRET} \
  --network testnet \
  -- deposit \
  --lender {LENDER_ADDRESS} \
  --amount 1000000
```

---

### `withdraw(env: Env, lender: Address, amount: i128)`
Withdraws tokens from the lending pool.

**Parameters:**
- `lender: Address` - Lender account address
- `amount: i128` - Amount of tokens to withdraw

**Auth:** Requires lender authorization

**Errors:**
- `"Insufficient balance"` - If lender's balance < withdrawal amount

**Example:**
```bash
soroban contract invoke \
  --id {CONTRACT_ID} \
  --source {LENDER_SECRET} \
  --network testnet \
  -- withdraw \
  --lender {LENDER_ADDRESS} \
  --amount 500000
```

---

### `get_balance(env: Env, lender: Address) -> i128`
Retrieves the current balance of a lender.

**Parameters:**
- `lender: Address` - Lender account address

**Returns:** 
- `i128` - Current balance (0 if no balance exists)

**Example:**
```bash
soroban contract invoke \
  --id {CONTRACT_ID} \
  --network testnet \
  -- get_balance \
  --lender {LENDER_ADDRESS}
```

---

## Data Types

- `Address` - Stellar account address (56 characters starting with 'C' for contracts, 'G' for accounts)
- `i128` - 128-bit signed integer (used for token amounts and balances)
