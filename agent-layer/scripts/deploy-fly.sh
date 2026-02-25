#!/bin/bash
# Deploy script for Fly.io

set -e

echo "🚀 Deploying Agent Layer to Fly.io..."

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ fly CLI not found. Install with: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if user is logged in
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Run: fly auth login"
    exit 1
fi

# Create app if it doesn't exist
if ! fly status &> /dev/null; then
    echo "📦 Creating app..."
    fly apps create agent-layer || true
fi

# Set secrets
echo "🔐 Setting secrets..."
fly secrets set API_KEY="${API_KEY:-$(openssl rand -base64 32)}"

# Optional secrets (only if provided)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    fly secrets set SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL"
fi

if [ -n "$RESEND_API_KEY" ]; then
    fly secrets set RESEND_API_KEY="$RESEND_API_KEY"
fi

if [ -n "$FROM_EMAIL" ]; then
    fly secrets set FROM_EMAIL="$FROM_EMAIL"
fi

# Deploy
echo "🚀 Deploying..."
fly deploy --remote-only

echo "✅ Deployment complete!"
echo ""
echo "📊 Check status: fly status"
echo "📝 View logs: fly logs"
echo "🔗 Open app: fly open"
