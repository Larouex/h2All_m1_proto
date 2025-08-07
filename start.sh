#!/bin/bash

echo "🚀 Starting H2All application..."

# Run database migrations (only if DATABASE_URL is available)
if [ -n "$DATABASE_URL" ]; then
    echo "📊 Running database migrations..."
    npm run db:push
    echo "✅ Database migrations completed"
else
    echo "⚠️  No DATABASE_URL found, skipping migrations"
fi

# Start the application
echo "🌟 Starting Next.js server..."
exec node server.js
