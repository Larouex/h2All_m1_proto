# Simple Railway setup script

# Run this if Railway Dashboard deployment isn't working

echo "Setting up Railway deployment manually..."

# 1. Create a new PostgreSQL database on Railway

echo "1. Create PostgreSQL database in Railway Dashboard"
echo "2. Copy the DATABASE_URL from the database"
echo "3. Set environment variables in Railway:"
echo " - DATABASE_URL=<your-postgres-url>"
echo " - JWT_SECRET=<random-secret>"
echo " - NEXTAUTH_SECRET=<random-secret>"
echo " - NEXTAUTH_URL=<your-railway-domain>"

# 2. Deploy using railway.json only

echo "4. Deploy using simple railway.json configuration"
