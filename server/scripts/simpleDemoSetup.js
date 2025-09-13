const { User, Tenant, ShopifyStore, Customer, Product, Order, OrderItem, CustomEvent } = require('../models');
const bcrypt = require('bcryptjs');

const setupSimpleDemo = async () => {
  try {
    console.log('🚀 Setting up simple demo data...');

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
      console.log('✅ Created demo user: demo@xeno.com / demo123');
    } else {
      console.log('✅ Using existing demo user: demo@xeno.com / demo123');
    }

    // Create 3 tenants
    const tenants = [
      {
        name: 'Fashion Forward Inc',
        slug: 'fashion-forward',
        description: 'Premium fashion retailer'
      },
      {
        name: 'TechGear Solutions',
        slug: 'techgear-solutions',
        description: 'Technology retailer'
      },
      {
        name: 'Home & Living Co',
        slug: 'home-living-co',
        description: 'Home decor retailer'
      }
    ];

    const createdTenants = [];
    for (const tenantData of tenants) {
      const tenant = await Tenant.create({
        ...tenantData,
        ownerId: demoUser.id
      });
      createdTenants.push(tenant);
      console.log(`✅ Created tenant: ${tenant.name}`);
    }

    // Create stores for each tenant
    const storeData = [
      { domain: 'fashion-forward.myshopify.com', name: 'Fashion Forward Store' },
      { domain: 'techgear-store.myshopify.com', name: 'TechGear Store' },
      { domain: 'home-living-store.myshopify.com', name: 'Home & Living Store' }
    ];

    const createdStores = [];
    for (let i = 0; i < createdTenants.length; i++) {
      const store = await ShopifyStore.create({
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
      createdStores.push(store);
      console.log(`✅ Created store: ${store.shopName}`);
    }

    // Add some basic data to the first store
    const firstStore = createdStores[0];
    
    // Create 5 customers
    const customers = [];
    for (let i = 1; i <= 5; i++) {
      const customer = await Customer.create({
        storeId: firstStore.id,
        tenantId: firstStore.tenantId,
        shopifyId: 1000 + i,
        email: `customer${i}@example.com`,
        firstName: `Customer${i}`,
        lastName: 'Demo',
        phone: `+123456789${i}`,
        totalSpent: Math.floor(Math.random() * 1000) + 100,
        totalOrders: Math.floor(Math.random() * 5) + 1,
        tags: ['demo', 'customer'],
        acceptsMarketing: Math.random() > 0.5,
        state: 'enabled'
      });
      customers.push(customer);
    }

    // Create 3 products
    const products = [];
    const productData = [
      { title: 'Premium T-Shirt', price: 29.99, vendor: 'StyleCo' },
      { title: 'Designer Jeans', price: 89.99, vendor: 'DenimWorks' },
      { title: 'Running Shoes', price: 129.99, vendor: 'SportMax' }
    ];

    for (let i = 0; i < productData.length; i++) {
      const product = await Product.create({
        storeId: firstStore.id,
        tenantId: firstStore.tenantId,
        shopifyId: 2000 + i,
        title: productData[i].title,
        bodyHtml: `<p>High-quality ${productData[i].title.toLowerCase()}.</p>`,
        vendor: productData[i].vendor,
        productType: 'Apparel',
        handle: productData[i].title.toLowerCase().replace(/\s+/g, '-'),
        status: 'active',
        tags: ['demo', 'product'],
        variants: [{
          id: 3000 + i,
          title: 'Default Title',
          price: productData[i].price.toFixed(2),
          sku: `DEMO-${i + 1}`,
          inventoryQuantity: Math.floor(Math.random() * 100) + 10
        }]
      });
      products.push(product);
    }

    // Create 10 orders
    for (let i = 1; i <= 10; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const orderTotal = Math.floor(Math.random() * 500) + 50;
      
      const order = await Order.create({
        storeId: firstStore.id,
        tenantId: firstStore.tenantId,
        customerId: customer.id,
        shopifyId: 4000 + i,
        orderNumber: `#100${i}`,
        name: `#100${i}`,
        email: customer.email,
        phone: customer.phone,
        financialStatus: ['paid', 'pending', 'refunded'][Math.floor(Math.random() * 3)],
        fulfillmentStatus: ['fulfilled', 'pending', 'unfulfilled'][Math.floor(Math.random() * 3)],
        currency: 'USD',
        totalPrice: orderTotal,
        subtotalPrice: orderTotal * 0.9,
        totalTax: orderTotal * 0.1,
        totalDiscounts: Math.floor(Math.random() * 20),
        tags: ['demo', 'order'],
        customerData: {
          id: customer.shopifyId,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName
        },
        lineItems: [{
          id: 5000 + i,
          productId: product.shopifyId,
          variantId: product.variants[0].id,
          title: product.title,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: product.variants[0].price
        }]
      });

      // Create order item
      await OrderItem.create({
        orderId: order.id,
        productId: product.id,
        shopifyId: 5000 + i,
        variantId: product.variants[0].id,
        title: product.title,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: parseFloat(product.variants[0].price),
        vendor: product.vendor,
        productType: product.productType
      });
    }

    console.log('🎉 Simple demo setup completed!');
    console.log('\n📊 Demo Data Summary:');
    console.log('- 1 Demo User: demo@xeno.com / demo123');
    console.log('- 3 Tenants with 3 Stores');
    console.log('- 5 Customers, 3 Products, 10 Orders');
    console.log('- Ready for demo video!');

  } catch (error) {
    console.error('❌ Error setting up demo:', error);
  }
};

// Run the script
if (require.main === module) {
  setupSimpleDemo()
    .then(() => {
      console.log('Demo setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { setupSimpleDemo };
