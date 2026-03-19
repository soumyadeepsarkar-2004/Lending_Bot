#!/bin/bash
# Deploy script for Lending Bot contract

set -e

NETWORK="${1:-testnet}"
SOURCE_SECRET="${2}"

if [ -z "$SOURCE_SECRET" ]; then
    echo "Usage: ./deploy.sh [network] [source_secret]"
    echo "Example: ./deploy.sh testnet SBXXXXXXX..."
    exit 1
fi

echo "🚀 Building Lending Bot contract..."
cargo build --target wasm32-unknown-unknown --release

WASM_FILE="target/wasm32-unknown-unknown/release/lending_bot.wasm"

echo "📦 Deploying to $NETWORK..."
CONTRACT_ID=$(soroban contract deploy \
    --wasm "$WASM_FILE" \
    --source "$SOURCE_SECRET" \
    --network "$NETWORK" \
    2>&1 | grep -oP '(?<=Contract ID: )[^"]*' || echo "")

if [ -z "$CONTRACT_ID" ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Contract deployed successfully!"
echo "📄 Contract ID: $CONTRACT_ID"
echo "🔗 View on Stellar.Expert: https://stellar.expert/explorer/$NETWORK/contract/$CONTRACT_ID"