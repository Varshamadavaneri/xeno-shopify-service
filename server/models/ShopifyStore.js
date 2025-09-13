const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ShopifyStore = sequelize.define('ShopifyStore', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'tenant_id',
    references: {
      model: 'tenants',
      key: 'id'
    }
  },
  shopDomain: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'shop_domain',
    validate: {
      is: /^[a-zA-Z0-9-]+\.myshopify\.com$/
    }
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'access_token'
  },
  shopId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
    field: 'shop_id'
  },
  shopName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'shop_name'
  },
  shopEmail: {
    type: DataTypes.STRING,
    field: 'shop_email',
    validate: {
      isEmail: true
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'UTC'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastSyncAt: {
    type: DataTypes.DATE,
    field: 'last_sync_at'
  },
  syncStatus: {
    type: DataTypes.ENUM('pending', 'syncing', 'completed', 'failed'),
    defaultValue: 'pending',
    field: 'sync_status'
  },
  webhookSecret: {
    type: DataTypes.STRING,
    field: 'webhook_secret'
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      syncCustomers: true,
      syncProducts: true,
      syncOrders: true,
      syncEvents: true,
      autoSync: true,
      syncInterval: 3600 // seconds
    }
  }
}, {
  tableName: 'shopify_stores',
  indexes: [
    {
      unique: true,
      fields: ['shop_domain']
    },
    {
      unique: true,
      fields: ['shop_id']
    },
    {
      fields: ['tenant_id']
    }
  ]
});

module.exports = ShopifyStore;
