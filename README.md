# H2All M1 - Campaign and Redemption System

A Next.js application for managing campaigns, redemption codes, and user engagement with a clean separation between user experience and administrative functionality.

## 🚀 Overview

H2All M1 is a comprehensive platform that provides:

- **Clean user redemption flow** for tracking purchases and impact
- **Comprehensive admin dashboard** for campaign management
- **Full API documentation** with Swagger integration
- **Real-time database operations** with Azure Data Tables
- **Interactive testing tools** for development and QA

## 📋 Table of Contents

- [Architecture](#architecture)
- [User Experience Flow](#user-experience-flow)
- [Admin Dashboard](#admin-dashboard)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15.4.5 with React 19
- **Styling**: React Bootstrap 5 with custom CSS
- **Database**: Azure Data Tables
- **API**: RESTful endpoints with OpenAPI 3.0 documentation
- **Documentation**: Swagger UI integration
- **TypeScript**: Full type safety throughout

### Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Clean home page
│   ├── track/page.tsx         # Email collection
│   ├── impact/page.tsx        # Impact confirmation
│   ├── login/page.tsx         # User authentication
│   ├── register/page.tsx      # User registration
│   ├── funded/page.tsx        # Project funding confirmation
│   ├── api/                   # API endpoints
│   │   ├── campaigns/         # Campaign CRUD operations
│   │   ├── redemption-codes/  # Code generation (POST only)
│   │   ├── redeem/            # Code redemption (POST only)
│   │   ├── projects/          # Project data
│   │   ├── users/             # User management
│   │   └── swagger/           # API documentation
│   └── admin/                 # Administrative interface
│       ├── page.tsx           # Admin dashboard
│       ├── api-docs/page.tsx  # API documentation
│       ├── campaigns/page.tsx # Campaign management
│       ├── codes/page.tsx     # Code management
│       ├── data/page.tsx      # Data management
│       └── users/page.tsx     # User management
├── types/                     # TypeScript definitions
│   ├── campaign.ts           # Campaign interfaces
│   ├── redemption.ts         # Redemption code interfaces
│   └── user.ts               # User interfaces
├── lib/                      # Utility libraries
    ├── utils/                # Utility functions
    │   └── urlParser.ts      # Campaign URL parsing and validation
    ├── database.ts           # Azure Data Tables integration
    └── swagger.ts            # API documentation config
```

## 👥 User Experience Flow

### Clean Redemption Journey

1. **Home (`/`)** - Value proposition and "Track Purchase" CTA
2. **Track (`/track`)** - Email collection for impact tracking
3. **Impact (`/impact`)** - Confirmation and impact messaging
4. **Funded (`/funded`)** - Project funding success page

### Authentication Flow

- **Login (`/login`)** - User authentication with error handling
- **Register (`/register`)** - New user registration

### Key Features

- ✅ Mobile-responsive Bootstrap design
- ✅ Clean, distraction-free user interface
- ✅ No developer tools or API references in user flow
- ✅ Consistent branding and messaging

## 🔧 Admin Dashboard

Access the comprehensive admin interface at `/admin`

### Dashboard Features

- **System Overview** - Real-time statistics and metrics
- **Quick Actions** - Common administrative tasks
- **Navigation Hub** - Organized access to all admin tools

### Campaign Management (`/admin/campaigns`)

- ✅ Create, read, update, delete campaigns
- ✅ Campaign status management (active/inactive)
- ✅ Date range configuration
- ✅ Redemption tracking and analytics
- ✅ Search and filtering capabilities

### Redemption Code Management (`/admin/codes`)

- ✅ Bulk code generation with configurable parameters
- ✅ Code status tracking (available/redeemed)
- ✅ Search by code or campaign
- ✅ Export/import functionality
- ✅ Deletion controls (non-redeemed codes only)

### Data Management (`/admin/data`)

- ✅ System statistics dashboard
- ✅ Export/import tools for all data types
- ✅ Recent activity monitoring
- ✅ Tabbed interface for different data categories
- ✅ Privacy compliance features

### User Management (`/admin/users`)

- ✅ User account overview and management
- ✅ Activity tracking and analytics
- ✅ User status control (activate/deactivate)
- ✅ Search and filtering capabilities
- ✅ Detailed user profiles and statistics

## 📚 API Documentation

### Interactive Documentation (`/admin/api-docs`)

- **Swagger UI Integration** - Full OpenAPI 3.0 specification
- **Try-it-out Functionality** - Test APIs directly in browser
- **Request/Response Examples** - Comprehensive examples for all endpoints
- **Schema Documentation** - Detailed data models and validation

### Available Endpoints

#### Campaigns API (`/api/campaigns`)

- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/{id}` - Get campaign details
- `PUT /api/campaigns/{id}` - Update campaign
- `DELETE /api/campaigns/{id}` - Delete campaign

#### Redemption Codes API (`/api/redemption-codes`)

- `GET /api/redemption-codes` - List redemption codes with filtering
- `POST /api/redemption-codes` - Generate bulk redemption codes
- Query parameters: `campaignId`, `code`, `isUsed`, `id`

#### Code Redemption API (`/api/redeem`)

- `POST /api/redeem` - Redeem a specific code for a user
- Handles campaign validation, user balance updates, and tracking

#### User Management API (`/api/users`)

- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user account
- `GET /api/users/{id}` - Get user details
- `PATCH /api/users/{id}` - Update user status

#### Authentication API

- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `POST /api/subscribe` - Email subscription

### API Architecture Improvements

- ✅ **Clean Separation**: Code generation and redemption now use separate endpoints
- ✅ **Proper Error Handling**: Comprehensive validation and error responses
- ✅ **TypeScript Integration**: Full type safety with Azure Table Storage PascalCase properties
- ✅ **URL Parser Utility**: Campaign URL validation and parsing functionality
- ✅ **Cryptographic Security**: nanoid for secure code generation (1M+ codes/second)

### Recent Updates (August 2025)

- **API Separation**: Split `/api/redemption-codes` (generation) and `/api/redeem` (redemption)
- **Enhanced Admin Dashboard**: Advanced code generation interface with bulk operations
- **URL Parser Utility**: Comprehensive campaign URL parsing and validation
- **Azure Integration**: Proper PascalCase property mapping for Azure Table Storage
- **Swagger Documentation**: Updated with real campaign IDs and working examples

### Testing Tools

- **Interactive Test Pages** - HTML-based API testing interfaces
- **Database Health Checks** - Automated testing endpoints
- **Development Utilities** - Debug and validation tools

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Azure Data Tables connection (optional for development)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Larouex/h2All_m1_proto.git
cd h2All_m1_proto/h2all-m1
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Add your Azure Data Tables connection string and other required variables.

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

5. **Access the application**

- **User Interface**: [http://localhost:3000](http://localhost:3000)
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

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

### Code Standards

- **TypeScript** - Full type safety required
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting standards
- **Conventional Commits** - Clear commit messaging

### File Organization

- **Components** - Reusable UI components
- **Types** - Centralized TypeScript definitions
- **API** - RESTful endpoint implementations
- **Documentation** - Comprehensive inline and external docs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions, issues, or contributions:

- **Issues**: [GitHub Issues](https://github.com/Larouex/h2All_m1_proto/issues)
- **Documentation**: [API Documentation](/admin/api-docs)
- **Admin Access**: [Admin Dashboard](/admin)

---

**Built with ❤️ using Next.js, React, and TypeScript**
