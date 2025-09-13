const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomEvent = sequelize.define('CustomEvent', {
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
  eventType: {
    type: DataTypes.ENUM(
      'cart_abandoned',
      'checkout_started',
      'checkout_completed',
      'product_viewed',
      'product_added_to_cart',
      'product_removed_from_cart',
      'search_performed',
      'page_viewed',
      'email_opened',
      'email_clicked',
      'custom'
    ),
    allowNull: false,
    field: 'event_type'
  },
  eventName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'event_name'
  },
  eventData: {
    type: DataTypes.JSONB,
    field: 'event_data',
    defaultValue: {}
  },
  sessionId: {
    type: DataTypes.STRING,
    field: 'session_id'
  },
  userId: {
    type: DataTypes.STRING,
    field: 'user_id'
  },
  anonymousId: {
    type: DataTypes.STRING,
    field: 'anonymous_id'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  url: {
    type: DataTypes.STRING
  },
  referrer: {
    type: DataTypes.STRING
  },
  userAgent: {
    type: DataTypes.TEXT,
    field: 'user_agent'
  },
  ipAddress: {
    type: DataTypes.STRING,
    field: 'ip_address'
  },
  properties: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  context: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  traits: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  integrations: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  messageId: {
    type: DataTypes.STRING,
    field: 'message_id'
  },
  originalTimestamp: {
    type: DataTypes.DATE,
    field: 'original_timestamp'
  },
  receivedAt: {
    type: DataTypes.DATE,
    field: 'received_at',
    defaultValue: DataTypes.NOW
  },
  sentAt: {
    type: DataTypes.DATE,
    field: 'sent_at'
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'web'
  },
  version: {
    type: DataTypes.STRING,
    defaultValue: '1.0'
  }
}, {
  tableName: 'custom_events',
  indexes: [
    {
      fields: ['store_id']
    },
    {
      fields: ['customer_id']
    },
    {
      fields: ['event_type']
    },
    {
      fields: ['event_name']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['session_id']
    },
    {
      fields: ['store_id', 'event_type', 'timestamp']
    }
  ]
});

module.exports = CustomEvent;
