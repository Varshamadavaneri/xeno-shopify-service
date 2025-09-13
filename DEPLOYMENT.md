# Deployment Guide

This guide covers different deployment options for the Xeno Shopify Data Ingestion & Insights Service.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Steps
1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd Xeno
   npm run install:all
   ```

2. **Set up environment**
   ```bash
   cp server/config.env.example server/.env
   # Edit server/.env with your configuration
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Xeno
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Check service status**
   ```bash
   docker-compose ps
   ```

4. **View logs**
   ```bash
   docker-compose logs -f backend
   ```

### Manual Docker Build

1. **Build the image**
   ```bash
   docker build -t xeno-shopify-service .
   ```

2. **Run with environment variables**
   ```bash
   docker run -d \
     --name xeno-backend \
     -p 5000:5000 \
     -e DB_HOST=your-db-host \
     -e DB_PASSWORD=your-db-password \
     -e JWT_SECRET=your-jwt-secret \
     xeno-shopify-service
   ```

## ☁️ Cloud Deployment Options

### Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Ubuntu/Debian
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

3. **Add PostgreSQL addon**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Set environment variables**
   ```bash
   heroku config:set JWT_SECRET=your-super-secret-jwt-key
   heroku config:set SHOPIFY_WEBHOOK_SECRET=your-webhook-secret
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Railway Deployment

1. **Connect GitHub repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub account
   - Select the repository

2. **Configure environment variables**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key
   SHOPIFY_WEBHOOK_SECRET=your-webhook-secret
   ```

3. **Deploy automatically**
   - Railway will automatically deploy on git push

### Render Deployment

1. **Create a new Web Service**
   - Go to [Render](https://render.com)
   - Connect your GitHub repository
   - Select "Web Service"

2. **Configure build settings**
   ```bash
   Build Command: npm run build
   Start Command: npm start
   ```

3. **Set environment variables**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key
   SHOPIFY_WEBHOOK_SECRET=your-webhook-secret
   ```

4. **Deploy**

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=xeno_shopify_db
DB_USER=postgres
DB_PASSWORD=your-secure-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# Shopify Configuration
SHOPIFY_API_VERSION=2023-10
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com
```

### Production Security Checklist

- [ ] Use strong, unique JWT secrets
- [ ] Set secure database passwords
- [ ] Configure HTTPS/TLS certificates
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup procedures
- [ ] Set up health checks

## 📊 Database Setup

### PostgreSQL Setup

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Create database**
   ```bash
   createdb xeno_shopify_db
   ```

3. **Run migrations**
   ```bash
   cd server
   npm run migrate
   ```

### Cloud Database Options

- **Heroku Postgres**: Automatic with Heroku deployment
- **Railway Postgres**: Built-in database service
- **Render Postgres**: Add-on service
- **AWS RDS**: Managed PostgreSQL service
- **Google Cloud SQL**: Managed database service

## 🔍 Monitoring & Health Checks

### Health Check Endpoint
```bash
curl http://your-domain.com/health
```

### Monitoring Setup
1. **Application Monitoring**
   - Set up New Relic, DataDog, or similar
   - Monitor API response times
   - Track error rates

2. **Database Monitoring**
   - Monitor connection pool usage
   - Track query performance
   - Set up alerts for slow queries

3. **Infrastructure Monitoring**
   - CPU and memory usage
   - Disk space monitoring
   - Network traffic monitoring

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database connectivity
   psql -h localhost -U postgres -d xeno_shopify_db
   ```

2. **Port Conflicts**
   ```bash
   # Check if port is in use
   lsof -i :5000
   ```

3. **Environment Variables**
   ```bash
   # Verify environment variables
   echo $JWT_SECRET
   ```

4. **Dependencies Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs and Debugging

1. **Application Logs**
   ```bash
   # Docker logs
   docker-compose logs -f backend
   
   # Heroku logs
   heroku logs --tail
   ```

2. **Database Logs**
   ```bash
   # PostgreSQL logs
   tail -f /var/log/postgresql/postgresql-*.log
   ```

## 📈 Performance Optimization

### Production Optimizations

1. **Database**
   - Add appropriate indexes
   - Configure connection pooling
   - Set up read replicas for analytics

2. **Application**
   - Enable gzip compression
   - Implement caching strategies
   - Optimize API queries

3. **Infrastructure**
   - Use CDN for static assets
   - Implement load balancing
   - Set up auto-scaling

## 🔐 Security Considerations

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use parameterized queries
- [ ] Implement proper authentication
- [ ] Set up CORS properly
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

### Data Protection

- [ ] Encrypt sensitive data
- [ ] Implement data retention policies
- [ ] Regular backups
- [ ] Access logging
- [ ] GDPR compliance (if applicable)

---

For additional support or questions, please refer to the main README.md file or create an issue in the repository.
