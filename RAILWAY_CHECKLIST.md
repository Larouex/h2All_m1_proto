# Railway Deployment Checklist

## Pre-Deployment

- [ ] **Repository Ready**: Commit all changes to your GitHub repository
- [ ] **Environment Variables**: Review `.env.railway` template for required variables
- [ ] **Database Schema**: Ensure `db/schema.ts` contains all required tables
- [ ] **Health Check**: Verify `/api/health` endpoint works locally

## Railway Setup

### 1. Account Setup

- [ ] Create Railway account at [railway.app](https://railway.app)
- [ ] Connect your GitHub account
- [ ] Verify billing information (if using paid plan)

### 2. Deploy Application

- [ ] Click "Deploy from GitHub repo"
- [ ] Select `h2All_m1_proto` repository
- [ ] Wait for initial deployment (may fail - this is normal)

### 3. Add PostgreSQL Database

- [ ] In Railway project, click "New Service"
- [ ] Select "Database" → "PostgreSQL"
- [ ] Wait for database to provision
- [ ] Note the `DATABASE_URL` in environment variables

### 4. Configure Environment Variables

**Required Variables** (set in Railway service settings):

```bash
# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NEXTAUTH_SECRET=your-nextauth-secret-key-different-from-jwt

# Application
NODE_ENV=production
```

**Auto-Generated Variables** (Railway sets these automatically):

- `DATABASE_URL` (from PostgreSQL service)
- `PORT` (Railway assigns port)
- `RAILWAY_STATIC_URL` (your app domain)

### 5. Deploy and Test

- [ ] Trigger redeploy after setting environment variables
- [ ] Wait for build to complete (check logs for errors)
- [ ] Test health endpoint: `https://your-app.up.railway.app/api/health`
- [ ] Verify database connectivity in health response

## Post-Deployment Testing

### Basic Functionality

- [ ] **Health Check**: `/api/health` returns "healthy" status
- [ ] **Home Page**: Application loads without errors
- [ ] **API Endpoints**: Test key endpoints:
  - [ ] `GET /api/campaigns` (should return empty array)
  - [ ] `POST /api/subscribe` with email (should create subscription)
  - [ ] `GET /api/swagger` (should return API documentation)

### Authentication Flow

- [ ] **Registration**: Create a new user account
- [ ] **Login**: Sign in with created account
- [ ] **JWT Tokens**: Verify authentication cookies are set
- [ ] **Protected Routes**: Test admin endpoints (should require auth)

### Database Operations

- [ ] **Read Operations**: Campaigns, users list correctly
- [ ] **Write Operations**: Create campaigns, redeem codes
- [ ] **Migrations**: Database schema matches expectations

## Production Configuration

### Security

- [ ] **HTTPS**: Verify site loads over HTTPS
- [ ] **Environment Variables**: Confirm no secrets in logs
- [ ] **CORS**: Test API from different domains if needed

### Performance

- [ ] **Page Load Speed**: Test application responsiveness
- [ ] **Database Performance**: Monitor query times
- [ ] **Memory Usage**: Check Railway metrics

### Monitoring

- [ ] **Railway Logs**: Review application logs
- [ ] **Error Tracking**: Monitor for runtime errors
- [ ] **Database Monitoring**: Watch PostgreSQL performance

## Troubleshooting

### Common Issues

**Build Failures**:

- Check build logs in Railway dashboard
- Verify all dependencies in `package.json`
- Ensure environment variables are set

**Database Connection Issues**:

- Verify `DATABASE_URL` is set automatically
- Check PostgreSQL service is running
- Review database connection logs

**Environment Variable Problems**:

- Ensure `JWT_SECRET` is at least 32 characters
- Verify `NODE_ENV=production` is set
- Check for typos in variable names

### Getting Help

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Check Railway status: [status.railway.app](https://status.railway.app)

## Success Criteria

Your deployment is successful when:

- ✅ Health endpoint returns "healthy" status
- ✅ Application loads without console errors
- ✅ Database operations work correctly
- ✅ Authentication flow functions properly
- ✅ All critical API endpoints respond correctly

## Next Steps

After successful deployment:

1. **Custom Domain**: Add your domain in Railway settings
2. **Monitoring**: Set up error tracking and monitoring
3. **Backups**: Configure database backups
4. **Scaling**: Monitor usage and scale as needed
