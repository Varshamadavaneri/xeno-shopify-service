const { User, Tenant, ShopifyStore, Customer, Product, Order, OrderItem, CustomEvent } = require('../models');
const bcrypt = require('bcryptjs');

const populateProductionData = async () => {
  try {
    console.log('🚀 Populating production database with demo data...');

    // Find or create demo user
    let demoUser = await User.findOne({ where: { email: 'demo@xeno.com' } });
    if (!demoUser) {
      const hashedPassword = await bcrypt.hash('demo123', 12);
      demoUser = await User.create({
        email: 'demo@xeno.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'User'
      });
      console.log('✅ Created demo user: demo@xeno.com / demo123');
    } else {
      console.log('✅ Using existing demo user: demo@xeno.com / demo123');
    }

    // Create tenants
    const tenants = [
      { name: 'Fashion Forward Inc', slug: 'fashion-forward', description: 'Premium fashion retailer' },
      { name: 'TechGear Solutions', slug: 'techgear-solutions', description: 'Technology retailer' },
      { name: 'Home & Living Co', slug: 'home-living-co', description: 'Home decor retailer' }
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

    // Generate data for each store
    for (const store of createdStores) {
      await generateStoreData(store);
    }

    console.log('🎉 Production database populated successfully!');
    console.log('Demo credentials: demo@xeno.com / demo123');
    
  } catch (error) {
    console.error('❌ Error populating production data:', error);
  }
};

// Helper function to generate data for a single store
const generateStoreData = async (store) => {
  console.log(`📦 Generating data for ${store.shopName} (${store.type})...`);
  const storeId = store.id;
  const tenantId = store.tenantId;
  const storeType = store.type;

  // Customer names
  const customerNames = [
    { first: 'Sarah', last: 'Johnson' }, { first: 'Michael', last: 'Chen' },
    { first: 'Emily', last: 'Rodriguez' }, { first: 'David', last: 'Kim' },
    { first: 'Jessica', last: 'Williams' }, { first: 'Christopher', last: 'Brown' },
    { first: 'Amanda', last: 'Davis' }, { first: 'Matthew', last: 'Miller' },
    { first: 'Ashley', last: 'Wilson' }, { first: 'Joshua', last: 'Moore' }
  ];

  // Product categories based on store type
  const productCategories = {
    'Fashion': [
      { title: 'Premium Cotton T-Shirt', type: 'Apparel', vendor: 'StyleCo', price: 29.99 },
      { title: 'Designer Jeans', type: 'Apparel', vendor: 'DenimWorks', price: 89.99 },
      { title: 'Leather Jacket', type: 'Outerwear', vendor: 'LeatherCraft', price: 199.99 },
      { title: 'Running Shoes', type: 'Footwear', vendor: 'SportMax', price: 129.99 },
      { title: 'Summer Dress', type: 'Apparel', vendor: 'FashionForward', price: 79.99 }
    ],
    'Tech': [
      { title: 'Wireless Headphones', type: 'Electronics', vendor: 'TechSound', price: 149.99 },
      { title: 'Smartphone Case', type: 'Accessories', vendor: 'ProtectTech', price: 24.99 },
      { title: 'Bluetooth Speaker', type: 'Electronics', vendor: 'AudioMax', price: 79.99 },
      { title: 'USB-C Cable', type: 'Accessories', vendor: 'ConnectPro', price: 19.99 },
      { title: 'Wireless Charger', type: 'Electronics', vendor: 'PowerUp', price: 39.99 }
    ],
    'Home': [
      { title: 'Ceramic Coffee Mug', type: 'Kitchen', vendor: 'HomeBrew', price: 14.99 },
      { title: 'Throw Pillow', type: 'Decor', vendor: 'CozyHome', price: 29.99 },
      { title: 'LED Desk Lamp', type: 'Lighting', vendor: 'BrightIdeas', price: 49.99 },
      { title: 'Bamboo Cutting Board', type: 'Kitchen', vendor: 'EcoKitchen', price: 34.99 },
      { title: 'Wall Art Print', type: 'Decor', vendor: 'ArtisticHome', price: 39.99 }
    ]
  };

  const categoryProducts = productCategories[storeType] || productCategories['Fashion'];

  // Create customers
  const customers = [];
  for (let i = 0; i < 10; i++) {
    const name = customerNames[i % customerNames.length];
    const customer = await Customer.create({
      storeId: store.id,
      tenantId: store.tenantId,
      shopifyId: 100000 + i + (store.id.charCodeAt(0) * 1000),
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}.${store.id.substring(0, 8)}@email.com`,
      firstName: name.first,
      lastName: name.last,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      totalSpent: Math.floor(Math.random() * 1000) + 50,
      totalOrders: Math.floor(Math.random() * 5) + 1,
      tags: ['vip', 'regular', 'new'][Math.floor(Math.random() * 3)],
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
      bodyHtml: `<p>High-quality ${productData.title.toLowerCase()} from ${productData.vendor}.</p>`,
      vendor: productData.vendor,
      productType: productData.type,
      handle: productData.title.toLowerCase().replace(/\s+/g, '-'),
      status: 'active',
      tags: [productData.type.toLowerCase(), 'featured'][Math.floor(Math.random() * 2)],
      variants: [{
        id: 3000 + i,
        title: 'Default Title',
        price: productData.price.toFixed(2),
        sku: `${productData.vendor.toUpperCase()}-${i + 1}`,
        inventoryQuantity: Math.floor(Math.random() * 100) + 10
      }]
    });
    products.push(product);
  }

  // Create orders
  for (let i = 1; i <= 15; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const numProducts = Math.floor(Math.random() * 2) + 1;
    const selectedProducts = [];
    
    for (let j = 0; j < numProducts; j++) {
      selectedProducts.push(products[Math.floor(Math.random() * products.length)]);
    }
    
    const subtotal = selectedProducts.reduce((sum, product) => 
      sum + (parseFloat(product.variants[0].price) * (Math.floor(Math.random() * 2) + 1)), 0);
    
    const tax = subtotal * 0.08;
    const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 5 : 0;
    const total = subtotal + tax - discount;
    
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
    
    const order = await Order.create({
      storeId: store.id,
      tenantId: store.tenantId,
      customerId: customer.id,
      shopifyId: 300000 + i + (store.id.charCodeAt(0) * 1000),
      orderNumber: `#${String(i).padStart(4, '0')}`,
      name: `#${String(i).padStart(4, '0')}`,
      email: customer.email,
      phone: customer.phone,
      financialStatus: ['paid', 'pending', 'refunded'][Math.floor(Math.random() * 3)],
      fulfillmentStatus: ['fulfilled', 'pending', 'unfulfilled'][Math.floor(Math.random() * 3)],
      currency: 'USD',
      totalPrice: total,
      subtotalPrice: subtotal,
      totalTax: tax,
      totalDiscounts: discount,
      tags: ['online', 'mobile'][Math.floor(Math.random() * 2)],
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
        quantity: Math.floor(Math.random() * 2) + 1,
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
        quantity: Math.floor(Math.random() * 2) + 1,
        price: parseFloat(product.variants[0].price),
        vendor: product.vendor,
        productType: product.productType
      });
    }
  }

  console.log(`✅ Generated data for ${store.shopName}: 10 customers, ${products.length} products, 15 orders`);
};

// Run the script
if (require.main === module) {
  populateProductionData()
    .then(() => {
      console.log('Production data population completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { populateProductionData };
