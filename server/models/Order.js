const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
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
  customerId: {
    type: DataTypes.UUID,
    field: 'customer_id',
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  shopifyId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'shopify_id'
  },
  orderNumber: {
    type: DataTypes.STRING,
    field: 'order_number'
  },
  name: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  financialStatus: {
    type: DataTypes.ENUM('pending', 'authorized', 'partially_paid', 'paid', 'partially_refunded', 'refunded', 'voided'),
    field: 'financial_status'
  },
  fulfillmentStatus: {
    type: DataTypes.ENUM('fulfilled', 'null', 'partial', 'restocked'),
    field: 'fulfillment_status'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'total_price'
  },
  subtotalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'subtotal_price'
  },
  totalTax: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'total_tax'
  },
  totalDiscounts: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'total_discounts'
  },
  totalWeight: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'total_weight'
  },
  taxesIncluded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'taxes_included'
  },
  confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  processedAt: {
    type: DataTypes.DATE,
    field: 'processed_at'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    field: 'cancelled_at'
  },
  cancelReason: {
    type: DataTypes.STRING,
    field: 'cancel_reason'
  },
  closedAt: {
    type: DataTypes.DATE,
    field: 'closed_at'
  },
  test: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  note: {
    type: DataTypes.TEXT
  },
  sourceName: {
    type: DataTypes.STRING,
    field: 'source_name'
  },
  referringSite: {
    type: DataTypes.STRING,
    field: 'referring_site'
  },
  landingSite: {
    type: DataTypes.STRING,
    field: 'landing_site'
  },
  browserIp: {
    type: DataTypes.STRING,
    field: 'browser_ip'
  },
  orderStatusUrl: {
    type: DataTypes.STRING,
    field: 'order_status_url'
  },
  adminGraphqlApiId: {
    type: DataTypes.STRING,
    field: 'admin_graphql_api_id'
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    field: 'shipping_address'
  },
  billingAddress: {
    type: DataTypes.JSONB,
    field: 'billing_address'
  },
  customerData: {
    type: DataTypes.JSONB,
    field: 'customer_data'
  },
  lineItems: {
    type: DataTypes.JSONB,
    field: 'line_items',
    defaultValue: []
  },
  shippingLines: {
    type: DataTypes.JSONB,
    field: 'shipping_lines',
    defaultValue: []
  },
  taxLines: {
    type: DataTypes.JSONB,
    field: 'tax_lines',
    defaultValue: []
  },
  discountCodes: {
    type: DataTypes.JSONB,
    field: 'discount_codes',
    defaultValue: []
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
  tableName: 'orders',
  indexes: [
    {
      unique: true,
      fields: ['store_id', 'shopify_id']
    },
    {
      fields: ['store_id']
    },
    {
      fields: ['customer_id']
    },
    {
      fields: ['email']
    },
    {
      fields: ['financial_status']
    },
    {
      fields: ['fulfillment_status']
    },
    {
      fields: ['shopify_created_at']
    }
  ]
});

module.exports = Order;
