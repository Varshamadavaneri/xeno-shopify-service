const express = require('express');
const { Op } = require('sequelize');
const { Customer, Product, Order, OrderItem, ShopifyStore } = require('../models');
const { requireTenant, requireStore } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/insights/:tenantId/overview
// @desc    Get tenant overview insights
// @access  Private
router.get('/:tenantId/overview', requireTenant, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.shopifyCreatedAt = {};
      if (startDate) dateFilter.shopifyCreatedAt[Op.gte] = new Date(startDate);
      if (endDate) dateFilter.shopifyCreatedAt[Op.lte] = new Date(endDate);
    }

    // Get store IDs for this tenant
    const stores = await ShopifyStore.findAll({
      where: { tenantId: req.tenantId },
      attributes: ['id']
    });
    const storeIds = stores.map(store => store.id);

    // Get basic counts
    const [customerCount, productCount, orderCount] = await Promise.all([
      Customer.count({
        include: [{
          model: ShopifyStore,
          as: 'store',
          where: { id: { [Op.in]: storeIds } },
          required: true
        }]
      }),
      Product.count({
        include: [{
          model: ShopifyStore,
          as: 'store',
          where: { id: { [Op.in]: storeIds } },
          required: true
        }]
      }),
      Order.count({
        where: {
          storeId: { [Op.in]: storeIds },
          ...dateFilter
        }
      })
    ]);

    // Get total revenue
    const revenueResult = await Order.findOne({
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('total_price')), 'total_revenue']
      ],
      where: {
        storeId: { [Op.in]: storeIds },
        ...dateFilter
      },
      raw: true
    });

    const totalRevenue = parseFloat(revenueResult?.total_revenue || 0);

    // Get average order value
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Get top customers by spend
    const topCustomers = await Customer.findAll({
      include: [{
        model: ShopifyStore,
        as: 'store',
        where: { id: { [Op.in]: storeIds } },
        required: true,
        attributes: ['shopName']
      }],
      order: [['totalSpent', 'DESC']],
      limit: 5
    });

    // Get recent orders
    const recentOrders = await Order.findAll({
      where: {
        storeId: { [Op.in]: storeIds },
        ...dateFilter
      },
      include: [{
        model: ShopifyStore,
        as: 'store',
        attributes: ['shopName']
      }, {
        model: Customer,
        as: 'customer',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['shopifyCreatedAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        overview: {
          customerCount,
          productCount,
          orderCount,
          totalRevenue,
          avgOrderValue
        },
        topCustomers,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get overview insights error:', error);
    res.status(500).json({
      error: 'Failed to get overview insights',
      code: 'GET_OVERVIEW_ERROR'
    });
  }
});

// @route   GET /api/insights/:tenantId/revenue-trends
// @desc    Get revenue trends over time
// @access  Private
router.get('/:tenantId/revenue-trends', requireTenant, async (req, res) => {
  try {
    const { period = '30d', startDate, endDate } = req.query;
    
    // Get store IDs for this tenant
    const stores = await ShopifyStore.findAll({
      where: { tenantId: req.tenantId },
      attributes: ['id']
    });
    const storeIds = stores.map(store => store.id);

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.shopifyCreatedAt = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    } else {
      // Default to last 30 days if no dates provided
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      dateFilter.shopifyCreatedAt = {
        [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      };
    }

    // Get daily revenue data
    const revenueData = await Order.findAll({
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('shopify_created_at')), 'date'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_price')), 'revenue'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'order_count']
      ],
      where: {
        storeId: { [Op.in]: storeIds },
        ...dateFilter
      },
      group: [require('sequelize').fn('DATE', require('sequelize').col('shopify_created_at'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('shopify_created_at')), 'ASC']],
      raw: true
    });

    // Format data for charts
    const formattedData = revenueData.map(item => ({
      date: item.date,
      revenue: parseFloat(item.revenue || 0),
      orderCount: parseInt(item.order_count || 0)
    }));

    res.json({
      success: true,
      data: {
        period,
        trends: formattedData
      }
    });
  } catch (error) {
    console.error('Get revenue trends error:', error);
    res.status(500).json({
      error: 'Failed to get revenue trends',
      code: 'GET_REVENUE_TRENDS_ERROR'
    });
  }
});

// @route   GET /api/insights/:tenantId/customer-analytics
// @desc    Get customer analytics
// @access  Private
router.get('/:tenantId/customer-analytics', requireTenant, async (req, res) => {
  try {
    // Get store IDs for this tenant
    const stores = await ShopifyStore.findAll({
      where: { tenantId: req.tenantId },
      attributes: ['id']
    });
    const storeIds = stores.map(store => store.id);

    // Get customer distribution by total spent
    const customerSpendDistribution = await Customer.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('AVG', require('sequelize').col('total_spent')), 'avg_spent'],
        [require('sequelize').fn('MAX', require('sequelize').col('total_spent')), 'max_spent']
      ],
      include: [{
        model: ShopifyStore,
        as: 'store',
        where: { id: { [Op.in]: storeIds } },
        required: true,
        attributes: []
      }],
      raw: true
    });

    // Get customers by order count ranges
    const orderCountRanges = await Customer.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('CASE',
          require('sequelize').fn('WHEN', require('sequelize').col('total_orders'), '=', 0, 'New Customers'),
          require('sequelize').fn('WHEN', require('sequelize').col('total_orders'), 'BETWEEN', 1, 5, 'Regular Customers'),
          require('sequelize').fn('WHEN', require('sequelize').col('total_orders'), '>', 5, 'VIP Customers'),
          'Unknown'
        ), 'customer_type']
      ],
      include: [{
        model: ShopifyStore,
        as: 'store',
        where: { id: { [Op.in]: storeIds } },
        required: true,
        attributes: []
      }],
      group: ['customer_type'],
      raw: true
    });

    // Get top customers by lifetime value
    const topCustomersByLTV = await Customer.findAll({
      include: [{
        model: ShopifyStore,
        as: 'store',
        where: { id: { [Op.in]: storeIds } },
        required: true,
        attributes: ['shopName']
      }],
      order: [['totalSpent', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        spendDistribution: customerSpendDistribution[0],
        orderCountRanges,
        topCustomersByLTV
      }
    });
  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({
      error: 'Failed to get customer analytics',
      code: 'GET_CUSTOMER_ANALYTICS_ERROR'
    });
  }
});

// @route   GET /api/insights/:tenantId/product-performance
// @desc    Get product performance analytics
// @access  Private
router.get('/:tenantId/product-performance', requireTenant, async (req, res) => {
  try {
    // Get store IDs for this tenant
    const stores = await ShopifyStore.findAll({
      where: { tenantId: req.tenantId },
      attributes: ['id']
    });
    const storeIds = stores.map(store => store.id);

    // Get top selling products
    const topProducts = await OrderItem.findAll({
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'total_quantity'],
        [require('sequelize').fn('SUM', require('sequelize').col('price')), 'total_revenue'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'order_count'],
        'title',
        'vendor',
        'productType'
      ],
      include: [{
        model: Order,
        as: 'order',
        where: { storeId: { [Op.in]: storeIds } },
        required: true,
        attributes: []
      }],
      group: ['title', 'vendor', 'productType'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Get product performance by vendor
    const vendorPerformance = await OrderItem.findAll({
      attributes: [
        'vendor',
        [require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'total_quantity'],
        [require('sequelize').fn('SUM', require('sequelize').col('price')), 'total_revenue'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'order_count']
      ],
      include: [{
        model: Order,
        as: 'order',
        where: { storeId: { [Op.in]: storeIds } },
        required: true,
        attributes: []
      }],
      group: ['vendor'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('price')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Get product performance by type
    const productTypePerformance = await OrderItem.findAll({
      attributes: [
        'productType',
        [require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'total_quantity'],
        [require('sequelize').fn('SUM', require('sequelize').col('price')), 'total_revenue'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'order_count']
      ],
      include: [{
        model: Order,
        as: 'order',
        where: { storeId: { [Op.in]: storeIds } },
        required: true,
        attributes: []
      }],
      group: ['productType'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('price')), 'DESC']],
      limit: 10,
      raw: true
    });

    res.json({
      success: true,
      data: {
        topProducts: topProducts.map(item => ({
          title: item.title,
          vendor: item.vendor,
          productType: item.productType,
          totalQuantity: parseInt(item.total_quantity || 0),
          totalRevenue: parseFloat(item.total_revenue || 0),
          orderCount: parseInt(item.order_count || 0)
        })),
        vendorPerformance: vendorPerformance.map(item => ({
          vendor: item.vendor,
          totalQuantity: parseInt(item.total_quantity || 0),
          totalRevenue: parseFloat(item.total_revenue || 0),
          orderCount: parseInt(item.order_count || 0)
        })),
        productTypePerformance: productTypePerformance.map(item => ({
          productType: item.productType,
          totalQuantity: parseInt(item.total_quantity || 0),
          totalRevenue: parseFloat(item.total_revenue || 0),
          orderCount: parseInt(item.order_count || 0)
        }))
      }
    });
  } catch (error) {
    console.error('Get product performance error:', error);
    res.status(500).json({
      error: 'Failed to get product performance',
      code: 'GET_PRODUCT_PERFORMANCE_ERROR'
    });
  }
});

// @route   GET /api/insights/:tenantId/sales-funnel
// @desc    Get sales funnel analytics
// @access  Private
router.get('/:tenantId/sales-funnel', requireTenant, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get store IDs for this tenant
    const stores = await ShopifyStore.findAll({
      where: { tenantId: req.tenantId },
      attributes: ['id']
    });
    const storeIds = stores.map(store => store.id);

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.shopifyCreatedAt = {};
      if (startDate) dateFilter.shopifyCreatedAt[Op.gte] = new Date(startDate);
      if (endDate) dateFilter.shopifyCreatedAt[Op.lte] = new Date(endDate);
    }

    // Get order status distribution
    const orderStatusDistribution = await Order.findAll({
      attributes: [
        'financialStatus',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_price')), 'total_revenue']
      ],
      where: {
        storeId: { [Op.in]: storeIds },
        ...dateFilter
      },
      group: ['financialStatus'],
      raw: true
    });

    // Get fulfillment status distribution
    const fulfillmentStatusDistribution = await Order.findAll({
      attributes: [
        'fulfillmentStatus',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: {
        storeId: { [Op.in]: storeIds },
        ...dateFilter
      },
      group: ['fulfillmentStatus'],
      raw: true
    });

    // Get conversion metrics
    const totalCustomers = await Customer.count({
      include: [{
        model: ShopifyStore,
        as: 'store',
        where: { id: { [Op.in]: storeIds } },
        required: true,
        attributes: []
      }]
    });

    const totalOrders = await Order.count({
      where: {
        storeId: { [Op.in]: storeIds },
        ...dateFilter
      }
    });

    const avgOrdersPerCustomer = totalCustomers > 0 ? totalOrders / totalCustomers : 0;

    res.json({
      success: true,
      data: {
        orderStatusDistribution: orderStatusDistribution.map(item => ({
          status: item.financialStatus,
          count: parseInt(item.count || 0),
          revenue: parseFloat(item.total_revenue || 0)
        })),
        fulfillmentStatusDistribution: fulfillmentStatusDistribution.map(item => ({
          status: item.fulfillmentStatus,
          count: parseInt(item.count || 0)
        })),
        conversionMetrics: {
          totalCustomers,
          totalOrders,
          avgOrdersPerCustomer: parseFloat(avgOrdersPerCustomer.toFixed(2))
        }
      }
    });
  } catch (error) {
    console.error('Get sales funnel error:', error);
    res.status(500).json({
      error: 'Failed to get sales funnel analytics',
      code: 'GET_SALES_FUNNEL_ERROR'
    });
  }
});

// @route   GET /api/insights/:tenantId/:storeId/store-details
// @desc    Get detailed insights for a specific store
// @access  Private
router.get('/:tenantId/:storeId/store-details', requireTenant, requireStore, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.shopifyCreatedAt = {};
      if (startDate) dateFilter.shopifyCreatedAt[Op.gte] = new Date(startDate);
      if (endDate) dateFilter.shopifyCreatedAt[Op.lte] = new Date(endDate);
    }

    // Get store-specific metrics
    const [customerCount, productCount, orderCount] = await Promise.all([
      Customer.count({
        where: { storeId: req.storeId }
      }),
      Product.count({
        where: { storeId: req.storeId }
      }),
      Order.count({
        where: {
          storeId: req.storeId,
          ...dateFilter
        }
      })
    ]);

    // Get total revenue for this store
    const revenueResult = await Order.findOne({
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('total_price')), 'total_revenue']
      ],
      where: {
        storeId: req.storeId,
        ...dateFilter
      },
      raw: true
    });

    const totalRevenue = parseFloat(revenueResult?.total_revenue || 0);

    // Get top customers for this store
    const topCustomers = await Customer.findAll({
      where: { storeId: req.storeId },
      order: [['totalSpent', 'DESC']],
      limit: 5
    });

    // Get recent orders for this store
    const recentOrders = await Order.findAll({
      where: {
        storeId: req.storeId,
        ...dateFilter
      },
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['shopifyCreatedAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        store: req.store,
        metrics: {
          customerCount,
          productCount,
          orderCount,
          totalRevenue,
          avgOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0
        },
        topCustomers,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get store details error:', error);
    res.status(500).json({
      error: 'Failed to get store details',
      code: 'GET_STORE_DETAILS_ERROR'
    });
  }
});

module.exports = router;
