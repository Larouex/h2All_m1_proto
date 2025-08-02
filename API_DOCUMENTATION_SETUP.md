# API Documentation & Testing Setup

This document describes the comprehensive API documentation and testing infrastructure added to the H2All M1 project.

## 🎯 Features Added

### 1. Swagger/OpenAPI Documentation

- **Complete API Documentation**: All endpoints documented with OpenAPI 3.0 specification
- **Interactive Testing**: Try-it-out functionality for all API endpoints
- **Schema Definitions**: Comprehensive request/response schemas
- **Live Documentation**: Auto-updated documentation with code changes

### 2. VS Code Debug Integration

- **F5 Debug Launch**: Automatically opens API documentation when debugging
- **Multiple Launch Configurations**: Different debug modes for server and client
- **Test Page Auto-Open**: Opens campaign test page automatically during debug sessions

### 3. Comprehensive Testing Pages

- **Interactive API Test Page**: Full-featured testing interface for campaigns and redemption codes
- **Database Test Endpoints**: Automated testing of all database operations
- **Navigation Integration**: Easy access from home page

## 📁 Files Created/Modified

### New API Documentation Files

```
src/lib/swagger.ts              - Swagger/OpenAPI configuration
src/app/api-docs/page.tsx       - Swagger UI React component
src/app/api/swagger/route.ts    - API endpoint serving OpenAPI spec
```

### Enhanced API Routes (with Swagger docs)

```
src/app/api/campaigns/route.ts      - Campaign CRUD with full documentation
src/app/api/redemption-codes/route.ts - Redemption system with full documentation
```

### Testing Infrastructure

```
public/test-campaign-api.html    - Interactive API testing page
src/app/api/test/route.ts       - Database testing endpoints
```

### VS Code Configuration

```
.vscode/launch.json             - Debug configurations with API docs auto-open
.vscode/tasks.json              - Tasks for launching test pages
```

### Navigation Updates

```
src/app/page.tsx               - Added developer resources section
```

## 🚀 Usage

### Starting Development with API Documentation

1. **Press F5** in VS Code to start debugging

   - Automatically launches Next.js development server
   - Opens API documentation at `http://localhost:3000/api-docs`
   - Opens campaign test page in separate tab

2. **Alternative Launch Methods**:
   ```bash
   npm run dev
   # Then navigate to http://localhost:3000/api-docs
   ```

### API Documentation Access

- **Main Documentation**: `http://localhost:3000/api-docs`
- **OpenAPI Spec JSON**: `http://localhost:3000/api/swagger`
- **Interactive Test Page**: `http://localhost:3000/test-campaign-api.html`
- **Database Tests**: `http://localhost:3000/api/test`

### From Home Page

- Developer Resources card provides quick access to:
  - 📚 API Documentation
  - 🧪 API Test Page
  - ⚡ Database Tests

## 📋 API Endpoints Documented

### Campaigns API (`/api/campaigns`)

- **GET**: List campaigns or get specific campaign
  - Query params: `id`, `isActive`
- **POST**: Create new campaign
- **PUT**: Update campaign (requires `id` param)
- **DELETE**: Delete campaign (requires `id` param)

### Redemption Codes API (`/api/redemption-codes`)

- **GET**: List codes or get specific code
  - Query params: `id`, `campaignId`, `code`, `isUsed`
- **POST**: Generate codes or redeem a code
  - For generation: Body with `campaignId`, `quantity`
  - For redemption: Query param `action=redeem`, body with code details

### Testing & Utilities

- **GET/POST** `/api/test`: Database operations testing
- **GET** `/api/swagger`: OpenAPI specification
- **GET** `/api-docs`: Interactive documentation page

## 🔧 VS Code Debug Configurations

### Available Launch Configurations:

1. **Launch Next.js Development Server**

   - Starts Node.js server with debugging
   - Auto-opens API documentation
   - Runs background task to open test pages

2. **Debug Next.js Client**

   - Chrome debugging for client-side code
   - Opens API docs directly
   - Full source map support

3. **Launch API Documentation**
   - Direct launch to API docs
   - Includes pre-launch task to start server

### Tasks Available:

- `start-dev-server`: Background dev server start
- `open-test-pages`: Opens additional test pages
- `open-campaign-test-page`: Opens campaign test page

## 🧪 Testing Workflow

### 1. Automated Database Testing

```bash
# Test all database operations
curl http://localhost:3000/api/test

# Test specific operations
curl "http://localhost:3000/api/test?operation=campaign" -X POST
curl "http://localhost:3000/api/test?operation=codes" -X POST
curl "http://localhost:3000/api/test?operation=redemption" -X POST
```

### 2. Interactive API Testing

1. Navigate to `http://localhost:3000/test-campaign-api.html`
2. Use forms to create campaigns and generate codes
3. Test redemption flow with generated codes
4. View real-time results and error handling

### 3. Swagger UI Testing

1. Go to `http://localhost:3000/api-docs`
2. Expand API sections to view documentation
3. Use "Try it out" button on any endpoint
4. Fill in parameters and execute requests
5. View responses with syntax highlighting

## 📊 Schema Definitions

### Campaign Schema

```json
{
  "id": "string",
  "name": "string",
  "redemptionValue": "number",
  "isActive": "boolean",
  "createdAt": "date-time",
  "expiresAt": "date-time",
  "description": "string",
  "maxRedemptions": "integer",
  "currentRedemptions": "integer"
}
```

### Redemption Code Schema

```json
{
  "id": "string",
  "campaignId": "string",
  "uniqueCode": "string",
  "isUsed": "boolean",
  "redeemedAt": "date-time|null",
  "userId": "string|null",
  "userEmail": "string|null",
  "createdAt": "date-time"
}
```

## 🎨 Swagger UI Features

- **Deep Linking**: Shareable URLs for specific API sections
- **Try It Out**: Execute API calls directly from documentation
- **Schema Explorer**: Interactive schema browsing
- **Request/Response Examples**: Comprehensive examples for all endpoints
- **Authentication Support**: Ready for future auth implementation
- **Responsive Design**: Works on desktop and mobile devices

## ⚙️ Environment Setup

### Required Environment Variables

```bash
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account
AZURE_STORAGE_ACCOUNT_KEY=your_storage_key
```

### Dependencies Added

```json
{
  "swagger-ui-react": "^5.27.1",
  "swagger-jsdoc": "^6.2.8",
  "@types/swagger-ui-react": "^4.18.3",
  "@types/swagger-jsdoc": "^6.0.4"
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Swagger UI not loading**

   - Check if `/api/swagger` endpoint returns JSON
   - Verify swagger-ui-react dependencies installed
   - Check browser console for errors

2. **API tests failing**

   - Ensure Azure Storage environment variables are set
   - Check if tables exist (run database status check)
   - Verify network connectivity

3. **Debug configuration not opening docs**
   - Check if port 3000 is available
   - Verify VS Code tasks are properly configured
   - Ensure Next.js server starts successfully

### Debug Commands

```bash
# Check API spec generation
curl http://localhost:3000/api/swagger

# Test database connectivity
curl http://localhost:3000/api/test

# Verify build
npm run build
```

## 🎉 Next Steps

1. **Add Authentication**: Integrate user authentication into Swagger docs
2. **Rate Limiting**: Document API rate limits and usage policies
3. **Versioning**: Add API versioning support
4. **Monitoring**: Add API usage analytics and monitoring
5. **Export Options**: Add OpenAPI spec download options

This comprehensive API documentation and testing setup provides a professional development experience with full visibility into the H2All M1 campaign and redemption code system.
