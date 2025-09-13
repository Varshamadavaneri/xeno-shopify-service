const express = require('express');
const crypto = require('crypto');
const { ShopifyStore, Customer, Product, Order, OrderItem, CustomEvent } = require('../models');

const router = express.Router();

// Middleware to verify Shopify webhook signature
const verifyShopifyWebhook = (req, res, next) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = JSON.stringify(req.body);
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || 'default-secret';

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  if (hash !== hmac) {
    return res.status(401).json({ error: 'Unauthorized webhook' });
  }

  next();
};

// Helper function to find store by shop domain
const findStoreByDomain = async (shopDomain) => {
  return await ShopifyStore.findOne({
    where: { shopDomain, isActive: true }
  });
};

// @route   POST /api/webhooks/shopify/customers/create
// @desc    Handle customer creation webhook
// @access  Public (Shopify webhook)
router.post('/shopify/customers/create', verifyShopifyWebhook, async (req, res) => {
  try {
    const { id, email, first_name, last_name, phone, accepts_marketing, total_spent, orders_count, state, note, tags, verified_email, created_at, updated_at } = req.body;
    const shopDomain = req.get('X-Shopify-Shop-Domain');

    const store = await findStoreByDomain(shopDomain);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    await Customer.upsert({
      storeId: store.id,
      shopifyId: id,
      email,
      firstName: first_name,
      lastName: last_name,
      phone,
      acceptsMarketing: accepts_marketing,
      totalSpent: parseFloat(total_spent || 0),
      totalOrders: orders_count || 0,
      state,
      note,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      verifiedEmail: verified_email,
      shopifyCreatedAt: created_at,
      shopifyUpdatedAt: updated_at
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Customer create webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/webhooks/shopify/customers/update
// @desc    Handle customer update webhook
// @access  Public (Shopify webhook)
router.post('/shopify/customers/update', verifyShopifyWebhook, async (req, res) => {
  try {
    const { id, email, first_name, last_name, phone, accepts_marketing, total_spent, orders_count, state, note, tags, verified_email, updated_at } = req.body;
    const shopDomain = req.get('X-Shopify-Shop-Domain');

    const store = await findStoreByDomain(shopDomain);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    await Customer.update({
      email,
      firstName: first_name,
      lastName: last_name,
      phone,
      acceptsMarketing: accepts_marketing,
      totalSpent: parseFloat(total_spent || 0),
      totalOrders: orders_count || 0,
      state,
      note,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      verifiedEmail: verified_email,
      shopifyUpdatedAt: updated_at
    }, {
      where: { storeId: store.id, shopifyId: id }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Customer update webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/webhooks/shopify/products/create
// @desc    Handle product creation webhook
// @access  Public (Shopify webhook)
router.post('/shopify/products/create', verifyShopifyWebhook, async (req, res) => {
  try {
    const { id, title, body_html, vendor, product_type, handle, status, published_scope, tags, admin_graphql_api_id, variants, options, images, image, created_at, updated_at } = req.body;
    const shopDomain = req.get('X-Shopify-Shop-Domain');

    const store = await findStoreByDomain(shopDomain);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    await Product.upsert({
      storeId: store.id,
      shopifyId: id,
      title,
      bodyHtml: body_html,
      vendor,
      productType: product_type,
      handle,
      status,
      publishedScope: published_scope,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      adminGraphqlApiId: admin_graphql_api_id,
      variants: variants || [],
      options: options || [],
      images: images || [],
      image,
      shopifyCreatedAt: created_at,
      shopifyUpdatedAt: updated_at
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Product create webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/webhooks/shopify/products/update
// @desc    Handle product update webhook
// @access  Public (Shopify webhook)
router.post('/shopify/products/update', verifyShopifyWebhook, async (req, res) => {
  try {
    const { id, title, body_html, vendor, product_type, handle, status, published_scope, tags, admin_graphql_api_id, variants, options, images, image, updated_at } = req.body;
    const shopDomain = req.get('X-Shopify-Shop-Domain');

    const store = await findStoreByDomain(shopDomain);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    await Product.update({
      title,
      bodyHtml: body_html,
      vendor,
      productType: product_type,
      handle,
      status,
      publishedScope: published_scope,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      adminGraphqlApiId: admin_graphql_api_id,
      variants: variants || [],
      options: options || [],
      images: images || [],
      image,
      shopifyUpdatedAt: updated_at
    }, {
      where: { storeId: store.id, shopifyId: id }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Product update webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/webhooks/shopify/orders/create
// @desc    Handle order creation webhook
// @access  Public (Shopify webhook)
router.post('/shopify/orders/create', verifyShopifyWebhook, async (req, res) => {
  try {
    const orderData = req.body;
    const shopDomain = req.get('X-Shopify-Shop-Domain');

    const store = await findStoreByDomain(shopDomain);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

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
      customerData: orderData.customer,
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

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Order create webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/webhooks/shopify/orders/updated
// @desc    Handle order update webhook
// @access  Public (Shopify webhook)
router.post('/shopify/orders/updated', verifyShopifyWebhook, async (req, res) => {
  try {
    const orderData = req.body;
    const shopDomain = req.get('X-Shopify-Shop-Domain');

    const store = await findStoreByDomain(shopDomain);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Find or create customer
    let customerId = null;
    if (orderData.customer) {
      const customer = await Customer.findOne({
        where: { storeId: store.id, shopifyId: orderData.customer.id }
      });
      customerId = customer?.id;
    }

    // Update order
    await Order.update({
      customerId,
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
      customerData: orderData.customer,
      lineItems: orderData.line_items || [],
      shippingLines: orderData.shipping_lines || [],
      taxLines: orderData.tax_lines || [],
      discountCodes: orderData.discount_codes || [],
      shopifyUpdatedAt: orderData.updated_at
    }, {
      where: { storeId: store.id, shopifyId: orderData.id }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Order update webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/webhooks/shopify/orders/paid
// @desc    Handle order paid webhook
// @access  Public (Shopify webhook)
router.post('/shopify/orders/paid', verifyShopifyWebhook, async (req, res) => {
  try {
    const orderData = req.body;
    const shopDomain = req.get('X-Shopify-Shop-Domain');

    const store = await findStoreByDomain(shopDomain);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Update order financial status
    await Order.update({
      financialStatus: 'paid',
      processedAt: orderData.processed_at || new Date(),
      shopifyUpdatedAt: orderData.updated_at
    }, {
      where: { storeId: store.id, shopifyId: orderData.id }
    });

    // Create custom event for order paid
    await CustomEvent.create({
      storeId: store.id,
      eventType: 'checkout_completed',
      eventName: 'Order Paid',
      eventData: {
        orderId: orderData.id,
        orderNumber: orderData.order_number,
        totalPrice: orderData.total_price,
        currency: orderData.currency
      },
      timestamp: new Date()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Order paid webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/webhooks/shopify/orders/cancelled
// @desc    Handle order cancellation webhook
// @access  Public (Shopify webhook)
router.post('/shopify/orders/cancelled', verifyShopifyWebhook, async (req, res) => {
  try {
    const orderData = req.body;
    const shopDomain = req.get('X-Shopify-Shop-Domain');

    const store = await findStoreByDomain(shopDomain);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Update order status
    await Order.update({
      financialStatus: 'voided',
      cancelledAt: orderData.cancelled_at || new Date(),
      cancelReason: orderData.cancel_reason,
      shopifyUpdatedAt: orderData.updated_at
    }, {
      where: { storeId: store.id, shopifyId: orderData.id }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Order cancelled webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/webhooks/custom-events
// @desc    Handle custom events from frontend
// @access  Public (for frontend integration)
router.post('/custom-events', async (req, res) => {
  try {
    const { storeId, eventType, eventName, eventData, sessionId, userId, anonymousId, url, referrer, userAgent, ipAddress, properties, context, traits } = req.body;

    if (!storeId || !eventType || !eventName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify store exists
    const store = await ShopifyStore.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    await CustomEvent.create({
      storeId,
      eventType,
      eventName,
      eventData: eventData || {},
      sessionId,
      userId,
      anonymousId,
      url,
      referrer,
      userAgent,
      ipAddress,
      properties: properties || {},
      context: context || {},
      traits: traits || {},
      timestamp: new Date(),
      receivedAt: new Date(),
      source: 'web'
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Custom event webhook error:', error);
    res.status(500).json({ error: 'Event processing failed' });
  }
});

module.exports = router;
