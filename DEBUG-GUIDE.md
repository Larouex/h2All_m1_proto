# 🐛 CampaignProgress Component - Debug Session Guide

## Quick Start

1. **Run Debug Session:**

   ```bash
   ./debug-session.sh
   ```

2. **Main Debug URL:**
   ```
   http://localhost:3000/debug/campaign-progress
   ```

## Debug Features

### 🔐 Authentication Testing

- Shows current auth state (authenticated/admin status)
- Tests component behavior for different user types
- Admin edit functionality testing

### 🗄️ Database Connection

- Real-time database connectivity testing
- Connection status and environment info
- Error detection and reporting

### 🔗 API Endpoint Testing

- **GET /api/campaigns** - List all campaigns
- **GET /api/campaigns?id=X** - Get specific campaign
- **GET /api/campaigns/seed** - Create sample data
- **PUT /api/campaigns/X** - Update campaign (admin only)

### 🧩 Component Testing

- Test with valid campaign ID (`kodema-village`)
- Test with default fallback data
- Test with non-existent campaign
- Real-time component rendering

### 🔧 Debug Actions

- **Run All Tests** - Execute complete test suite
- **Refresh Page** - Reload debug session
- **Clear Debug Info** - Reset debug data
- **Open Pages** - Quick links to test pages

## Test Scenarios

### Scenario 1: Component Integration

1. Visit debug page
2. Check component renders correctly
3. Verify API calls are made
4. Test loading and error states

### Scenario 2: Admin Functionality

1. Login as admin user
2. Check edit button appears
3. Open edit modal
4. Test save functionality
5. Verify changes persist

### Scenario 3: Database Operations

1. Check database connection status
2. Run seed endpoint to create data
3. Test campaign data retrieval
4. Verify CRUD operations work

### Scenario 4: Error Handling

1. Test with invalid campaign ID
2. Test without database connection
3. Test unauthorized access
4. Verify graceful fallbacks

## Common Issues & Solutions

### Issue: Component Not Rendering

**Symptoms:** Blank space where component should be
**Solutions:**

- Check browser console for errors
- Verify import paths (`@/app/components/CampaignProgress`)
- Run `npm run lint` to check TypeScript errors

### Issue: API Calls Failing

**Symptoms:** "Failed to fetch" errors in debug info
**Solutions:**

- Check `/api/debug/database` endpoint
- Verify database connection
- Check Network tab in DevTools

### Issue: Admin Features Missing

**Symptoms:** No edit button for admin users
**Solutions:**

- Ensure user is logged in as admin
- Check auth state in debug panel
- First registered user is auto-admin

### Issue: Database Connection Problems

**Symptoms:** 503 Service Unavailable errors
**Solutions:**

- Check `DATABASE_URL` environment variable
- Verify PostgreSQL service is running
- Check Railway deployment status

## Debug Information Display

The debug page shows:

- **Authentication State**: Login status, user info, admin flag
- **System Info**: Browser, window size, current URL
- **API Status**: Response codes and data for all endpoints
- **Database Status**: Connection health and test results
- **Component Behavior**: Real-time rendering with different props

## Quick Debug Commands

```bash
# Start debug session
./debug-session.sh

# Check lint errors
npm run lint

# Build and test
npm run build

# Check database
curl http://localhost:3000/api/debug/database

# Create sample data
curl http://localhost:3000/api/campaigns/seed

# List campaigns
curl http://localhost:3000/api/campaigns
```

## Success Indicators

✅ **All Systems Working:**

- Database status shows "success"
- All API calls return 200 status
- Component renders with real data
- Admin edit functionality works
- Progress bar displays correctly

✅ **Component Integration:**

- CampaignProgress appears in all test scenarios
- Loading states work properly
- Error handling displays fallback data
- Mobile-responsive design functions

✅ **Admin Features:**

- Edit button visible for admin users
- Modal opens and closes properly
- Save operation updates database
- Changes reflect immediately

## Next Steps

After debugging session:

1. Deploy changes to production
2. Test on live environment
3. Monitor for any production issues
4. Update documentation as needed

---

**Debug Session Created:** August 6, 2025  
**Component Version:** 1.0.0  
**Last Updated:** CampaignProgress implementation
