#!/bin/bash
# Admin Bootstrap Setup Script
# This script sets up the required environment variables for the admin bootstrap endpoint.
# Run this once to configure the bootstrap, then call the bootstrap API.

set -e

echo "=== Admin Bootstrap Setup ==="
echo ""

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "Error: vercel CLI is not installed"
    echo "Install with: npm install -g vercel"
    exit 1
fi

# Get the service role key
echo "Please enter your Supabase Service Role Key"
echo "(Find it in Supabase Dashboard → Settings → API → service_role)"
read -sp "Service Role Key: " SERVICE_ROLE_KEY
echo ""

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "Error: Service role key is required"
    exit 1
fi

# Get the admin email
echo ""
echo "Enter the email address for the first admin user"
echo "(This user must have already signed up via /signin)"
read -p "Admin Email: " ADMIN_EMAIL

if [ -z "$ADMIN_EMAIL" ]; then
    echo "Error: Admin email is required"
    exit 1
fi

# Generate bootstrap token
BOOTSTRAP_TOKEN=$(openssl rand -hex 32)

echo ""
echo "Setting environment variables in Vercel..."

# Set env vars for production
echo "$SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production --yes 2>/dev/null || \
    echo "$SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production 2>/dev/null || true

echo "$BOOTSTRAP_TOKEN" | vercel env add ADMIN_BOOTSTRAP_TOKEN production --yes 2>/dev/null || \
    echo "$BOOTSTRAP_TOKEN" | vercel env add ADMIN_BOOTSTRAP_TOKEN production 2>/dev/null || true

echo "$ADMIN_EMAIL" | vercel env add ADMIN_BOOTSTRAP_EMAIL production --yes 2>/dev/null || \
    echo "$ADMIN_EMAIL" | vercel env add ADMIN_BOOTSTRAP_EMAIL production 2>/dev/null || true

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Environment variables have been set in Vercel."
echo ""
echo "Next steps:"
echo "1. Deploy the latest code: vercel --prod"
echo "2. Make sure you have signed up at https://mcp-registry-mu.vercel.app/signin"
echo "3. Call the bootstrap endpoint:"
echo ""
echo "   curl -X POST https://mcp-registry-mu.vercel.app/api/admin/bootstrap \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'x-bootstrap-token: $BOOTSTRAP_TOKEN' \\"
echo "     -d '{\"email\": \"$ADMIN_EMAIL\"}'"
echo ""
echo "Save this token - you'll need it for the bootstrap call:"
echo "BOOTSTRAP_TOKEN=$BOOTSTRAP_TOKEN"
echo ""
