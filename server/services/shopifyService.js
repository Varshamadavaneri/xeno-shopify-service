const axios = require('axios');
const { Customer, Product, Order, OrderItem } = require('../models');

// Shopify API configuration
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2023-10';

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

// Helper function to get shop information
const getShopInfo = async (shopDomain, accessToken) => {
  return await makeShopifyRequest(shopDomain, accessToken, 'shop.json');
};

// Helper function to test Shopify connection
const testConnection = async (shopDomain, accessToken) => {
  try {
    const shopInfo = await getShopInfo(shopDomain, accessToken);
    return {
      success: true,
      shop: shopInfo.shop
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.errors || error.message
    };
  }
};

module.exports = {
  makeShopifyRequest,
  syncCustomers,
  syncProducts,
  syncOrders,
  getShopInfo,
  testConnection
};
