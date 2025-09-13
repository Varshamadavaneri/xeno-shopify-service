# 🚀 Xeno Shopify Data Ingestion & Insights Service

A comprehensive multi-tenant platform for enterprise retailers to ingest, analyze, and gain insights from their Shopify store data. Built for the Xeno FDE Internship Assignment 2025.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Assumptions](#assumptions)
- [Next Steps](#next-steps)
- [Contributing](#contributing)

## 🎯 Overview

This project simulates Xeno's enterprise capabilities by providing a multi-tenant Shopify data ingestion and insights service. It allows enterprise retailers to:

- **Connect Multiple Shopify Stores** per tenant organization
- **Ingest Real-time Data** from customers, orders, products, and custom events
- **Analyze Business Performance** with comprehensive dashboards and metrics
- **Maintain Data Isolation** across different tenant organizations
- **Scale Horizontally** with a production-ready architecture

## ✨ Features

### 🏢 Multi-Tenant Architecture
- Complete data isolation using tenant IDs
- Tenant-specific store management
- Secure authentication and authorization
- Scalable tenant onboarding

### 📊 Data Ingestion
- **Shopify API Integration** with OAuth flow simulation
- **Real-time Webhooks** for instant data updates
- **Scheduled Synchronization** for reliable data consistency
- **Custom Event Tracking** (cart abandoned, checkout started, etc.)

### 📈 Analytics & Insights
- **Revenue Analytics** with trend analysis
- **Customer Insights** including top spenders
- **Order Analytics** with date filtering
- **Product Performance** metrics
- **Interactive Dashboards** with real-time updates

### 🔒 Security & Performance
- JWT-based authentication
- Password hashing with bcrypt
- CORS protection and rate limiting
- Input validation and sanitization
- SQL injection prevention

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Node.js/Express│    │   SQLite/PostgreSQL│
│                 │◄──►│     Backend     │◄──►│    Database     │
│  - Dashboard    │    │                 │    │                 │
│  - Analytics    │    │  - Multi-tenant │    │  - Tenant Data  │
│  - Auth         │    │  - Shopify API  │    │  - Isolation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │  Shopify APIs   │    │   File System   │
│                 │    │                 │    │                 │
│  - User Interface│    │  - OAuth Flow   │    │  - Logs         │
│  - Real-time UI │    │  - Webhooks     │    │  - Static Files │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Schema

```sql
-- Core Tables
Users (id, email, password, first_name, last_name, is_active)
Tenants (id, name, slug, description, owner_id, settings)
ShopifyStores (id, tenant_id, shop_domain, access_token, settings)

-- Data Tables (with tenant_id for isolation)
Customers (id, store_id, tenant_id, shopify_id, email, total_spent)
Products (id, store_id, tenant_id, shopify_id, title, vendor, price)
Orders (id, store_id, tenant_id, customer_id, shopify_id, total_price)
OrderItems (id, order_id, product_id, shopify_id, quantity, price)
CustomEvents (id, store_id, customer_id, event_type, event_data)
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for database operations
- **SQLite** - Database (easily switchable to PostgreSQL)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Axios** - HTTP client for Shopify API calls

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Render** - Cloud deployment platform
- **Git** - Version control

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/xeno-shopify-service.git
   cd xeno-shopify-service
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd server && npm install
   
   # Install frontend dependencies
   cd ../client && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp server/config.env.example server/.env
   
   # Edit the .env file with your configuration
   nano server/.env
   ```

4. **Start the application**
   ```bash
   # Start both backend and frontend
   ./startDemo.sh
   
   # Or start individually:
   # Backend: cd server && npm start
   # Frontend: cd client && npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

### Demo Login Credentials
- **Email**: demo@xeno.com
- **Password**: demo123

## 📖 Usage

### 1. Authentication
- Register a new account or use demo credentials
- JWT tokens are automatically managed
- Session persistence across browser refreshes

### 2. Tenant Management
- Create multiple tenant organizations
- Each tenant has isolated data
- Switch between different tenant contexts

### 3. Store Connection
- Connect Shopify stores to tenants
- Configure sync settings and webhooks
- Monitor connection status and health

### 4. Analytics Dashboard
- View comprehensive business metrics
- Filter data by date range and store
- Export insights and reports

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /api/auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Tenant Management

#### GET /api/tenants
Get all tenants for authenticated user.

#### POST /api/tenants
Create a new tenant.

**Request Body:**
```json
{
  "name": "Company Name",
  "slug": "company-slug",
  "description": "Company description"
}
```

### Shopify Integration

#### GET /api/shopify/:tenantId/stores
Get all stores for a specific tenant.

#### POST /api/shopify/:tenantId/connect
Connect a new Shopify store.

**Request Body:**
```json
{
  "shopDomain": "store.myshopify.com",
  "shopName": "Store Name"
}
```

### Analytics

#### GET /api/insights/:tenantId/overview
Get comprehensive analytics overview for a tenant.

#### GET /api/insights/:tenantId/customers
Get customer analytics and insights.

#### GET /api/insights/:tenantId/orders
Get order analytics with filtering options.

## 🗄️ Database Schema

### Core Models

#### User
```javascript
{
  id: UUID (Primary Key),
  email: String (Unique),
  password: String (Hashed),
  firstName: String,
  lastName: String,
  isActive: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Tenant
```javascript
{
  id: UUID (Primary Key),
  name: String,
  slug: String (Unique),
  description: String,
  ownerId: UUID (Foreign Key -> User.id),
  isActive: Boolean,
  settings: JSON,
  subscriptionPlan: String,
  subscriptionStatus: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### ShopifyStore
```javascript
{
  id: UUID (Primary Key),
  tenantId: UUID (Foreign Key -> Tenant.id),
  shopDomain: String (Unique),
  accessToken: String,
  shopId: String,
  shopName: String,
  shopEmail: String,
  currency: String,
  timezone: String,
  isActive: Boolean,
  syncStatus: String,
  settings: JSON,
  createdAt: Date,
  updatedAt: Date
}
```

### Data Models (Multi-tenant)

All data models include `tenantId` for complete data isolation:

- **Customer**: Shopify customer data with tenant isolation
- **Product**: Shopify product catalog with tenant isolation
- **Order**: Order data with customer and product relationships
- **OrderItem**: Individual order line items
- **CustomEvent**: Custom analytics events (cart abandoned, etc.)

## 🚀 Deployment

### Render Deployment

1. **Connect GitHub Repository**
   - Fork this repository
   - Connect to Render dashboard
   - Select the repository

2. **Configure Services**
   - Backend service will use `render.yaml` configuration
   - Frontend service will be deployed as static site
   - Database will be provisioned automatically

3. **Environment Variables**
   ```bash
   NODE_ENV=production
   JWT_SECRET=your-jwt-secret
   DATABASE_URL=postgresql://...
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   ```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t xeno-backend ./server
docker build -t xeno-frontend ./client
```

### Manual Deployment

1. **Backend Deployment**
   ```bash
   cd server
   npm install --production
   npm start
   ```

2. **Frontend Deployment**
   ```bash
   cd client
   npm install
   npm run build
   # Serve the build folder with any static server
   ```

## 🤔 Assumptions

### Technical Assumptions
1. **Database**: Used SQLite for demo purposes, easily switchable to PostgreSQL for production
2. **Shopify OAuth**: Implemented mock OAuth flow for demonstration; real implementation would require Shopify app registration
3. **Webhooks**: Simulated webhook handling; production would require HTTPS endpoints
4. **Authentication**: JWT-based auth suitable for demo; production might need OAuth2/SAML
5. **Data Sync**: Implemented basic sync logic; production would need robust retry mechanisms

### Business Assumptions
1. **Multi-tenancy**: Each tenant represents a separate enterprise client
2. **Data Isolation**: Complete separation of data between tenants
3. **Scalability**: Architecture designed for horizontal scaling
4. **Security**: Enterprise-grade security requirements
5. **Compliance**: GDPR/CCPA compliance considerations for customer data

### Performance Assumptions
1. **Database**: Optimized queries with proper indexing
2. **Caching**: Would benefit from Redis for production
3. **Rate Limiting**: Implemented basic rate limiting
4. **Monitoring**: Would need comprehensive logging and monitoring

## 🚀 Next Steps for Production

### Immediate Improvements
1. **Real Shopify OAuth Integration**
   - Register Shopify app
   - Implement proper OAuth2 flow
   - Handle token refresh and expiration

2. **Database Migration**
   - Switch from SQLite to PostgreSQL
   - Implement database migrations
   - Add connection pooling

3. **Enhanced Security**
   - Implement OAuth2/SAML authentication
   - Add API rate limiting per tenant
   - Implement audit logging

### Advanced Features
1. **Real-time Analytics**
   - WebSocket connections for live updates
   - Real-time dashboard updates
   - Push notifications for important events

2. **Machine Learning Integration**
   - Customer segmentation algorithms
   - Predictive analytics for sales
   - Recommendation engines

3. **Advanced Reporting**
   - Custom report builder
   - Scheduled report generation
   - Data export in multiple formats

4. **Enterprise Features**
   - SSO integration
   - Advanced user permissions
   - API rate limiting per tenant
   - Data retention policies

### Scalability Improvements
1. **Microservices Architecture**
   - Split into separate services
   - API gateway implementation
   - Service mesh for communication

2. **Caching Layer**
   - Redis for session management
   - CDN for static assets
   - Database query caching

3. **Monitoring & Observability**
   - Application performance monitoring
   - Error tracking and alerting
   - Business metrics dashboards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Teja Gopal**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Xeno team for the challenging assignment
- Shopify for comprehensive API documentation
- React and Node.js communities for excellent tooling
- All open-source contributors who made this project possible

---

**Built with ❤️ for the Xeno FDE Internship Assignment 2025**