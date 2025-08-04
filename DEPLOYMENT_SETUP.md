# Environment Variables for Azure Static Web Apps Deployment

This file documents the environment variables and GitHub secrets needed for deployment.

## Required GitHub Secrets

Set these in your repository settings under Settings > Secrets and variables > Actions:

### Azure Static Web Apps

- `AZURE_STATIC_WEB_APPS_API_TOKEN_RED_HILL_057C78E1E`: The deployment token from your Azure Static Web App resource

### Application Configuration

- `AZURE_STORAGE_ACCOUNT_NAME`: Your Azure Storage account name for user data
- `AZURE_STORAGE_ACCOUNT_KEY`: Your Azure Storage account access key
- `JWT_SECRET`: Secret key for JWT token generation (generate a random 32+ character string)

## Local Development (.env.local)

For local development, create a `.env.local` file with:

```env
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_storage_account_key
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
NODE_ENV=development
```

## Production Environment Variables

These will be automatically set by Azure Static Web Apps from the GitHub secrets during deployment.

## Security Notes

- Never commit actual secret values to the repository
- Use strong, randomly generated secrets for JWT_SECRET
- Regularly rotate your Azure Storage account keys
- Ensure your Azure Storage account has appropriate access controls
