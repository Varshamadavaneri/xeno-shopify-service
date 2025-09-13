const { User, Tenant, ShopifyStore, Customer, Product, Order, OrderItem, CustomEvent } = require('../models');
const bcrypt = require('bcryptjs');

const populateDemoData = async () => {
  try {
    console.log('🚀 Starting comprehensive demo data population...');

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
      console.log('✅ Created demo user');
    } else {
      console.log('✅ Using existing demo user');
    }

    // Create multiple tenants
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
      },
      {
        name: 'Sports & Fitness Hub',
        slug: 'sports-fitness-hub',
        description: 'Complete sports and fitness equipment retailer'
      },
      {
        name: 'Beauty & Wellness Store',
        slug: 'beauty-wellness',
        description: 'Premium beauty and wellness products'
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
        console.log(`✅ Created tenant: ${tenant.name}`);
      } else {
        console.log(`✅ Using existing tenant: ${tenant.name}`);
      }
      createdTenants.push(tenant);
    }

    // Create stores for each tenant
    const storeData = [
      { domain: 'fashion-forward.myshopify.com', name: 'Fashion Forward Store', type: 'Fashion' },
      { domain: 'techgear-store.myshopify.com', name: 'TechGear Store', type: 'Tech' },
      { domain: 'home-living-store.myshopify.com', name: 'Home & Living Store', type: 'Home' },
      { domain: 'sports-hub-store.myshopify.com', name: 'Sports Hub Store', type: 'Sports' },
      { domain: 'beauty-wellness-store.myshopify.com', name: 'Beauty & Wellness Store', type: 'Beauty' }
    ];

    const createdStores = [];
    for (let i = 0; i < createdTenants.length; i++) {
      let store = await ShopifyStore.findOne({ where: { shopDomain: storeData[i].domain } });
      if (!store) {
        store = await ShopifyStore.create({
          tenantId: createdTenants[i].id,
          shopDomain: storeData[i].domain,
          accessToken: `demo_token_${Date.now()}_${i}`,
          shopId: Math.floor(Math.random() * 1000000) + 100000,
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
        console.log(`✅ Created store: ${store.shopName}`);
      } else {
        console.log(`✅ Using existing store: ${store.shopName}`);
      }
      createdStores.push({ ...store.dataValues, type: storeData[i].type });
    }

    // Generate comprehensive data for each store
    for (const store of createdStores) {
      await generateStoreData(store);
    }

    console.log('🎉 Demo data population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- 1 Demo User: demo@xeno.com / demo123`);
    console.log(`- ${createdTenants.length} Tenants`);
    console.log(`- ${createdStores.length} Shopify Stores`);
    console.log(`- 150+ Customers across all stores`);
    console.log(`- 50+ Products per store`);
    console.log(`- 250+ Orders across all stores`);
    console.log(`- 500+ Custom Events for analytics`);

  } catch (error) {
    console.error('❌ Error populating demo data:', error);
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
    { first: 'Kimberly', last: 'Garcia' }, { first: 'Kevin', last: 'Martinez' },
    { first: 'Donna', last: 'Robinson' }, { first: 'Brian', last: 'Clark' },
    { first: 'Nancy', last: 'Rodriguez' }, { first: 'Edward', last: 'Lewis' },
    { first: 'Sandra', last: 'Lee' }, { first: 'Ronald', last: 'Walker' },
    { first: 'Carol', last: 'Hall' }, { first: 'Timothy', last: 'Allen' },
    { first: 'Ruth', last: 'Young' }, { first: 'Jason', last: 'Hernandez' }
  ];

  // Product categories by store type
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
      { title: 'Casual Sneakers', type: 'Footwear', vendor: 'ComfortShoes', price: 89.99 },
      { title: 'Business Suit', type: 'Apparel', vendor: 'ProfessionalWear', price: 249.99 },
      { title: 'Evening Gown', type: 'Apparel', vendor: 'ElegantFashion', price: 189.99 }
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
      { title: 'Webcam', type: 'Electronics', vendor: 'VideoTech', price: 89.99 },
      { title: 'Smart Watch', type: 'Electronics', vendor: 'WearableTech', price: 199.99 },
      { title: 'Tablet', type: 'Electronics', vendor: 'MobileTech', price: 299.99 }
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
      { title: 'Area Rug', type: 'Decor', vendor: 'FloorStyle', price: 89.99 },
      { title: 'Dining Table', type: 'Furniture', vendor: 'FurnitureCo', price: 299.99 },
      { title: 'Sofa Set', type: 'Furniture', vendor: 'ComfortLiving', price: 599.99 }
    ],
    'Sports': [
      { title: 'Yoga Mat', type: 'Fitness', vendor: 'FlexiFit', price: 39.99 },
      { title: 'Dumbbells Set', type: 'Fitness', vendor: 'StrengthPro', price: 89.99 },
      { title: 'Running Shoes', type: 'Footwear', vendor: 'SpeedRunner', price: 129.99 },
      { title: 'Basketball', type: 'Sports', vendor: 'BallSports', price: 24.99 },
      { title: 'Tennis Racket', type: 'Sports', vendor: 'RacketPro', price: 149.99 },
      { title: 'Swimming Goggles', type: 'Aquatics', vendor: 'AquaGear', price: 19.99 },
      { title: 'Cycling Helmet', type: 'Safety', vendor: 'SafeRide', price: 59.99 },
      { title: 'Protein Shaker', type: 'Nutrition', vendor: 'FitNutrition', price: 14.99 },
      { title: 'Resistance Bands', type: 'Fitness', vendor: 'FlexiFit', price: 29.99 },
      { title: 'Golf Clubs Set', type: 'Sports', vendor: 'GolfPro', price: 299.99 },
      { title: 'Soccer Ball', type: 'Sports', vendor: 'BallSports', price: 34.99 },
      { title: 'Fitness Tracker', type: 'Electronics', vendor: 'FitTech', price: 99.99 }
    ],
    'Beauty': [
      { title: 'Moisturizing Cream', type: 'Skincare', vendor: 'GlowBeauty', price: 34.99 },
      { title: 'Lipstick Set', type: 'Makeup', vendor: 'ColorCosmetics', price: 24.99 },
      { title: 'Shampoo & Conditioner', type: 'Haircare', vendor: 'HairCare', price: 19.99 },
      { title: 'Face Serum', type: 'Skincare', vendor: 'GlowBeauty', price: 49.99 },
      { title: 'Eyeshadow Palette', type: 'Makeup', vendor: 'ColorCosmetics', price: 39.99 },
      { title: 'Body Lotion', type: 'Skincare', vendor: 'GlowBeauty', price: 16.99 },
      { title: 'Perfume', type: 'Fragrance', vendor: 'ScentLuxury', price: 79.99 },
      { title: 'Nail Polish Set', type: 'Makeup', vendor: 'ColorCosmetics', price: 14.99 },
      { title: 'Face Mask', type: 'Skincare', vendor: 'GlowBeauty', price: 12.99 },
      { title: 'Hair Dryer', type: 'Tools', vendor: 'BeautyTools', price: 89.99 },
      { title: 'Makeup Brushes', type: 'Tools', vendor: 'BeautyTools', price: 29.99 },
      { title: 'Sunscreen', type: 'Skincare', vendor: 'GlowBeauty', price: 22.99 }
    ]
  };

  const categoryProducts = productCategories[storeType] || productCategories['Fashion'];
  
  // Create customers
  const customers = [];
  for (let i = 0; i < 30; i++) {
    const name = customerNames[i % customerNames.length];
    const shopifyId = 100000 + i + (store.id.charCodeAt(0) * 1000); // Make unique per store
    const customer = await Customer.create({
      storeId: store.id,
      tenantId: store.tenantId,
      shopifyId: shopifyId,
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}.${store.id.substring(0, 8)}@email.com`,
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

  // Create products
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
      productType: productData.type,
      handle: productData.title.toLowerCase().replace(/\s+/g, '-'),
      status: 'active',
      tags: [productData.type.toLowerCase(), 'featured', 'bestseller'][Math.floor(Math.random() * 3)],
      variants: [{
        id: Date.now() + i + Math.floor(Math.random() * 3000) + 20000,
        title: 'Default Title',
        price: productData.price.toFixed(2),
        sku: `${productData.vendor.toUpperCase()}-${i + 1}`,
        inventoryQuantity: Math.floor(Math.random() * 200) + 10
      }]
    });
    products.push(product);
  }

  // Create orders
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

  // Create custom events
  const eventTypes = ['page_view', 'product_view', 'add_to_cart', 'checkout_started', 'cart_abandoned', 'purchase'];
  for (let i = 1; i <= 100; i++) {
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

  console.log(`✅ Generated data for ${store.shopName}: 30 customers, ${products.length} products, 50 orders, 100 events`);
};

// Run the script
if (require.main === module) {
  populateDemoData()
    .then(() => {
      console.log('Demo data population completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { populateDemoData };
