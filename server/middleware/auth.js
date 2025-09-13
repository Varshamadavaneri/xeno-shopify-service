const jwt = require('jsonwebtoken');
const { User, Tenant } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user with tenants
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Tenant,
        as: 'tenants',
        where: { isActive: true },
        required: false
      }]
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token - user not found',
        code: 'INVALID_TOKEN'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

const requireTenant = async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({ 
        error: 'Tenant ID required',
        code: 'MISSING_TENANT_ID'
      });
    }

    // Check if user has access to this tenant
    const tenant = await Tenant.findOne({
      where: { 
        id: tenantId, 
        ownerId: req.userId,
        isActive: true 
      }
    });

    if (!tenant) {
      return res.status(403).json({ 
        error: 'Access denied to tenant',
        code: 'TENANT_ACCESS_DENIED'
      });
    }

    req.tenant = tenant;
    req.tenantId = tenant.id;
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({ 
      error: 'Tenant validation error',
      code: 'TENANT_ERROR'
    });
  }
};

const requireStore = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.storeId || req.query.storeId;
    
    if (!storeId) {
      return res.status(400).json({ 
        error: 'Store ID required',
        code: 'MISSING_STORE_ID'
      });
    }

    // Check if user has access to this store through tenant
    const { ShopifyStore } = require('../models');
    const store = await ShopifyStore.findOne({
      where: { 
        id: storeId,
        tenantId: req.tenantId,
        isActive: true 
      },
      include: [{
        model: Tenant,
        as: 'tenant',
        where: { ownerId: req.userId },
        required: true
      }]
    });

    if (!store) {
      return res.status(403).json({ 
        error: 'Access denied to store',
        code: 'STORE_ACCESS_DENIED'
      });
    }

    req.store = store;
    req.storeId = store.id;
    next();
  } catch (error) {
    console.error('Store middleware error:', error);
    res.status(500).json({ 
      error: 'Store validation error',
      code: 'STORE_ERROR'
    });
  }
};

module.exports = {
  authenticateToken,
  requireTenant,
  requireStore
};
