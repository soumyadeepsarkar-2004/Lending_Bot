#!/bin/bash
# Test script for Lending Bot

set -e

echo "🧪 Running tests..."
cargo test --all

echo "✅ All tests passed!"
