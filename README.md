# H2All M1 - Campaign and Redemption System

A Next.js application for managing campaigns, redemption codes, and user engagement with a clean separation between user experience and administrative functionality.

## 🚀 Overview

H2All M1 is a comprehensive platform that provides:

- **Clean user redemption flow** for tracking purchases and impact
- **Comprehensive admin dashboard** for campaign management
- **Full API documentation** with Swagger integration
- **Real-time database operations** with Azure Data Tables
- **Interactive testing tools** for development and QA

## ⚡ Quick Start

**For Project Managers**:

- 📋 **[Complete PM Guide](./PROJECT_MANAGER_GUIDE.md)** - Comprehensive project management documentation
- 🎛️ **[Admin Dashboard](http://localhost:3000/admin)** - Campaign creation and analytics
- 📊 **[System Analytics](http://localhost:3000/admin/data)** - Performance metrics and reporting

**For Developers**:

- 🛠️ **[Developer Guide](./DEVELOPER_GUIDE.md)** - Complete contribution and development guide
- ⚡ **Quick Start**: `npm install && npm run dev`
- 📚 **[API Documentation](http://localhost:3000/admin/api-docs)** - Interactive Swagger UI
- 🧪 **[Test Suite](http://localhost:3000/test-redemption-api.html)** - Comprehensive API testing

**For QA/Testing**:

- 🧪 **[Testing Guide](./TESTING_GUIDE.md)** - Complete end-to-end testing procedures
- ✅ **[Pre-Release Checklist](./TESTING_GUIDE.md#pre-release-testing-checklist)** - Critical validation steps
- 🔍 **[System Health](http://localhost:3000/api/health)** - Real-time system status

**Key Features**:

- 🏗️ **Campaign Management**: Create campaigns with redemption codes (1M+ codes/second generation)
- 🔗 **UTM Tracking**: Multi-channel marketing with detailed analytics
- 🍪 **Cookie Persistence**: Campaign data tracking across user sessions
- 📊 **Real-time Analytics**: Dashboard with performance metrics and reporting
- 🔒 **Secure**: Cryptographically secure code generation and validation
- 📱 **Mobile-First**: Responsive design optimized for all devices

## 📖 Documentation Overview

This repository includes comprehensive documentation for different roles:

- **[📋 Project Manager Guide](./PROJECT_MANAGER_GUIDE.md)** - Business workflows, campaign management, analytics, and troubleshooting
- **[🛠️ Developer Guide](./DEVELOPER_GUIDE.md)** - Architecture, API development, testing, and contribution guidelines
- **[🧪 Testing Guide](./TESTING_GUIDE.md)** - End-to-end testing procedures, validation checklists, and quality assurance

## 📋 Table of Contents

- [Role-Specific Documentation](#role-specific-documentation)
- [Architecture](#architecture)
- [Admin Dashboard](#admin-dashboard)
- [API Documentation](#api-documentation)
- [Quick Start](#quick-start)
- [Development](#development)

## 📚 Role-Specific Documentation

### **For Project Managers**

- **[📋 Project Manager Guide](./PROJECT_MANAGER_GUIDE.md)** - Complete PM documentation covering system overview, workflows, analytics, and troubleshooting

### **For Developers**

- **[🛠️ Developer Guide](./DEVELOPER_GUIDE.md)** - Comprehensive development guide including architecture, API patterns, testing, and contribution workflow

### **For QA & Testing**

- **[🧪 Testing Guide](./TESTING_GUIDE.md)** - End-to-end testing procedures, automated test suites, and pre-release validation

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15.4.5 with React 19
- **Styling**: React Bootstrap 5
- **Database**: Azure Data Tables
- **API**: RESTful endpoints with OpenAPI 3.0 documentation
- **TypeScript**: Full type safety throughout

### Core Features

- **Campaign Management**: Create and manage promotional campaigns
- **Code Generation**: Cryptographically secure redemption codes (1M+ codes/second)
- **User Authentication**: Login/register with balance tracking
- **Real-time Analytics**: Dashboard with system metrics
- **Mobile-First Design**: Responsive across all devices

## 🔧 Admin Dashboard

Access the comprehensive admin interface at `/admin`

### Key Admin Features

- **Campaign Manager** (`/admin/campaigns`) - CRUD operations for campaigns
- **Code Manager** (`/admin/codes`) - Bulk code generation and tracking
- **User Management** (`/admin/users`) - User accounts and activity
- **Data Management** (`/admin/data`) - System analytics and export tools
- **API Documentation** (`/admin/api-docs`) - Interactive Swagger UI

## 📚 API Documentation

### Core Endpoints

- **Campaigns API** (`/api/campaigns`) - Campaign CRUD operations
- **Redemption Codes API** (`/api/redemption-codes`) - Code generation and listing
- **Validation API** (`/api/campaigns/validate`) - Pre-redemption validation
- **Redemption API** (`/api/campaigns/redeem`) - Secure code redemption with authentication
- **User Management** (`/api/users`, `/api/login`, `/api/register`) - User operations

### Interactive Testing

- **Swagger UI** (`/admin/api-docs`) - Try APIs directly in browser
- **Test Interfaces** - HTML-based testing tools for validation and redemption
- **Database Health** - Automated testing and validation endpoints

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Azure Data Tables connection (optional for development)

### Installation

```bash
# Clone and setup
git clone https://github.com/Larouex/h2All_m1_proto.git
cd h2All_m1_proto/h2all-m1

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your Azure Storage connection string

# Start development server
npm run dev
```

**Access Points:**

- **Application**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **API Documentation**: [http://localhost:3000/admin/api-docs](http://localhost:3000/admin/api-docs)

## 🛠️ Development

### VS Code Integration

- **F5 Debugging** - Automatically opens admin dashboard
- **Launch Configurations** - Pre-configured for Next.js development
- **Task Integration** - Build and test automation

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

### API Development

- **OpenAPI Schema** - Defined in `src/lib/swagger.ts`
- **Route Handlers** - Located in `src/app/api/`
- **Type Definitions** - Centralized in `src/types/`

### Database Schema

### API Usage Examples

#### Generate Redemption Codes

```bash
curl -X POST "http://localhost:3000/api/redemption-codes" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "1754169423931-stp6rpgli",
    "quantity": 10
  }'
```

**Response:**

```json
{
  "campaignId": "1754169423931-stp6rpgli",
  "codesGenerated": 10,
  "codes": ["OVXQYE0I", "YMH4G39U", "XMIFRT8Y", "1CD79ENZ", "KA6WSJK6"],
  "success": true
}
```

#### Redeem a Code

```bash
curl -X POST "http://localhost:3000/api/redeem" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "1754169423931-stp6rpgli",
    "code": "YMH4G39U",
    "userEmail": "user@example.com"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Code redeemed successfully",
  "redemption": {
    "code": "YMH4G39U",
    "redemptionValue": 25,
    "campaign": {
      "name": "Test Campaign for Code Generation"
    }
  }
}
```

#### Create a Campaign

```bash
curl -X POST "http://localhost:3000/api/campaigns" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer 2025 Promotion",
    "description": "Get $25 off your next purchase",
    "redemptionValue": 25,
    "maxRedemptions": 1000,
    "expiresAt": "2025-12-31T23:59:59.999Z"
  }'
```

### Database Schema

```typescript
// Campaign Entity
interface Campaign {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  redemptionCodeLength: number;
  maxRedemptions: number;
  currentRedemptions: number;
}

// Redemption Code Entity
interface RedemptionCode {
  id: string;
  code: string;
  campaignId: string;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: string;
  expiresAt: string;
}

// User Entity
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin?: string;
  registrationDate: string;
}
```

## 🚀 Deployment

### Build Optimization

- **Static Generation** - Pre-rendered pages for optimal performance
- **Code Splitting** - Automatic route-based splitting
- **Bundle Analysis** - Optimized chunk sizes

### Production Considerations

- **Environment Variables** - Configure Azure connections
- **Authentication** - Implement admin access controls
- **Security** - Add rate limiting and validation
- **Monitoring** - Set up logging and analytics

### Deployment Platforms

- **Vercel** - Recommended for Next.js applications
- **Azure App Service** - Full integration with Azure services
- **Docker** - Containerized deployment option

## 🔒 Security

### Current Implementation

- ✅ TypeScript type safety
- ✅ Input validation schemas
- ✅ Error handling and logging
- ✅ CORS configuration

### Production Requirements

- 🔒 Admin authentication middleware
- 🔒 Role-based access controls
- 🔒 Rate limiting on API endpoints
- 🔒 Data encryption and privacy compliance
- 🔒 Audit logging for administrative actions

## 🧪 Testing

### Available Test Tools

- **Interactive API Tests** - Browser-based testing interfaces
- **Database Health Checks** - Automated validation endpoints
- **Admin Test Suite** - Comprehensive admin functionality tests

### Testing Strategy

- **Unit Tests** - Component and utility testing
- **Integration Tests** - API endpoint validation
- **E2E Tests** - Complete user flow validation
- **Performance Tests** - Load and stress testing

## 📊 Monitoring

### System Metrics

- **Campaign Analytics** - Creation, activation, and redemption rates
- **User Activity** - Registration, login, and engagement metrics
- **API Performance** - Response times and error rates
- **Database Health** - Connection status and query performance

### Admin Dashboard Insights

- **Real-time Statistics** - Live system overview
- **Activity Monitoring** - Recent system activities
- **Export Capabilities** - Data analysis and reporting

## 🔗 Quick Access Links

### 🎛️ Admin Interfaces (Development)

- **[Admin Dashboard](http://localhost:3000/admin)** - Central control panel
- **[Campaign Manager](http://localhost:3000/admin/campaigns)** - Create and manage campaigns
- **[Code Manager](http://localhost:3000/admin/codes)** - Generate and track redemption codes
- **[Cookie Testing](http://localhost:3000/admin/test-cookies)** - Test campaign tracking functionality
- **[API Documentation](http://localhost:3000/admin/api-docs)** - Interactive Swagger UI
- **[Data Management](http://localhost:3000/admin/data)** - System analytics and data export
- **[User Management](http://localhost:3000/admin/users)** - User accounts and activity

### 📖 Documentation Quick Links

- **[📋 Project Manager Guide](./PROJECT_MANAGER_GUIDE.md)** - Complete PM documentation and workflows
- **[�️ Developer Guide](./DEVELOPER_GUIDE.md)** - Development setup, patterns, and contribution guidelines
- **[🧪 Testing Guide](./TESTING_GUIDE.md)** - End-to-end testing procedures and validation
- **[📊 UTM Tracking](./docs/UTM-Parameters-Guide.md)** - Marketing analytics guide (if available)

### 🧪 Testing & Development

- **[System Health](http://localhost:3000/api/health)** - API status check
- **[Database Test](http://localhost:3000/api/test)** - Database connectivity
- **[Interactive API Tests](http://localhost:3000/test-campaign-api.html)** - Browser-based API testing

## 🤝 Contributing

### Quick Start for Contributors

See the **[🛠️ Developer Guide](./DEVELOPER_GUIDE.md)** for comprehensive contribution guidelines including:

- Development environment setup
- Code standards and best practices
- Git workflow and commit conventions
- Testing procedures and quality assurance
- API development patterns and security

### Essential Steps

1. Fork the repository and create feature branch
2. Follow TypeScript and ESLint standards
3. Add tests for new functionality
4. Submit pull request with clear description

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

### **Documentation Resources**

- **[📋 Project Manager Guide](./PROJECT_MANAGER_GUIDE.md)** - Campaign management and business workflows
- **[🛠️ Developer Guide](./DEVELOPER_GUIDE.md)** - Development setup and contribution guidelines
- **[🧪 Testing Guide](./TESTING_GUIDE.md)** - Testing procedures and validation checklists

### **Technical Support**

- **Issues**: [GitHub Issues](https://github.com/Larouex/h2All_m1_proto/issues)
- **API Documentation**: [Interactive Swagger UI](/admin/api-docs)
- **System Health**: [Real-time Status Check](/api/health)
- **Admin Access**: [Admin Dashboard](/admin)

---

**Built with ❤️ using Next.js, React, and TypeScript**
