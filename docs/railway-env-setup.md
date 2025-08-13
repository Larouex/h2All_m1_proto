# Railway Environment Variables Setup

## Required Environment Variables for API Security

To complete Step 2 of the API security implementation, add these environment variables to your Railway project:

### 1. ALLOWED_ORIGINS

**Description:** Comma-separated list of allowed origins for CORS validation
**Production Value:**

```
https://h2allm1monitor-production.up.railway.app,https://h2all-ux-and-api-service-production.up.railway.app,https://redeem.h2all.com
```

### 2. API_KEY

**Description:** Secure API key for protected endpoints
**Production Value:** Generate a secure random string (minimum 32 characters)

### 3. NEXT_PUBLIC_API_KEY

**Description:** Frontend API key for client-side requests (publicly visible)
**Production Value:** Same as API_KEY (for domain-restricted endpoints)

## How to Set Railway Environment Variables

### Option 1: Railway Dashboard

1. Go to your Railway project dashboard
2. Navigate to the "Variables" tab
3. Add each variable with its corresponding value
4. Deploy the changes

### Option 2: Railway CLI

```bash
# Set allowed origins
railway variables set ALLOWED_ORIGINS="https://h2allm1monitor-production.up.railway.app,https://h2all-ux-and-api-service-production.up.railway.app,https://redeem.h2all.com"

# Set API key (generate a secure random string)
railway variables set API_KEY="your_secure_32_character_api_key_here"

# Set frontend API key (same value, publicly visible)
railway variables set NEXT_PUBLIC_API_KEY="your_secure_32_character_api_key_here"
```

### Option 3: Environment Variables File Upload

Create a production `.env` file and upload it through Railway dashboard:

```env
ALLOWED_ORIGINS=https://h2allm1monitor-production.up.railway.app,https://h2all-ux-and-api-service-production.up.railway.app,https://redeem.h2all.com
API_KEY=your_secure_32_character_api_key_here
NEXT_PUBLIC_API_KEY=your_secure_32_character_api_key_here
```

## Security Best Practices

1. **API Key Generation:** Use a cryptographically secure random generator

   ```bash
   # Generate a secure API key
   openssl rand -hex 32
   ```

2. **Origin Validation:** Only include trusted domains in ALLOWED_ORIGINS

3. **Environment Separation:** Use different API keys for development and production

## Verification

After setting the environment variables:

1. Deploy your Railway application
2. Test the API security with a protected endpoint
3. Verify CORS headers are properly set
4. Confirm unauthorized requests are blocked

## Next Steps

Once Railway environment variables are set:

- Proceed to Step 3: Create security wrapper function
- Test with /api/health endpoint
- Gradually secure other endpoints
