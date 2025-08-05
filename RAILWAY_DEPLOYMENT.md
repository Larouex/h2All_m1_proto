# Railway Deployment Guide

This guide will help you deploy the H2All M1 application to Railway with 3 services: Web UX, API, and PostgreSQL Database.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Web UX        │────▶   PostgreSQL     │    │   (Optional)    │
│   (Next.js)     │    │   Database       │    │   API Service   │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Quick Deploy (Recommended)

### Option 1: Single Service Deployment (Recommended)

Deploy as one service with Next.js handling both frontend and API routes.

1. **Create Railway Account**: Visit [railway.app](https://railway.app)

2. **Deploy from GitHub**:

   - Click "Deploy from GitHub repo"
   - Select this repository
   - Railway will auto-detect the Next.js application

3. **Add PostgreSQL Database**:

   - In your Railway project, click "New Service"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

4. **Configure Environment Variables**:

   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   NEXTAUTH_SECRET=your-nextauth-secret-key
   ```

5. **Deploy**: Railway will automatically build and deploy your application.

### Option 2: Multi-Service Deployment

1. **Deploy Web Service**:

   - Use the main repository for the web service
   - Configure environment variables as above

2. **Add PostgreSQL**:

   - Add PostgreSQL service as described above

3. **Optional API Service**:
   - If you want to separate the API, create another service
   - Point to the same repository but use a different start command

## Environment Variables

Set these in your Railway service dashboard:

### Required Variables

```bash
# Database (automatically set by Railway PostgreSQL service)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NEXTAUTH_SECRET=your-nextauth-secret-key

# Application Environment
NODE_ENV=production
```

### Auto-Generated Variables

Railway automatically provides:

- `PORT` - Application port
- `RAILWAY_STATIC_URL` - Your application domain
- `DATABASE_URL` - PostgreSQL connection string (when using Railway PostgreSQL)

## Database Setup

The application will automatically:

1. Connect to the PostgreSQL database using `DATABASE_URL`
2. Run database migrations on deployment via `postbuild` script
3. Create the required tables (users, campaigns, redemption_codes, projects, subscriptions)

## Deployment Process

1. **Build Phase**:

   ```bash
   npm ci
   npm run build
   npm run db:push  # Creates/updates database schema
   ```

2. **Start Phase**:
   ```bash
   npm start  # Starts Next.js server on Railway-provided PORT
   ```

## Monitoring

- **Health Check**: Available at `/api/health`
- **Railway Logs**: View logs in Railway dashboard
- **Database**: Connect to PostgreSQL via Railway dashboard

## Custom Domain (Optional)

1. Go to your Railway service settings
2. Add your custom domain
3. Update `NEXTAUTH_URL` to your custom domain

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:

   - Ensure PostgreSQL service is running
   - Check `DATABASE_URL` is set correctly

2. **Build Failures**:

   - Check that all environment variables are set
   - Review build logs in Railway dashboard

3. **Authentication Issues**:
   - Verify `JWT_SECRET` is set
   - Ensure `NEXTAUTH_URL` matches your domain

### Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)

## Cost Estimation

**Railway Pricing (as of 2024)**:

- **Hobby Plan**: $5/month per service + usage
- **PostgreSQL**: ~$2-5/month depending on usage
- **Web Service**: ~$5-10/month depending on traffic

**Total Monthly Cost**: ~$10-20/month for a small to medium application.
