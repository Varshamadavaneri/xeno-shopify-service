const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'order_id',
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.UUID,
    field: 'product_id',
    references: {
      model: 'products',
      key: 'id'
    }
  },
  shopifyId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'shopify_id'
  },
  variantId: {
    type: DataTypes.BIGINT,
    field: 'variant_id'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  variantTitle: {
    type: DataTypes.STRING,
    field: 'variant_title'
  },
  vendor: {
    type: DataTypes.STRING
  },
  productType: {
    type: DataTypes.STRING,
    field: 'product_type'
  },
  sku: {
    type: DataTypes.STRING
  },
  variantInventoryManagement: {
    type: DataTypes.STRING,
    field: 'variant_inventory_management'
  },
  variantInventoryPolicy: {
    type: DataTypes.STRING,
    field: 'variant_inventory_policy'
  },
  variantFulfillmentService: {
    type: DataTypes.STRING,
    field: 'variant_fulfillment_service'
  },
  productExists: {
    type: DataTypes.BOOLEAN,
    field: 'product_exists'
  },
  fulfillableQuantity: {
    type: DataTypes.INTEGER,
    field: 'fulfillable_quantity'
  },
  grams: {
    type: DataTypes.INTEGER
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  totalDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'total_discount'
  },
  fulfillmentStatus: {
    type: DataTypes.STRING,
    field: 'fulfillment_status'
  },
  priceSet: {
    type: DataTypes.JSONB,
    field: 'price_set'
  },
  totalDiscountSet: {
    type: DataTypes.JSONB,
    field: 'total_discount_set'
  },
  discountAllocations: {
    type: DataTypes.JSONB,
    field: 'discount_allocations',
    defaultValue: []
  },
  duties: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  adminGraphqlApiId: {
    type: DataTypes.STRING,
    field: 'admin_graphql_api_id'
  },
  taxLines: {
    type: DataTypes.JSONB,
    field: 'tax_lines',
    defaultValue: []
  },
  originLocation: {
    type: DataTypes.JSONB,
    field: 'origin_location'
  },
  destinationLocation: {
    type: DataTypes.JSONB,
    field: 'destination_location'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  requiresShipping: {
    type: DataTypes.BOOLEAN,
    field: 'requires_shipping'
  },
  taxable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  giftCard: {
    type: DataTypes.BOOLEAN,
    field: 'gift_card',
    defaultValue: false
  },
  name: {
    type: DataTypes.STRING
  },
  variantInventoryQuantity: {
    type: DataTypes.INTEGER,
    field: 'variant_inventory_quantity'
  },
  properties: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  productHasOnlyDefaultVariant: {
    type: DataTypes.BOOLEAN,
    field: 'product_has_only_default_variant'
  },
  fulfillableService: {
    type: DataTypes.STRING,
    field: 'fulfillable_service'
  }
}, {
  tableName: 'order_items',
  indexes: [
    {
      unique: true,
      fields: ['order_id', 'shopify_id']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['variant_id']
    }
  ]
});

module.exports = OrderItem;
