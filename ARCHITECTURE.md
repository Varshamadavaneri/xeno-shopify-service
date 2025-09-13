# 🏗️ Architecture Documentation

## System Architecture Overview

The Xeno Shopify Data Ingestion & Insights Service is built as a multi-tenant SaaS platform that enables enterprise retailers to connect their Shopify stores and gain comprehensive business insights.

## 🎯 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend]
        B[Web Browser]
    end
    
    subgraph "API Gateway Layer"
        C[Express.js Server]
        D[Authentication Middleware]
        E[Rate Limiting]
    end
    
    subgraph "Business Logic Layer"
        F[Tenant Management]
        G[Shopify Integration]
        H[Data Ingestion]
        I[Analytics Engine]
    end
    
    subgraph "Data Layer"
        J[SQLite Database]
        K[File System]
    end
    
    subgraph "External Services"
        L[Shopify APIs]
        M[Webhook Endpoints]
    end
    
    A --> C
    B --> A
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
    E --> I
    F --> J
    G --> J
    H --> J
    I --> J
    G --> L
    M --> H
    I --> K
```

## 🏢 Multi-Tenant Architecture

### Tenant Isolation Strategy

The application implements **Database-level tenant isolation** using tenant IDs across all data models:

```javascript
// Every data model includes tenantId for isolation
const Customer = {
  id: UUID,
  tenantId: UUID,        // Tenant isolation
  storeId: UUID,         // Store within tenant
  shopifyId: String,     // Shopify's ID
  // ... other fields
}
```

### Tenant Hierarchy

```
User (1) ──→ (Many) Tenants (1) ──→ (Many) ShopifyStores
    │              │                        │
    │              │                        │
    └─ Authentication    └─ Data Isolation    └─ Data Ingestion
```

## 📊 Data Flow Architecture

### 1. Data Ingestion Flow

```mermaid
sequenceDiagram
    participant S as Shopify Store
    participant W as Webhook
    participant A as API Server
    participant D as Database
    participant F as Frontend
    
    S->>W: Order Created
    W->>A: Webhook Payload
    A->>A: Validate Tenant
    A->>D: Store Order Data
    A->>F: Real-time Update
    F->>F: Update Dashboard
```

### 2. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Server
    participant D as Database
    
    U->>F: Login Request
    F->>A: POST /api/auth/login
    A->>D: Validate Credentials
    D->>A: User Data
    A->>A: Generate JWT
    A->>F: JWT Token
    F->>F: Store Token
    F->>A: API Requests with JWT
```

## 🗄️ Database Design

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Tenant : owns
    Tenant ||--o{ ShopifyStore : has
    ShopifyStore ||--o{ Customer : contains
    ShopifyStore ||--o{ Product : contains
    ShopifyStore ||--o{ Order : contains
    Customer ||--o{ Order : places
    Order ||--o{ OrderItem : contains
    Product ||--o{ OrderItem : referenced_by
    ShopifyStore ||--o{ CustomEvent : generates
    
    User {
        uuid id PK
        string email UK
        string password
        string first_name
        string last_name
        boolean is_active
        datetime last_login_at
    }
    
    Tenant {
        uuid id PK
        string name
        string slug UK
        string description
        uuid owner_id FK
        boolean is_active
        json settings
    }
    
    ShopifyStore {
        uuid id PK
        uuid tenant_id FK
        string shop_domain UK
        string access_token
        string shop_id
        string shop_name
        json settings
    }
    
    Customer {
        uuid id PK
        uuid store_id FK
        uuid tenant_id
        string shopify_id
        string email
        decimal total_spent
        integer total_orders
    }
    
    Product {
        uuid id PK
        uuid store_id FK
        uuid tenant_id
        string shopify_id
        string title
        string vendor
        decimal price
    }
    
    Order {
        uuid id PK
        uuid store_id FK
        uuid customer_id FK
        uuid tenant_id
        string shopify_id
        decimal total_price
        string financial_status
        string fulfillment_status
    }
    
    OrderItem {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        string shopify_id
        integer quantity
        decimal price
    }
    
    CustomEvent {
        uuid id PK
        uuid store_id FK
        uuid customer_id FK
        string event_type
        json event_data
        datetime timestamp
    }
```

### Indexing Strategy

```sql
-- Performance indexes for multi-tenant queries
CREATE INDEX idx_customers_tenant_store ON customers(tenant_id, store_id);
CREATE INDEX idx_orders_tenant_store ON orders(tenant_id, store_id);
CREATE INDEX idx_products_tenant_store ON products(tenant_id, store_id);

-- Shopify ID lookups
CREATE UNIQUE INDEX idx_customers_shopify ON customers(store_id, shopify_id);
CREATE UNIQUE INDEX idx_products_shopify ON products(store_id, shopify_id);
CREATE UNIQUE INDEX idx_orders_shopify ON orders(store_id, shopify_id);

-- Analytics queries
CREATE INDEX idx_orders_created_at ON orders(shopify_created_at);
CREATE INDEX idx_customers_total_spent ON customers(total_spent DESC);
```

## 🔄 API Architecture

### RESTful API Design

```
/api/auth/*
├── POST /register          # User registration
├── POST /login             # User authentication
├── GET  /me               # Get current user
└── POST /logout           # User logout

/api/tenants/*
├── GET    /               # List user's tenants
├── POST   /               # Create new tenant
├── GET    /:id            # Get tenant details
├── PUT    /:id            # Update tenant
└── DELETE /:id            # Delete tenant

/api/shopify/:tenantId/*
├── GET    /stores         # List tenant's stores
├── POST   /connect        # Connect new store
├── GET    /stores/:id     # Get store details
├── POST   /stores/:id/sync # Manual sync
└── DELETE /stores/:id     # Disconnect store

/api/insights/:tenantId/*
├── GET /overview          # Dashboard overview
├── GET /customers         # Customer analytics
├── GET /orders            # Order analytics
├── GET /products          # Product analytics
└── GET /revenue           # Revenue analytics
```

### API Response Format

```javascript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2025-09-13T17:44:36.838Z"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [ /* validation errors */ ],
  "timestamp": "2025-09-13T17:44:36.838Z"
}
```

## 🔒 Security Architecture

### Authentication & Authorization

```mermaid
graph LR
    A[User Request] --> B{JWT Valid?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{User Active?}
    D -->|No| E[403 Forbidden]
    D -->|Yes| F{Tenant Access?}
    F -->|No| G[403 Forbidden]
    F -->|Yes| H[Process Request]
```

### Security Layers

1. **Transport Security**
   - HTTPS enforcement
   - CORS configuration
   - Security headers (Helmet.js)

2. **Authentication Security**
   - JWT tokens with expiration
   - Password hashing (bcrypt)
   - Rate limiting on auth endpoints

3. **Data Security**
   - Input validation and sanitization
   - SQL injection prevention (Sequelize ORM)
   - Tenant data isolation

4. **API Security**
   - Request rate limiting
   - API key validation (for webhooks)
   - Request size limits

## 📈 Scalability Considerations

### Horizontal Scaling Strategy

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[NGINX/HAProxy]
    end
    
    subgraph "Application Tier"
        A1[App Server 1]
        A2[App Server 2]
        A3[App Server N]
    end
    
    subgraph "Database Tier"
        DB1[Primary DB]
        DB2[Read Replica]
        DB3[Read Replica]
    end
    
    subgraph "Cache Layer"
        R1[Redis Cluster]
    end
    
    LB --> A1
    LB --> A2
    LB --> A3
    A1 --> DB1
    A2 --> DB1
    A3 --> DB1
    A1 --> R1
    A2 --> R1
    A3 --> R1
```

### Performance Optimizations

1. **Database Level**
   - Proper indexing strategy
   - Query optimization
   - Connection pooling
   - Read replicas for analytics

2. **Application Level**
   - Response caching
   - Lazy loading
   - Pagination for large datasets
   - Background job processing

3. **Frontend Level**
   - Code splitting
   - Lazy component loading
   - Image optimization
   - CDN for static assets

## 🔄 Data Synchronization

### Real-time Sync Strategy

```mermaid
graph LR
    A[Shopify Store] --> B[Webhook]
    B --> C[Webhook Handler]
    C --> D[Data Validation]
    D --> E[Tenant Resolution]
    E --> F[Database Update]
    F --> G[Cache Invalidation]
    G --> H[Real-time Notification]
```

### Batch Sync Strategy

```mermaid
graph TB
    A[Scheduler] --> B[Sync Service]
    B --> C[Get Store List]
    C --> D[For Each Store]
    D --> E[Fetch Shopify Data]
    E --> F[Transform Data]
    F --> G[Update Database]
    G --> H[Update Sync Status]
```

## 📊 Monitoring & Observability

### Logging Strategy

```javascript
// Structured logging example
{
  "timestamp": "2025-09-13T17:44:36.838Z",
  "level": "info",
  "service": "xeno-shopify-backend",
  "tenantId": "uuid",
  "userId": "uuid",
  "action": "order_created",
  "shopifyId": "12345",
  "duration": 150,
  "status": "success"
}
```

### Metrics Collection

1. **Business Metrics**
   - Orders per tenant
   - Revenue trends
   - Customer acquisition
   - Sync success rates

2. **Technical Metrics**
   - API response times
   - Database query performance
   - Error rates
   - Memory usage

3. **User Metrics**
   - Active users
   - Feature usage
   - Session duration
   - Conversion rates

## 🚀 Deployment Architecture

### Production Environment

```mermaid
graph TB
    subgraph "CDN"
        CDN[CloudFlare/AWS CloudFront]
    end
    
    subgraph "Load Balancer"
        LB[Application Load Balancer]
    end
    
    subgraph "Application Servers"
        A1[App Server 1]
        A2[App Server 2]
        A3[App Server N]
    end
    
    subgraph "Database Cluster"
        DB1[Primary PostgreSQL]
        DB2[Read Replica 1]
        DB3[Read Replica 2]
    end
    
    subgraph "Cache Layer"
        R1[Redis Cluster]
    end
    
    subgraph "External Services"
        S1[Shopify APIs]
        S2[Monitoring Services]
    end
    
    CDN --> LB
    LB --> A1
    LB --> A2
    LB --> A3
    A1 --> DB1
    A2 --> DB1
    A3 --> DB1
    A1 --> R1
    A2 --> R1
    A3 --> R1
    A1 --> S1
    A2 --> S1
    A3 --> S1
```

### Container Architecture

```yaml
# docker-compose.yml structure
version: '3.8'
services:
  backend:
    build: ./server
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
    depends_on:
      - database
      - redis
  
  frontend:
    build: ./client
    environment:
      - REACT_APP_API_URL=http://backend:5001
  
  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=xeno
      - POSTGRES_USER=xeno
      - POSTGRES_PASSWORD=password
  
  redis:
    image: redis:7-alpine
```

## 🔮 Future Architecture Considerations

### Microservices Migration

```mermaid
graph TB
    subgraph "API Gateway"
        GW[Kong/AWS API Gateway]
    end
    
    subgraph "Core Services"
        AUTH[Auth Service]
        TENANT[Tenant Service]
        STORE[Store Service]
        SYNC[Sync Service]
        ANALYTICS[Analytics Service]
    end
    
    subgraph "Data Services"
        USER_DB[(User DB)]
        TENANT_DB[(Tenant DB)]
        STORE_DB[(Store DB)]
        ANALYTICS_DB[(Analytics DB)]
    end
    
    GW --> AUTH
    GW --> TENANT
    GW --> STORE
    GW --> SYNC
    GW --> ANALYTICS
    AUTH --> USER_DB
    TENANT --> TENANT_DB
    STORE --> STORE_DB
    ANALYTICS --> ANALYTICS_DB
```

### Event-Driven Architecture

```mermaid
graph LR
    A[Shopify Webhook] --> B[Event Bus]
    B --> C[Order Service]
    B --> D[Customer Service]
    B --> E[Analytics Service]
    C --> F[Order Database]
    D --> G[Customer Database]
    E --> H[Analytics Database]
```

This architecture provides a solid foundation for a production-ready multi-tenant SaaS platform while maintaining flexibility for future enhancements and scaling requirements.
