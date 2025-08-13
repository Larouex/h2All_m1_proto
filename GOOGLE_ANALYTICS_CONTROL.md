# Google Analytics Control for Load Testing

This feature allows you to disable Google Analytics on the public pages (`/claim`, `/emailclaim`, `/track`) during load testing to prevent test traffic from skewing analytics data.

## Environment Variable

Add the following environment variable to disable Google Analytics:

```bash
NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS=true
```

## How It Works

The `GoogleAnalytics` component checks two conditions before loading:

1. `NODE_ENV === "production"` (only loads in production)
2. `NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS !== "true"` (not explicitly disabled)

## Usage Scenarios

### For Load Testing

Set the environment variable to `true`:

```bash
NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS=true
```

### For Normal Production

Set the environment variable to `false` or omit it entirely:

```bash
NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS=false
```

## Pages Affected

This setting affects the following pages that include the `GoogleAnalytics` component:

- `/claim` - Initial bottle claim page
- `/emailclaim` - Email capture page
- `/track` - Impact tracking page

## Implementation Details

The `GoogleAnalytics` component is only included on public-facing pages where we track user interactions. Admin pages and API endpoints are not affected by this setting.

## Railway Deployment

When deploying to Railway, you can set this variable in the Railway dashboard:

1. Go to your project settings
2. Navigate to Variables tab
3. Add `NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS` with value `true` for testing
4. Redeploy the application

## Local Testing

You can test this locally by:

1. Setting `NODE_ENV=production`
2. Setting `NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS=true`
3. Building and starting the production server:
   ```bash
   npm run build
   npm start
   ```

The Google Analytics scripts should not load when the variable is set to `true`.
