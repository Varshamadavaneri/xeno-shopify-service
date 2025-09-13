const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Tenant = require('./Tenant');
const ShopifyStore = require('./ShopifyStore');
const Customer = require('./Customer');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const CustomEvent = require('./CustomEvent');

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Tenant, { foreignKey: 'owner_id', as: 'tenants' });
  Tenant.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

  // Tenant associations
  Tenant.hasMany(ShopifyStore, { foreignKey: 'tenant_id', as: 'stores' });
  ShopifyStore.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Shopify Store associations
  ShopifyStore.hasMany(Customer, { foreignKey: 'store_id', as: 'customers' });
  ShopifyStore.hasMany(Product, { foreignKey: 'store_id', as: 'products' });
  ShopifyStore.hasMany(Order, { foreignKey: 'store_id', as: 'orders' });
  ShopifyStore.hasMany(CustomEvent, { foreignKey: 'store_id', as: 'events' });

  Customer.belongsTo(ShopifyStore, { foreignKey: 'store_id', as: 'store' });
  Product.belongsTo(ShopifyStore, { foreignKey: 'store_id', as: 'store' });
  Order.belongsTo(ShopifyStore, { foreignKey: 'store_id', as: 'store' });
  CustomEvent.belongsTo(ShopifyStore, { foreignKey: 'store_id', as: 'store' });

  // Order associations
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
};

// Initialize associations
defineAssociations();

module.exports = {
  sequelize,
  User,
  Tenant,
  ShopifyStore,
  Customer,
  Product,
  Order,
  OrderItem,
  CustomEvent
};
