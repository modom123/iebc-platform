#!/bin/bash
# Push all env vars from .env.local to Vercel.
# Run from the project root: bash scripts/set-vercel-env.sh
# Requires: vercel CLI (npm i -g vercel) and logged in (vercel login)

set -e
cd "$(dirname "$0")/.."

if [ ! -f .env.local ]; then
  echo "Error: .env.local not found. Run from the project root."
  exit 1
fi

# Load .env.local
export $(grep -v '^#' .env.local | grep -v '^$' | xargs)

PROJECT="iebusinessconsultants"
ENVS=("production" "preview" "development")

add_env() {
  local key="$1"
  local value="${!key}"
  if [ -z "$value" ]; then
    echo "⏭  Skipping $key (empty)"
    return
  fi
  for env in "${ENVS[@]}"; do
    vercel env rm "$key" "$env" --yes --project "$PROJECT" 2>/dev/null || true
    echo "$value" | vercel env add "$key" "$env" --yes --project "$PROJECT"
  done
  echo "✅  $key"
}

echo "Pushing env vars to Vercel project: $PROJECT"
echo "---"

add_env NEXT_PUBLIC_SUPABASE_URL
add_env NEXT_PUBLIC_SUPABASE_ANON_KEY
add_env SUPABASE_SERVICE_ROLE_KEY
add_env STRIPE_SECRET_KEY
add_env NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
add_env STRIPE_WEBHOOK_SECRET
add_env STRIPE_PRICE_SILVER
add_env STRIPE_PRICE_GOLD
add_env STRIPE_PRICE_PLATINUM
add_env NEXT_PUBLIC_STRIPE_LINK_SILVER
add_env NEXT_PUBLIC_STRIPE_LINK_GOLD
add_env NEXT_PUBLIC_STRIPE_LINK_PLATINUM
add_env NEXT_PUBLIC_APP_URL
add_env NOTIFY_EMAIL
add_env RESEND_API_KEY
add_env ELEVENLABS_API_KEY
add_env ANTHROPIC_API_KEY
add_env PLAID_CLIENT_ID
add_env PLAID_SECRET
add_env PLAID_ENV

echo ""
echo "---"
echo "All done. Triggering production redeploy..."
vercel --prod --project "$PROJECT" --yes
