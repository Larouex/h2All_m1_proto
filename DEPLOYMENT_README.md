# H2All M1 - Azure Static Web Apps Deployment

This project is configured for deployment to Azure Static Web Apps with the following architecture:

## Architecture Overview

- **Frontend**: Next.js static export served by Azure Static Web Apps
- **API**: Next.js API routes deployed as Azure Functions
- **Database**: Azure Table Storage for user data and campaigns
- **Authentication**: JWT-based authentication with HTTP-only cookies

## Deployment Setup

### 1. Azure Static Web Apps Resource

Create an Azure Static Web Apps resource named "H2All-Proto" or use your existing resource.

### 2. GitHub Secrets Configuration

In your GitHub repository, go to Settings > Secrets and variables > Actions and add:

```
AZURE_STATIC_WEB_APPS_API_TOKEN_RED_HILL_057C78E1E
AZURE_STORAGE_ACCOUNT_NAME
AZURE_STORAGE_ACCOUNT_KEY
JWT_SECRET
```

### 3. Local Development

Create `.env.local` file:

```env
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_storage_account_key
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
NODE_ENV=development
```

## Build Process

The GitHub Actions workflow:

1. **Installs dependencies** with npm ci
2. **Builds the Next.js app** with static export
3. **Deploys frontend** to Azure Static Web Apps
4. **Deploys API routes** as Azure Functions

## Configuration Files

- `next.config.ts`: Next.js configuration for static export
- `staticwebapp.config.json`: Azure Static Web Apps routing and security
- `.github/workflows/azure-static-web-apps-*.yml`: Deployment workflow

## API Routes Deployment

Next.js API routes in `app/api/` are automatically converted to Azure Functions:

- `app/api/auth/login/route.ts` → `/api/auth/login`
- `app/api/auth/register/route.ts` → `/api/auth/register`
- `app/api/auth/me/route.ts` → `/api/auth/me`
- `app/api/admin/promote-user/route.ts` → `/api/admin/promote-user`

## Environment Variables in Production

Azure Static Web Apps automatically provides these environment variables to your API functions from GitHub secrets.

## Security Features

- JWT authentication with HTTP-only cookies
- Route-based authorization in `staticwebapp.config.json`
- CORS protection
- Security headers
- Admin route protection

## Troubleshooting

### Build Issues

- Ensure all dependencies are in `package.json`
- Check that API routes use Node.js runtime: `export const runtime = "nodejs"`
- Verify environment variables are set in GitHub secrets

### API Issues

- API routes are deployed as serverless functions
- Cold start latency may occur
- Check Azure Functions logs for errors

### Authentication Issues

- Verify JWT_SECRET is properly set
- Check Azure Table Storage connection
- Ensure cookies are properly configured for HTTPS

## Manual Deployment

To deploy manually:

```bash
npm ci
npm run build
# Upload 'out' folder to Azure Static Web Apps
```

## Monitoring

Monitor your deployment:

- Azure Static Web Apps dashboard
- Azure Functions logs
- GitHub Actions workflow runs
