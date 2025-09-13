# 🚀 Render Deployment Guide

## Quick Start (Recommended for Demo)

### Option 1: Simple SQLite Deployment (Easiest)

1. **Go to [render.com](https://render.com)**
2. **Sign up/Login** with GitHub
3. **Create Web Service:**
   - Connect: `Varshamadavaneri/xeno-shopify-service`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

4. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-super-secret-jwt-key-here
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   ```

5. **Deploy Frontend:**
   - Create Static Site
   - Connect same repository
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
   - Environment Variable: `REACT_APP_API_URL=https://your-backend-url.onrender.com`

### Option 2: PostgreSQL Deployment (Production Ready)

1. **Create Database:**
   - New → PostgreSQL
   - Name: `xeno-db`
   - Plan: **Free**

2. **Deploy Backend:**
   - Same as Option 1, but add:
   ```
   DATABASE_URL=postgresql://user:pass@host:port/db
   ```

3. **Deploy Frontend:**
   - Same as Option 1

## 🔧 Environment Variables

### Backend Service
```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-here
DATABASE_URL=postgresql://user:pass@host:port/db  # Only for PostgreSQL
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### Frontend Service
```bash
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

## 📝 Step-by-Step Instructions

### 1. Create Backend Service
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository: `Varshamadavaneri/xeno-shopify-service`
4. Configure:
   - **Name**: `xeno-shopify-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add environment variables (see above)
6. Click "Create Web Service"

### 2. Create Frontend Service
1. Click "New +" → "Static Site"
2. Connect same repository
3. Configure:
   - **Name**: `xeno-shopify-frontend`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: Free
4. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.onrender.com`
5. Click "Create Static Site"

### 3. Update CORS Origin
1. Go to your backend service settings
2. Update `CORS_ORIGIN` with your frontend URL
3. Redeploy if needed

## 🎯 Demo Credentials

Once deployed, use these credentials:
- **Email**: `demo@xeno.com`
- **Password**: `demo123`

## 🔍 Troubleshooting

### Common Issues:
1. **Build Fails**: Check build logs for missing dependencies
2. **Database Connection**: Ensure DATABASE_URL is correct
3. **CORS Errors**: Update CORS_ORIGIN with correct frontend URL
4. **Frontend Can't Connect**: Check REACT_APP_API_URL

### Logs:
- Check service logs in Render dashboard
- Backend logs show database connection status
- Frontend logs show build process

## 🚀 Your URLs

After deployment, you'll have:
- **Backend API**: `https://xeno-shopify-backend.onrender.com`
- **Frontend**: `https://xeno-shopify-frontend.onrender.com`

## 📊 Database Setup

### For SQLite (Default):
- No additional setup needed
- Data persists in the container
- Good for demos

### For PostgreSQL:
1. Create PostgreSQL service in Render
2. Copy connection string
3. Add as DATABASE_URL environment variable
4. Restart backend service

## ✅ Deployment Checklist

- [ ] Backend service created and running
- [ ] Frontend service created and running
- [ ] Environment variables set correctly
- [ ] CORS origin updated with frontend URL
- [ ] Demo data accessible
- [ ] Login working with demo credentials
- [ ] All features functional

## 🎉 Ready for Submission!

Your deployed application will be ready for the Xeno FDE Internship Assignment submission!
