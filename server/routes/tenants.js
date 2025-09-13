const express = require('express');
const { body, validationResult } = require('express-validator');
const { Tenant, ShopifyStore } = require('../models');
const { requireTenant } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tenants
// @desc    Get all tenants for current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const tenants = await Tenant.findAll({
      where: { ownerId: req.userId },
      include: [{
        model: ShopifyStore,
        as: 'stores',
        where: { isActive: true },
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { tenants }
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      error: 'Failed to get tenants',
      code: 'GET_TENANTS_ERROR'
    });
  }
});

// @route   POST /api/tenants
// @desc    Create a new tenant
// @access  Private
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('slug').trim().isLength({ min: 2, max: 50 }).matches(/^[a-z0-9-]+$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, description, slug } = req.body;

    // Check if slug is already taken
    const existingTenant = await Tenant.findOne({ where: { slug } });
    if (existingTenant) {
      return res.status(400).json({
        error: 'Tenant slug already exists',
        code: 'SLUG_EXISTS'
      });
    }

    // Create tenant
    const tenant = await Tenant.create({
      name,
      description,
      slug,
      ownerId: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: { tenant }
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({
      error: 'Failed to create tenant',
      code: 'CREATE_TENANT_ERROR'
    });
  }
});

// @route   GET /api/tenants/:tenantId
// @desc    Get specific tenant
// @access  Private
router.get('/:tenantId', requireTenant, async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.tenantId, {
      include: [{
        model: ShopifyStore,
        as: 'stores',
        where: { isActive: true },
        required: false
      }]
    });

    res.json({
      success: true,
      data: { tenant }
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({
      error: 'Failed to get tenant',
      code: 'GET_TENANT_ERROR'
    });
  }
});

// @route   PUT /api/tenants/:tenantId
// @desc    Update tenant
// @access  Private
router.put('/:tenantId', requireTenant, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('settings').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, description, settings } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (settings) updateData.settings = settings;

    await Tenant.update(updateData, { where: { id: req.tenantId } });

    const updatedTenant = await Tenant.findByPk(req.tenantId);

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: { tenant: updatedTenant }
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({
      error: 'Failed to update tenant',
      code: 'UPDATE_TENANT_ERROR'
    });
  }
});

// @route   DELETE /api/tenants/:tenantId
// @desc    Delete tenant (soft delete)
// @access  Private
router.delete('/:tenantId', requireTenant, async (req, res) => {
  try {
    // Soft delete tenant
    await Tenant.update(
      { isActive: false },
      { where: { id: req.tenantId } }
    );

    // Also deactivate all associated stores
    await ShopifyStore.update(
      { isActive: false },
      { where: { tenantId: req.tenantId } }
    );

    res.json({
      success: true,
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({
      error: 'Failed to delete tenant',
      code: 'DELETE_TENANT_ERROR'
    });
  }
});

// @route   GET /api/tenants/:tenantId/stores
// @desc    Get all stores for a tenant
// @access  Private
router.get('/:tenantId/stores', requireTenant, async (req, res) => {
  try {
    const stores = await ShopifyStore.findAll({
      where: { tenantId: req.tenantId },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { stores }
    });
  } catch (error) {
    console.error('Get tenant stores error:', error);
    res.status(500).json({
      error: 'Failed to get tenant stores',
      code: 'GET_TENANT_STORES_ERROR'
    });
  }
});

// @route   GET /api/tenants/:tenantId/dashboard
// @desc    Get tenant dashboard data
// @access  Private
router.get('/:tenantId/dashboard', requireTenant, async (req, res) => {
  try {
    const { Customer, Product, Order } = require('../models');
    
    // Get basic counts
    const [customerCount, productCount, orderCount] = await Promise.all([
      Customer.count({
        include: [{
          model: ShopifyStore,
          as: 'store',
          where: { tenantId: req.tenantId },
          required: true
        }]
      }),
      Product.count({
        include: [{
          model: ShopifyStore,
          as: 'store',
          where: { tenantId: req.tenantId },
          required: true
        }]
      }),
      Order.count({
        include: [{
          model: ShopifyStore,
          as: 'store',
          where: { tenantId: req.tenantId },
          required: true
        }]
      })
    ]);

    // Get total revenue
    const revenueResult = await Order.findOne({
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('total_price')), 'total_revenue']
      ],
      include: [{
        model: ShopifyStore,
        as: 'store',
        where: { tenantId: req.tenantId },
        required: true,
        attributes: []
      }],
      raw: true
    });

    const totalRevenue = parseFloat(revenueResult?.total_revenue || 0);

    // Get recent orders
    const recentOrders = await Order.findAll({
      include: [{
        model: ShopifyStore,
        as: 'store',
        where: { tenantId: req.tenantId },
        required: true,
        attributes: ['shopName']
      }],
      order: [['shopifyCreatedAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        stats: {
          customerCount,
          productCount,
          orderCount,
          totalRevenue
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get tenant dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get tenant dashboard',
      code: 'GET_TENANT_DASHBOARD_ERROR'
    });
  }
});

module.exports = router;
