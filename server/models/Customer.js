const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'store_id',
    references: {
      model: 'shopify_stores',
      key: 'id'
    }
  },
  shopifyId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'shopify_id'
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  firstName: {
    type: DataTypes.STRING,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    field: 'last_name'
  },
  phone: {
    type: DataTypes.STRING
  },
  acceptsMarketing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'accepts_marketing'
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'total_spent'
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_orders'
  },
  state: {
    type: DataTypes.ENUM('disabled', 'invited', 'enabled', 'declined'),
    defaultValue: 'enabled'
  },
  note: {
    type: DataTypes.TEXT
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  verifiedEmail: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'verified_email'
  },
  multipassIdentifier: {
    type: DataTypes.STRING,
    field: 'multipass_identifier'
  },
  taxExempt: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'tax_exempt'
  },
  taxExemptions: {
    type: DataTypes.JSONB,
    field: 'tax_exemptions',
    defaultValue: []
  },
  acceptsMarketingUpdatedAt: {
    type: DataTypes.DATE,
    field: 'accepts_marketing_updated_at'
  },
  marketingOptInLevel: {
    type: DataTypes.STRING,
    field: 'marketing_opt_in_level'
  },
  adminGraphqlApiId: {
    type: DataTypes.STRING,
    field: 'admin_graphql_api_id'
  },
  defaultAddress: {
    type: DataTypes.JSONB,
    field: 'default_address'
  },
  shopifyCreatedAt: {
    type: DataTypes.DATE,
    field: 'shopify_created_at'
  },
  shopifyUpdatedAt: {
    type: DataTypes.DATE,
    field: 'shopify_updated_at'
  }
}, {
  tableName: 'customers',
  indexes: [
    {
      unique: true,
      fields: ['store_id', 'shopify_id']
    },
    {
      fields: ['store_id']
    },
    {
      fields: ['email']
    }
  ]
});

module.exports = Customer;
