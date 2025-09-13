const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { ShopifyStore, Customer, Product, Order, OrderItem } = require('../models');
const { requireTenant, requireStore } = require('../middleware/auth');

const router = express.Router();

// Shopify API configuration
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2023-10';
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES || 'read_products,read_orders,read_customers,read_inventory';

// Helper function to make Shopify API calls
const makeShopifyRequest = async (shopDomain, accessToken, endpoint, method = 'GET', data = null) => {
  const url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/${endpoint}`;
  
  const config = {
    method,
    url,
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Shopify API error:', error.response?.data || error.message);
    throw error;
  }
};

// @route   GET /api/shopify/:tenantId/oauth/start
// @desc    Start Shopify OAuth flow
// @access  Private
router.get('/:tenantId/oauth/start', requireTenant, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { shop } = req.query;

    if (!shop) {
      return res.status(400).json({
        error: 'Shop domain is required',
        code: 'MISSING_SHOP'
      });
    }

    // Validate shop domain format
    if (!shop.match(/^[a-zA-Z0-9-]+\.myshopify\.com$/)) {
      return res.status(400).json({
        error: 'Invalid shop domain format',
        code: 'INVALID_SHOP_FORMAT'
      });
    }

    // Generate state parameter for security
    const state = crypto.randomBytes(16).toString('hex');
    
    // Store state in session or database for validation
    req.session = req.session || {};
    req.session.oauthState = state;
    req.session.tenantId = tenantId;

    // Build OAuth URL
    const oauthUrl = `https://${shop}/admin/oauth/authorize?` +
      `client_id=${SHOPIFY_CLIENT_ID}&` +
      `scope=${SHOPIFY_SCOPES}&` +
      `redirect_uri=${encodeURIComponent(`${process.env.BASE_URL || 'http://localhost:5001'}/api/shopify/oauth/callback`)}&` +
      `state=${state}`;

    res.json({
      success: true,
      oauthUrl,
      message: 'Redirect user to this URL to complete OAuth'
    });
  } catch (error) {
    console.error('OAuth start error:', error);
    res.status(500).json({
      error: 'Failed to start OAuth flow',
      code: 'OAUTH_START_ERROR'
    });
  }
});

// @route   GET /api/shopify/oauth/callback
// @desc    Handle Shopify OAuth callback
// @access  Public
router.get('/oauth/callback', async (req, res) => {
  try {
    const { code, state, shop } = req.query;

    if (!code || !state || !shop) {
      return res.status(400).json({
        error: 'Missing required OAuth parameters',
        code: 'MISSING_OAUTH_PARAMS'
      });
    }

    // For demo purposes, we'll create a mock access token
    // In production, you would exchange the code for an access token
    const mockAccessToken = `mock_token_${Date.now()}`;

    // Get shop information
    const shopInfo = {
      id: Math.floor(Math.random() * 1000000),
      name: shop.replace('.myshopify.com', ''),
      email: `admin@${shop}`,
      domain: shop,
      currency: 'USD',
      timezone: 'UTC'
    };

    // For demo, we'll redirect to a success page
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/stores?connected=true&shop=${shop}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/stores?error=oauth_failed`);
  }
});

// @route   POST /api/shopify/:tenantId/connect
// @desc    Connect a Shopify store to tenant (simplified for demo)
// @access  Private
router.post('/:tenantId/connect', requireTenant, [
  body('shopDomain').matches(/^[a-zA-Z0-9-]+\.myshopify\.com$/),
  body('shopName').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { shopDomain, shopName } = req.body;

    // For demo purposes, create a mock store without requiring real access token
    // Check if store already exists
    const existingStore = await ShopifyStore.findOne({
      where: { shopDomain }
    });

    if (existingStore) {
      return res.status(400).json({
        error: 'Store already connected',
        code: 'STORE_EXISTS'
      });
    }

    // Create mock store data for demo
    const mockAccessToken = `demo_token_${Date.now()}`;
    const mockShopInfo = {
      id: Math.floor(Math.random() * 1000000),
      name: shopName,
      email: `admin@${shopDomain}`,
      currency: 'USD',
      timezone: 'UTC'
    };

    // Create store record
    const store = await ShopifyStore.create({
      tenantId: req.tenantId,
      shopDomain,
      accessToken: mockAccessToken,
      shopId: mockShopInfo.id,
      shopName,
      shopEmail: mockShopInfo.email,
      currency: mockShopInfo.currency,
      timezone: mockShopInfo.timezone,
      settings: {
        syncCustomers: true,
        syncProducts: true,
        syncOrders: true,
        syncEvents: true,
        autoSync: true,
          syncInterval: 3600
        }
      });

      // Generate some mock data for demo purposes
      await generateMockData(store.id, req.tenantId);

      res.status(201).json({
        success: true,
        message: 'Shopify store connected successfully',
        data: { store }
      });
  } catch (error) {
    console.error('Connect store error:', error);
    res.status(500).json({
      error: 'Failed to connect store',
      code: 'CONNECT_STORE_ERROR'
    });
  }
});

// @route   GET /api/shopify/:tenantId/stores
// @desc    Get all stores for tenant
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
    console.error('Get stores error:', error);
    res.status(500).json({
      error: 'Failed to get stores',
      code: 'GET_STORES_ERROR'
    });
  }
});

// @route   POST /api/shopify/:tenantId/:storeId/sync
// @desc    Manually sync data from Shopify
// @access  Private
router.post('/:tenantId/:storeId/sync', requireTenant, requireStore, async (req, res) => {
  try {
    const { dataType } = req.body; // customers, products, orders, all
    
    // Update sync status
    await req.store.update({ 
      syncStatus: 'syncing',
      lastSyncAt: new Date()
    });

    const syncResults = {};

    try {
      if (dataType === 'customers' || dataType === 'all') {
        syncResults.customers = await syncCustomers(req.store);
      }
      
      if (dataType === 'products' || dataType === 'all') {
        syncResults.products = await syncProducts(req.store);
      }
      
      if (dataType === 'orders' || dataType === 'all') {
        syncResults.orders = await syncOrders(req.store);
      }

      // Update sync status to completed
      await req.store.update({ syncStatus: 'completed' });

      res.json({
        success: true,
        message: 'Data sync completed successfully',
        data: syncResults
      });
    } catch (syncError) {
      // Update sync status to failed
      await req.store.update({ syncStatus: 'failed' });
      throw syncError;
    }
  } catch (error) {
    console.error('Sync data error:', error);
    res.status(500).json({
      error: 'Data sync failed',
      code: 'SYNC_ERROR'
    });
  }
});

// Helper function to sync customers
const syncCustomers = async (store) => {
  let pageInfo = null;
  let totalSynced = 0;

  do {
    const endpoint = pageInfo 
      ? `customers.json?page_info=${pageInfo}`
      : 'customers.json?limit=250';

    const response = await makeShopifyRequest(store.shopDomain, store.accessToken, endpoint);
    const customers = response.customers;

    for (const customerData of customers) {
      await Customer.upsert({
        storeId: store.id,
        shopifyId: customerData.id,
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        phone: customerData.phone,
        acceptsMarketing: customerData.accepts_marketing,
        totalSpent: parseFloat(customerData.total_spent || 0),
        totalOrders: customerData.orders_count || 0,
        state: customerData.state,
        note: customerData.note,
        tags: customerData.tags ? customerData.tags.split(',').map(tag => tag.trim()) : [],
        verifiedEmail: customerData.verified_email,
        multipassIdentifier: customerData.multipass_identifier,
        taxExempt: customerData.tax_exempt,
        taxExemptions: customerData.tax_exemptions || [],
        acceptsMarketingUpdatedAt: customerData.accepts_marketing_updated_at,
        marketingOptInLevel: customerData.marketing_opt_in_level,
        adminGraphqlApiId: customerData.admin_graphql_api_id,
        defaultAddress: customerData.default_address,
        shopifyCreatedAt: customerData.created_at,
        shopifyUpdatedAt: customerData.updated_at
      });
      totalSynced++;
    }

    // Check for pagination
    const linkHeader = response.headers?.['link'];
    pageInfo = linkHeader?.includes('page_info=') 
      ? linkHeader.match(/page_info=([^&>]+)/)?.[1] 
      : null;

  } while (pageInfo);

  return { synced: totalSynced };
};

// Helper function to sync products
const syncProducts = async (store) => {
  let pageInfo = null;
  let totalSynced = 0;

  do {
    const endpoint = pageInfo 
      ? `products.json?page_info=${pageInfo}`
      : 'products.json?limit=250';

    const response = await makeShopifyRequest(store.shopDomain, store.accessToken, endpoint);
    const products = response.products;

    for (const productData of products) {
      await Product.upsert({
        storeId: store.id,
        shopifyId: productData.id,
        title: productData.title,
        bodyHtml: productData.body_html,
        vendor: productData.vendor,
        productType: productData.product_type,
        handle: productData.handle,
        status: productData.status,
        publishedScope: productData.published_scope,
        tags: productData.tags ? productData.tags.split(',').map(tag => tag.trim()) : [],
        adminGraphqlApiId: productData.admin_graphql_api_id,
        variants: productData.variants || [],
        options: productData.options || [],
        images: productData.images || [],
        image: productData.image,
        shopifyCreatedAt: productData.created_at,
        shopifyUpdatedAt: productData.updated_at
      });
      totalSynced++;
    }

    // Check for pagination
    const linkHeader = response.headers?.['link'];
    pageInfo = linkHeader?.includes('page_info=') 
      ? linkHeader.match(/page_info=([^&>]+)/)?.[1] 
      : null;

  } while (pageInfo);

  return { synced: totalSynced };
};

// Helper function to sync orders
const syncOrders = async (store) => {
  let pageInfo = null;
  let totalSynced = 0;

  do {
    const endpoint = pageInfo 
      ? `orders.json?page_info=${pageInfo}&status=any&limit=250`
      : 'orders.json?status=any&limit=250';

    const response = await makeShopifyRequest(store.shopDomain, store.accessToken, endpoint);
    const orders = response.orders;

    for (const orderData of orders) {
      // Find or create customer
      let customerId = null;
      if (orderData.customer) {
        const customer = await Customer.findOne({
          where: { storeId: store.id, shopifyId: orderData.customer.id }
        });
        customerId = customer?.id;
      }

      // Create/update order
      const [order] = await Order.upsert({
        storeId: store.id,
        customerId,
        shopifyId: orderData.id,
        orderNumber: orderData.order_number,
        name: orderData.name,
        email: orderData.email,
        phone: orderData.phone,
        financialStatus: orderData.financial_status,
        fulfillmentStatus: orderData.fulfillment_status,
        currency: orderData.currency,
        totalPrice: parseFloat(orderData.total_price || 0),
        subtotalPrice: parseFloat(orderData.subtotal_price || 0),
        totalTax: parseFloat(orderData.total_tax || 0),
        totalDiscounts: parseFloat(orderData.total_discounts || 0),
        totalWeight: parseFloat(orderData.total_weight || 0),
        taxesIncluded: orderData.taxes_included,
        confirmed: orderData.confirmed,
        processedAt: orderData.processed_at,
        cancelledAt: orderData.cancelled_at,
        cancelReason: orderData.cancel_reason,
        closedAt: orderData.closed_at,
        test: orderData.test,
        tags: orderData.tags ? orderData.tags.split(',').map(tag => tag.trim()) : [],
        note: orderData.note,
        sourceName: orderData.source_name,
        referringSite: orderData.referring_site,
        landingSite: orderData.landing_site,
        browserIp: orderData.browser_ip,
        orderStatusUrl: orderData.order_status_url,
        adminGraphqlApiId: orderData.admin_graphql_api_id,
        shippingAddress: orderData.shipping_address,
        billingAddress: orderData.billing_address,
        customer: orderData.customer,
        lineItems: orderData.line_items || [],
        shippingLines: orderData.shipping_lines || [],
        taxLines: orderData.tax_lines || [],
        discountCodes: orderData.discount_codes || [],
        shopifyCreatedAt: orderData.created_at,
        shopifyUpdatedAt: orderData.updated_at
      });

      // Sync order items
      if (orderData.line_items) {
        for (const itemData of orderData.line_items) {
          // Find product
          const product = await Product.findOne({
            where: { storeId: store.id, shopifyId: itemData.product_id }
          });

          await OrderItem.upsert({
            orderId: order.id,
            productId: product?.id,
            shopifyId: itemData.id,
            variantId: itemData.variant_id,
            title: itemData.title,
            variantTitle: itemData.variant_title,
            vendor: itemData.vendor,
            productType: itemData.product_type,
            sku: itemData.sku,
            variantInventoryManagement: itemData.variant_inventory_management,
            variantInventoryPolicy: itemData.variant_inventory_policy,
            variantFulfillmentService: itemData.variant_fulfillment_service,
            productExists: itemData.product_exists,
            fulfillableQuantity: itemData.fulfillable_quantity,
            grams: itemData.grams,
            price: parseFloat(itemData.price || 0),
            totalDiscount: parseFloat(itemData.total_discount || 0),
            fulfillmentStatus: itemData.fulfillment_status,
            priceSet: itemData.price_set,
            totalDiscountSet: itemData.total_discount_set,
            discountAllocations: itemData.discount_allocations || [],
            duties: itemData.duties || [],
            adminGraphqlApiId: itemData.admin_graphql_api_id,
            taxLines: itemData.tax_lines || [],
            originLocation: itemData.origin_location,
            destinationLocation: itemData.destination_location,
            quantity: itemData.quantity,
            requiresShipping: itemData.requires_shipping,
            taxable: itemData.taxable,
            giftCard: itemData.gift_card,
            name: itemData.name,
            variantInventoryQuantity: itemData.variant_inventory_quantity,
            properties: itemData.properties || [],
            productHasOnlyDefaultVariant: itemData.product_has_only_default_variant,
            fulfillableService: itemData.fulfillable_service
          });
        }
      }

      totalSynced++;
    }

    // Check for pagination
    const linkHeader = response.headers?.['link'];
    pageInfo = linkHeader?.includes('page_info=') 
      ? linkHeader.match(/page_info=([^&>]+)/)?.[1] 
      : null;

  } while (pageInfo);

  return { synced: totalSynced };
};

// @route   GET /api/shopify/:tenantId/:storeId/customers
// @desc    Get customers for a store
// @access  Private
router.get('/:tenantId/:storeId/customers', requireTenant, requireStore, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { storeId: req.storeId };
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { firstName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { lastName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['totalSpent', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      error: 'Failed to get customers',
      code: 'GET_CUSTOMERS_ERROR'
    });
  }
});

// @route   GET /api/shopify/:tenantId/:storeId/products
// @desc    Get products for a store
// @access  Private
router.get('/:tenantId/:storeId/products', requireTenant, requireStore, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, vendor, productType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { storeId: req.storeId };
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { vendor: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }
    if (vendor) whereClause.vendor = vendor;
    if (productType) whereClause.productType = productType;

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['shopifyCreatedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to get products',
      code: 'GET_PRODUCTS_ERROR'
    });
  }
});

// @route   GET /api/shopify/:tenantId/:storeId/orders
// @desc    Get orders for a store
// @access  Private
router.get('/:tenantId/:storeId/orders', requireTenant, requireStore, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      financialStatus, 
      fulfillmentStatus,
      startDate,
      endDate
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { storeId: req.storeId };
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }
    if (financialStatus) whereClause.financialStatus = financialStatus;
    if (fulfillmentStatus) whereClause.fulfillmentStatus = fulfillmentStatus;
    if (startDate || endDate) {
      whereClause.shopifyCreatedAt = {};
      if (startDate) whereClause.shopifyCreatedAt[require('sequelize').Op.gte] = startDate;
      if (endDate) whereClause.shopifyCreatedAt[require('sequelize').Op.lte] = endDate;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['firstName', 'lastName', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['shopifyCreatedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to get orders',
      code: 'GET_ORDERS_ERROR'
    });
  }
});

// Helper function to generate comprehensive mock data for demo purposes
const generateMockData = async (storeId, tenantId) => {
  try {
    const storeName = storeId.includes('fashion') ? 'Fashion' : 
                     storeId.includes('tech') ? 'Tech' : 
                     storeId.includes('home') ? 'Home' : 'General';
    
    // Generate realistic customer data
    const customerNames = [
      { first: 'Sarah', last: 'Johnson' }, { first: 'Michael', last: 'Chen' },
      { first: 'Emily', last: 'Rodriguez' }, { first: 'David', last: 'Kim' },
      { first: 'Jessica', last: 'Williams' }, { first: 'Christopher', last: 'Brown' },
      { first: 'Amanda', last: 'Davis' }, { first: 'Matthew', last: 'Miller' },
      { first: 'Ashley', last: 'Wilson' }, { first: 'Joshua', last: 'Moore' },
      { first: 'Stephanie', last: 'Taylor' }, { first: 'Andrew', last: 'Anderson' },
      { first: 'Jennifer', last: 'Thomas' }, { first: 'Daniel', last: 'Jackson' },
      { first: 'Lisa', last: 'White' }, { first: 'James', last: 'Harris' },
      { first: 'Michelle', last: 'Martin' }, { first: 'Robert', last: 'Thompson' },
      { first: 'Kimberly', last: 'Garcia' }, { first: 'Kevin', last: 'Martinez' },
      { first: 'Donna', last: 'Robinson' }, { first: 'Brian', last: 'Clark' },
      { first: 'Nancy', last: 'Rodriguez' }, { first: 'Edward', last: 'Lewis' },
      { first: 'Sandra', last: 'Lee' }, { first: 'Ronald', last: 'Walker' },
      { first: 'Carol', last: 'Hall' }, { first: 'Timothy', last: 'Allen' },
      { first: 'Ruth', last: 'Young' }, { first: 'Jason', last: 'Hernandez' }
    ];

    const customers = [];
    for (let i = 0; i < 30; i++) {
      const name = customerNames[i % customerNames.length];
      const customer = await Customer.create({
        storeId,
        tenantId,
        shopifyId: Date.now() + i + Math.floor(Math.random() * 1000),
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@email.com`,
        firstName: name.first,
        lastName: name.last,
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        totalSpent: Math.floor(Math.random() * 2500) + 50,
        totalOrders: Math.floor(Math.random() * 8) + 1,
        tags: ['vip', 'regular', 'new', 'premium'][Math.floor(Math.random() * 4)],
        acceptsMarketing: Math.random() > 0.3,
        state: 'enabled',
        verifiedEmail: Math.random() > 0.2
      });
      customers.push(customer);
    }

    // Generate realistic product data based on store type
    const productCategories = {
      'Fashion': [
        { title: 'Premium Cotton T-Shirt', type: 'Apparel', vendor: 'StyleCo', price: 29.99 },
        { title: 'Designer Jeans', type: 'Apparel', vendor: 'DenimWorks', price: 89.99 },
        { title: 'Leather Jacket', type: 'Outerwear', vendor: 'LeatherCraft', price: 199.99 },
        { title: 'Running Shoes', type: 'Footwear', vendor: 'SportMax', price: 129.99 },
        { title: 'Summer Dress', type: 'Apparel', vendor: 'FashionForward', price: 79.99 },
        { title: 'Wool Sweater', type: 'Apparel', vendor: 'CozyWear', price: 69.99 },
        { title: 'Designer Handbag', type: 'Accessories', vendor: 'LuxuryBags', price: 299.99 },
        { title: 'Silk Scarf', type: 'Accessories', vendor: 'ElegantStyle', price: 49.99 },
        { title: 'Winter Coat', type: 'Outerwear', vendor: 'WarmWear', price: 159.99 },
        { title: 'Casual Sneakers', type: 'Footwear', vendor: 'ComfortShoes', price: 89.99 }
      ],
      'Tech': [
        { title: 'Wireless Headphones', type: 'Electronics', vendor: 'TechSound', price: 149.99 },
        { title: 'Smartphone Case', type: 'Accessories', vendor: 'ProtectTech', price: 24.99 },
        { title: 'Bluetooth Speaker', type: 'Electronics', vendor: 'AudioMax', price: 79.99 },
        { title: 'USB-C Cable', type: 'Accessories', vendor: 'ConnectPro', price: 19.99 },
        { title: 'Wireless Charger', type: 'Electronics', vendor: 'PowerUp', price: 39.99 },
        { title: 'Laptop Stand', type: 'Accessories', vendor: 'ErgoTech', price: 59.99 },
        { title: 'Mechanical Keyboard', type: 'Electronics', vendor: 'TypeMaster', price: 129.99 },
        { title: 'Gaming Mouse', type: 'Electronics', vendor: 'GameTech', price: 69.99 },
        { title: 'Monitor Stand', type: 'Accessories', vendor: 'DisplayPro', price: 49.99 },
        { title: 'Webcam', type: 'Electronics', vendor: 'VideoTech', price: 89.99 }
      ],
      'Home': [
        { title: 'Ceramic Coffee Mug', type: 'Kitchen', vendor: 'HomeBrew', price: 14.99 },
        { title: 'Throw Pillow', type: 'Decor', vendor: 'CozyHome', price: 29.99 },
        { title: 'LED Desk Lamp', type: 'Lighting', vendor: 'BrightIdeas', price: 49.99 },
        { title: 'Bamboo Cutting Board', type: 'Kitchen', vendor: 'EcoKitchen', price: 34.99 },
        { title: 'Wall Art Print', type: 'Decor', vendor: 'ArtisticHome', price: 39.99 },
        { title: 'Plant Pot Set', type: 'Garden', vendor: 'GreenThumb', price: 24.99 },
        { title: 'Candles Set', type: 'Decor', vendor: 'Aromatherapy', price: 19.99 },
        { title: 'Kitchen Towels', type: 'Kitchen', vendor: 'CleanHome', price: 12.99 },
        { title: 'Storage Baskets', type: 'Organization', vendor: 'OrganizePro', price: 22.99 },
        { title: 'Area Rug', type: 'Decor', vendor: 'FloorStyle', price: 89.99 }
      ]
    };

    const categoryProducts = productCategories[storeName] || productCategories['Fashion'];
    const products = [];
    
    for (let i = 0; i < categoryProducts.length; i++) {
      const productData = categoryProducts[i];
      const product = await Product.create({
        storeId,
        tenantId,
        shopifyId: Date.now() + i + Math.floor(Math.random() * 2000) + 10000,
        title: productData.title,
        bodyHtml: `<p>High-quality ${productData.title.toLowerCase()} from ${productData.vendor}. Perfect for your needs.</p>`,
        vendor: productData.vendor,
        productType: productData.type,
        handle: productData.title.toLowerCase().replace(/\s+/g, '-'),
        status: 'active',
        tags: [productData.type.toLowerCase(), 'featured', 'bestseller'][Math.floor(Math.random() * 3)],
        variants: [{
          id: 3000 + i,
          title: 'Default Title',
          price: productData.price.toFixed(2),
          sku: `${productData.vendor.toUpperCase()}-${i + 1}`,
          inventoryQuantity: Math.floor(Math.random() * 200) + 10
        }]
      });
      products.push(product);
    }

    // Generate comprehensive order data with realistic patterns
    const orderStatuses = ['paid', 'pending', 'refunded', 'partially_refunded'];
    const fulfillmentStatuses = ['fulfilled', 'pending', 'unfulfilled', 'partial'];
    
    for (let i = 1; i <= 50; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      
      for (let j = 0; j < numProducts; j++) {
        selectedProducts.push(products[Math.floor(Math.random() * products.length)]);
      }
      
      const subtotal = selectedProducts.reduce((sum, product) => 
        sum + (parseFloat(product.variants[0].price) * (Math.floor(Math.random() * 3) + 1)), 0);
      
      const tax = subtotal * 0.08;
      const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0;
      const total = subtotal + tax - discount;
      
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 90));
      
      const order = await Order.create({
        storeId,
        tenantId,
        customerId: customer.id,
        shopifyId: Date.now() + i + Math.floor(Math.random() * 3000) + 20000,
        orderNumber: `#${String(i).padStart(4, '0')}`,
        name: `#${String(i).padStart(4, '0')}`,
        email: customer.email,
        phone: customer.phone,
        financialStatus: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        fulfillmentStatus: fulfillmentStatuses[Math.floor(Math.random() * fulfillmentStatuses.length)],
        currency: 'USD',
        totalPrice: total,
        subtotalPrice: subtotal,
        totalTax: tax,
        totalDiscounts: discount,
        tags: ['online', 'mobile', 'desktop'][Math.floor(Math.random() * 3)],
        customerData: {
          id: customer.shopifyId,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName
        },
        lineItems: selectedProducts.map((product, index) => ({
          id: 5000 + i + index,
          productId: product.shopifyId,
          variantId: product.variants[0].id,
          title: product.title,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: product.variants[0].price
        })),
        shopifyCreatedAt: orderDate,
        shopifyUpdatedAt: orderDate
      });

      // Create order items
      for (let j = 0; j < selectedProducts.length; j++) {
        const product = selectedProducts[j];
        await OrderItem.create({
          orderId: order.id,
          productId: product.id,
          shopifyId: 5000 + i + j,
          variantId: product.variants[0].id,
          title: product.title,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: parseFloat(product.variants[0].price),
          vendor: product.vendor,
          productType: product.productType
        });
      }
    }

    // Generate custom events for analytics
    const eventTypes = ['page_view', 'product_view', 'add_to_cart', 'checkout_started', 'cart_abandoned', 'purchase'];
    for (let i = 1; i <= 100; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() - Math.floor(Math.random() * 30));
      
      await CustomEvent.create({
        storeId,
        customerId: customer.id,
        eventType,
        eventName: eventType.replace('_', ' '),
        eventData: {
          page: eventType === 'page_view' ? '/products' : '/checkout',
          product_id: eventType.includes('product') ? products[Math.floor(Math.random() * products.length)].shopifyId : null,
          value: eventType === 'purchase' ? Math.floor(Math.random() * 200) + 50 : null
        },
        timestamp: eventDate,
        sessionId: `session_${Math.floor(Math.random() * 1000)}`,
        url: `https://${storeName.toLowerCase()}-store.com/products`,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        source: 'web'
      });
    }

    console.log(`✅ Generated comprehensive mock data for ${storeName} store ${storeId}: 30 customers, ${products.length} products, 50 orders, 100 events`);
  } catch (error) {
    console.error('Error generating mock data:', error);
  }
};

module.exports = router;
