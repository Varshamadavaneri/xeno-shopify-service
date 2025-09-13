# Xeno Shopify Data Ingestion & Insights Service

A comprehensive multi-tenant Shopify Data Ingestion & Insights Service built for the Xeno FDE Internship Assignment 2025. This service enables enterprise retailers to onboard, integrate, and analyze their customer data from multiple Shopify stores.

## 🚀 Features

### ✅ Core Functionality
- **Multi-tenant Architecture**: Complete data isolation between tenants
- **Shopify API Integration**: Automated data ingestion for customers, products, and orders
- **Real-time Synchronization**: Webhook support and scheduled sync jobs
- **Comprehensive Analytics**: Revenue trends, customer analytics, product performance, and sales funnel insights
- **Modern Dashboard**: React-based UI with interactive charts and metrics
- **Authentication System**: Secure user registration and tenant management

### 📊 Analytics & Insights
- Total customers, products, orders, and revenue metrics
- Revenue trends over time with date range filtering
- Top customers by spend and lifetime value
- Product performance analytics
- Sales funnel and conversion metrics
- Order status and fulfillment tracking

### 🔧 Technical Features
- **Backend**: Node.js with Express.js
- **Frontend**: React with Tailwind CSS
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT-based authentication
- **Data Sync**: Webhooks + Cron-based scheduling
- **Charts**: Recharts for data visualization

## 🏗️ Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express API    │    │   PostgreSQL    │
│                 │◄──►│                 │◄──►│                 │
│  - Dashboard    │    │  - Multi-tenant │    │  - Multi-tenant │
│  - Analytics    │    │  - Shopify API  │    │  - Data Models  │
│  - Auth         │    │  - Webhooks     │    │  - Relationships│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Shopify API   │
                       │                 │
                       │  - Customers    │
                       │  - Products     │
                       │  - Orders       │
                       │  - Webhooks     │
                       └─────────────────┘
```

### Multi-Tenant Data Model
```
Users (1) ──► (N) Tenants (1) ──► (N) ShopifyStores
                                    │
                                    ▼
                            ┌─────────────────┐
                            │   Data Models   │
                            │                 │
                            │  - Customers    │
                            │  - Products     │
                            │  - Orders       │
                            │  - OrderItems   │
                            │  - CustomEvents │
                            └─────────────────┘
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Xeno
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp server/config.env.example server/.env
   
   # Edit the .env file with your configuration
   nano server/.env
   ```

4. **Configure your environment variables**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=xeno_shopify_db
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Shopify Configuration
   SHOPIFY_API_VERSION=2023-10
   SHOPIFY_WEBHOOK_SECRET=your-webhook-secret

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Set up the database**
   ```bash
   # Create the database
   createdb xeno_shopify_db
   
   # Run migrations (if using Sequelize CLI)
   cd server
   npm run migrate
   ```

6. **Start the application**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start them separately
   npm run server:dev  # Backend on port 5000
   npm run client:dev  # Frontend on port 3000
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Tenants
- `GET /api/tenants` - Get all tenants for current user
- `POST /api/tenants` - Create a new tenant
- `GET /api/tenants/:tenantId` - Get specific tenant
- `PUT /api/tenants/:tenantId` - Update tenant
- `DELETE /api/tenants/:tenantId` - Delete tenant
- `GET /api/tenants/:tenantId/dashboard` - Get tenant dashboard data

### Shopify Integration
- `POST /api/shopify/:tenantId/connect` - Connect a Shopify store
- `GET /api/shopify/:tenantId/stores` - Get all stores for tenant
- `POST /api/shopify/:tenantId/:storeId/sync` - Manually sync store data
- `GET /api/shopify/:tenantId/:storeId/customers` - Get customers
- `GET /api/shopify/:tenantId/:storeId/products` - Get products
- `GET /api/shopify/:tenantId/:storeId/orders` - Get orders

### Insights & Analytics
- `GET /api/insights/:tenantId/overview` - Get overview insights
- `GET /api/insights/:tenantId/revenue-trends` - Get revenue trends
- `GET /api/insights/:tenantId/customer-analytics` - Get customer analytics
- `GET /api/insights/:tenantId/product-performance` - Get product performance
- `GET /api/insights/:tenantId/sales-funnel` - Get sales funnel analytics

### Webhooks
- `POST /api/webhooks/shopify/customers/create` - Customer creation webhook
- `POST /api/webhooks/shopify/customers/update` - Customer update webhook
- `POST /api/webhooks/shopify/products/create` - Product creation webhook
- `POST /api/webhooks/shopify/products/update` - Product update webhook
- `POST /api/webhooks/shopify/orders/create` - Order creation webhook
- `POST /api/webhooks/shopify/orders/updated` - Order update webhook
- `POST /api/webhooks/shopify/orders/paid` - Order paid webhook
- `POST /api/webhooks/shopify/orders/cancelled` - Order cancelled webhook
- `POST /api/webhooks/custom-events` - Custom events webhook

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and authentication
- **tenants**: Multi-tenant organizations
- **shopify_stores**: Connected Shopify stores
- **customers**: Customer data from Shopify
- **products**: Product data from Shopify
- **orders**: Order data from Shopify
- **order_items**: Individual order line items
- **custom_events**: Custom tracking events

### Key Relationships
- Users own multiple Tenants
- Tenants have multiple Shopify Stores
- Stores have Customers, Products, Orders, and Custom Events
- Orders belong to Customers and contain Order Items
- Order Items reference Products

## 🔄 Data Synchronization

### Automatic Sync
- **Scheduled Jobs**: Cron-based synchronization every hour (configurable)
- **Webhook Support**: Real-time updates for Shopify events
- **Manual Sync**: On-demand synchronization via API

### Sync Process
1. Fetch data from Shopify API using pagination
2. Upsert data into local database
3. Maintain referential integrity
4. Track sync status and timestamps

## 🚀 Deployment

### Environment Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Install dependencies
4. Run database migrations
5. Start the application

### Production Considerations
- Use environment-specific configurations
- Set up proper logging and monitoring
- Configure rate limiting and security headers
- Set up SSL/TLS certificates
- Configure database connection pooling
- Set up backup and recovery procedures

## 📊 Known Limitations & Assumptions

### Current Limitations
1. **Shopify API Rate Limits**: Respects Shopify's API rate limits (2 calls per second)
2. **Data Volume**: Optimized for small to medium-sized stores
3. **Real-time Updates**: Webhook delivery depends on Shopify's infrastructure
4. **Custom Events**: Limited to predefined event types

### Assumptions Made
1. **Shopify Store Access**: Assumes valid Shopify private app credentials
2. **Data Consistency**: Assumes Shopify data is consistent and reliable
3. **Network Connectivity**: Assumes stable internet connection for API calls
4. **User Permissions**: Assumes users have appropriate access to their Shopify stores

## 🔮 Next Steps to Productionize

### Immediate Improvements
1. **Error Handling**: Enhanced error logging and monitoring
2. **Performance**: Database indexing and query optimization
3. **Security**: Enhanced authentication and authorization
4. **Testing**: Comprehensive unit and integration tests

### Scalability Enhancements
1. **Caching**: Redis implementation for frequently accessed data
2. **Queue System**: RabbitMQ for async processing
3. **Load Balancing**: Multiple server instances
4. **Database Sharding**: Horizontal scaling for large datasets

### Monitoring & Observability
1. **Metrics**: Application performance monitoring
2. **Logging**: Centralized logging with ELK stack
3. **Alerting**: Proactive issue detection and notification
4. **Health Checks**: Comprehensive system health monitoring

### Security Enhancements
1. **API Security**: Rate limiting and DDoS protection
2. **Data Encryption**: Encrypt sensitive data at rest
3. **Audit Logging**: Track all data access and modifications
4. **Compliance**: GDPR and data privacy compliance

## 🧪 Testing

### Manual Testing
1. **User Registration/Login**: Test authentication flow
2. **Tenant Management**: Create, update, delete tenants
3. **Store Connection**: Connect Shopify stores
4. **Data Sync**: Verify data synchronization
5. **Analytics**: Check dashboard and insights

### Automated Testing (Future)
- Unit tests for individual functions
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Performance tests for scalability

## 📝 License

This project is created for the Xeno FDE Internship Assignment 2025.

## 👥 Contact

For questions or support regarding this implementation, please refer to the assignment submission guidelines.

---

**Built with ❤️ for Xeno FDE Internship Assignment 2025**
