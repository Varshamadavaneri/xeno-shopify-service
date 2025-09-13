const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bodyHtml: {
    type: DataTypes.TEXT,
    field: 'body_html'
  },
  vendor: {
    type: DataTypes.STRING
  },
  productType: {
    type: DataTypes.STRING,
    field: 'product_type'
  },
  handle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'archived', 'draft'),
    defaultValue: 'active'
  },
  publishedScope: {
    type: DataTypes.STRING,
    field: 'published_scope'
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  adminGraphqlApiId: {
    type: DataTypes.STRING,
    field: 'admin_graphql_api_id'
  },
  variants: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  options: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  images: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  image: {
    type: DataTypes.JSONB
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
  tableName: 'products',
  indexes: [
    {
      unique: true,
      fields: ['store_id', 'shopify_id']
    },
    {
      fields: ['store_id']
    },
    {
      fields: ['handle']
    },
    {
      fields: ['vendor']
    },
    {
      fields: ['product_type']
    }
  ]
});

module.exports = Product;
