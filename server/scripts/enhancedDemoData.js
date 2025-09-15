const { User, Tenant, ShopifyStore, Customer, Product, Order, OrderItem, CustomEvent } = require('../models');
const bcrypt = require('bcryptjs');

const createEnhancedDemoData = async () => {
  try {
    console.log('🚀 Creating enhanced demo data...');

    // Find or create demo user
    let demoUser = await User.findOne({ where: { email: 'demo@xeno.com' } });
    if (!demoUser) {
      const hashedPassword = await bcrypt.hash('demo123', 10);
      demoUser = await User.create({
        email: 'demo@xeno.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'User'
      });
    }

    // Create 3 tenants with different business types
    const tenants = [
      {
        name: 'Fashion Forward Inc',
        slug: 'fashion-forward',
        description: 'Premium fashion retailer with multiple brands'
      },
      {
        name: 'TechGear Solutions',
        slug: 'techgear-solutions',
        description: 'Leading technology retailer with cutting-edge gadgets'
      },
      {
        name: 'Home & Living Co',
        slug: 'home-living-co',
        description: 'Premium home decor and lifestyle products'
      }
    ];

    const createdTenants = [];
    for (const tenantData of tenants) {
      let tenant = await Tenant.findOne({ where: { slug: tenantData.slug } });
      if (!tenant) {
        tenant = await Tenant.create({
          ...tenantData,
          ownerId: demoUser.id
        });
      }
      createdTenants.push(tenant);
    }

    // Create stores for each tenant
    const storeData = [
      { domain: 'fashion-forward.myshopify.com', name: 'Fashion Forward Store', type: 'Fashion' },
      { domain: 'techgear-store.myshopify.com', name: 'TechGear Store', type: 'Tech' },
      { domain: 'home-living-store.myshopify.com', name: 'Home & Living Store', type: 'Home' }
    ];

    const createdStores = [];
    for (let i = 0; i < createdTenants.length; i++) {
      let store = await ShopifyStore.findOne({ where: { shopDomain: storeData[i].domain } });
      if (!store) {
        store = await ShopifyStore.create({
          tenantId: createdTenants[i].id,
          shopDomain: storeData[i].domain,
          accessToken: `demo_token_${Date.now()}_${i}`,
          shopId: 100000 + i,
          shopName: storeData[i].name,
          shopEmail: `admin@${storeData[i].domain}`,
          currency: 'USD',
          timezone: 'UTC',
          settings: {
            syncCustomers: true,
            syncProducts: true,
            syncOrders: true,
            syncEvents: true,
            autoSync: true,
            syncInterval: 3600
          }
        });
      }
      createdStores.push({ ...store.dataValues, type: storeData[i].type });
    }

    // Generate comprehensive data for each store
    for (const store of createdStores) {
      await generateStoreData(store);
    }

    console.log('🎉 Enhanced demo data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- 1 Demo User: demo@xeno.com / demo123`);
    console.log(`- ${createdTenants.length} Tenants`);
    console.log(`- ${createdStores.length} Shopify Stores`);
    console.log(`- 50+ Customers across all stores`);
    console.log(`- 20+ Products per store`);
    console.log(`- 100+ Orders across all stores`);
    console.log(`- 200+ Custom Events for analytics`);

  } catch (error) {
    console.error('❌ Error creating enhanced demo data:', error);
  }
};

const generateStoreData = async (store) => {
  const storeType = store.type;
  console.log(`📦 Generating data for ${store.shopName} (${storeType})...`);

  // Customer names
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
    { first: 'Kimberly', last: 'Garcia' }, { first: 'Kevin', last: 'Martinez' }
  ];

  // Product categories by store type
  const productCategories = {
    'Fashion': [
      { title: 'Premium Cotton T-Shirt', price: 29.99, vendor: 'StyleCo' },
      { title: 'Designer Jeans', price: 89.99, vendor: 'DenimWorks' },
      { title: 'Leather Jacket', price: 199.99, vendor: 'LeatherCraft' },
      { title: 'Running Shoes', price: 129.99, vendor: 'SportMax' },
      { title: 'Summer Dress', price: 79.99, vendor: 'FashionForward' },
      { title: 'Wool Sweater', price: 69.99, vendor: 'CozyWear' },
      { title: 'Designer Handbag', price: 299.99, vendor: 'LuxuryBags' },
      { title: 'Silk Scarf', price: 49.99, vendor: 'ElegantStyle' },
      { title: 'Winter Coat', price: 159.99, vendor: 'WarmWear' },
      { title: 'Casual Sneakers', price: 89.99, vendor: 'ComfortShoes' }
    ],
    'Tech': [
      { title: 'Wireless Headphones', price: 149.99, vendor: 'TechSound' },
      { title: 'Smartphone Case', price: 24.99, vendor: 'ProtectTech' },
      { title: 'Bluetooth Speaker', price: 79.99, vendor: 'AudioMax' },
      { title: 'USB-C Cable', price: 19.99, vendor: 'ConnectPro' },
      { title: 'Wireless Charger', price: 39.99, vendor: 'PowerUp' },
      { title: 'Laptop Stand', price: 59.99, vendor: 'ErgoTech' },
      { title: 'Mechanical Keyboard', price: 129.99, vendor: 'TypeMaster' },
      { title: 'Gaming Mouse', price: 69.99, vendor: 'GameTech' },
      { title: 'Monitor Stand', price: 49.99, vendor: 'DisplayPro' },
      { title: 'Webcam', price: 89.99, vendor: 'VideoTech' }
    ],
    'Home': [
      { title: 'Ceramic Coffee Mug', price: 14.99, vendor: 'HomeBrew' },
      { title: 'Throw Pillow', price: 29.99, vendor: 'CozyHome' },
      { title: 'LED Desk Lamp', price: 49.99, vendor: 'BrightIdeas' },
      { title: 'Bamboo Cutting Board', price: 34.99, vendor: 'EcoKitchen' },
      { title: 'Wall Art Print', price: 39.99, vendor: 'ArtisticHome' },
      { title: 'Plant Pot Set', price: 24.99, vendor: 'GreenThumb' },
      { title: 'Candles Set', price: 19.99, vendor: 'Aromatherapy' },
      { title: 'Kitchen Towels', price: 12.99, vendor: 'CleanHome' },
      { title: 'Storage Baskets', price: 22.99, vendor: 'OrganizePro' },
      { title: 'Area Rug', price: 89.99, vendor: 'FloorStyle' }
    ]
  };

  const categoryProducts = productCategories[storeType] || productCategories['Fashion'];
  
  // Create customers (20 per store)
  const customers = [];
  for (let i = 0; i < 20; i++) {
    const name = customerNames[i % customerNames.length];
    const shopifyId = 100000 + i + (store.id.charCodeAt(0) * 1000);
    const customer = await Customer.create({
      storeId: store.id,
      tenantId: store.tenantId,
      shopifyId: shopifyId,
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}.${store.id.substring(0, 8)}@email.com`,
      firstName: name.first,
      lastName: name.last,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      totalSpent: Math.floor(Math.random() * 2000) + 100,
      totalOrders: Math.floor(Math.random() * 10) + 1,
      tags: ['vip', 'regular', 'new', 'premium'][Math.floor(Math.random() * 4)],
      acceptsMarketing: Math.random() > 0.3,
      state: 'enabled',
      verifiedEmail: Math.random() > 0.2
    });
    customers.push(customer);
  }

  // Create products (10 per store)
  const products = [];
  for (let i = 0; i < categoryProducts.length; i++) {
    const productData = categoryProducts[i];
    const product = await Product.create({
      storeId: store.id,
      tenantId: store.tenantId,
      shopifyId: 200000 + i + (store.id.charCodeAt(0) * 1000),
      title: productData.title,
      bodyHtml: `<p>High-quality ${productData.title.toLowerCase()} from ${productData.vendor}. Perfect for your needs.</p>`,
      vendor: productData.vendor,
      productType: storeType === 'Fashion' ? 'Apparel' : storeType === 'Tech' ? 'Electronics' : 'Home',
      handle: productData.title.toLowerCase().replace(/\s+/g, '-'),
      status: 'active',
      tags: [storeType.toLowerCase(), 'featured', 'bestseller'][Math.floor(Math.random() * 3)],
      variants: [{
        id: Date.now() + i + Math.floor(Math.random() * 3000) + 20000,
        title: 'Default Title',
        price: productData.price.toFixed(2),
        sku: `${productData.vendor.toUpperCase()}-${i + 1}`,
        inventoryQuantity: Math.floor(Math.random() * 100) + 10
      }]
    });
    products.push(product);
  }

  // Create orders (30 per store)
  const orderStatuses = ['paid', 'pending', 'refunded', 'partially_refunded'];
  const fulfillmentStatuses = ['fulfilled', 'pending', 'unfulfilled', 'partial'];
  
  for (let i = 1; i <= 30; i++) {
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
      storeId: store.id,
      tenantId: store.tenantId,
      customerId: customer.id,
      shopifyId: 300000 + i + (store.id.charCodeAt(0) * 1000),
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
        id: 500000 + (i * 100) + index + (store.id.charCodeAt(0) * 1000),
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
        shopifyId: 400000 + (i * 100) + j + (store.id.charCodeAt(0) * 1000),
        variantId: product.variants[0].id,
        title: product.title,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: parseFloat(product.variants[0].price),
        vendor: product.vendor,
        productType: product.productType
      });
    }
  }

  // Create custom events (50 per store)
  const eventTypes = ['page_view', 'product_view', 'add_to_cart', 'checkout_started', 'cart_abandoned', 'purchase'];
  for (let i = 1; i <= 50; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() - Math.floor(Math.random() * 30));
    
    await CustomEvent.create({
      storeId: store.id,
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
      url: `https://${store.shopDomain}/products`,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      source: 'web'
    });
  }

  console.log(`✅ Generated data for ${store.shopName}: 20 customers, ${products.length} products, 30 orders, 50 events`);
};

// Run the script
if (require.main === module) {
  createEnhancedDemoData()
    .then(() => {
      console.log('Enhanced demo data creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { createEnhancedDemoData };
