const cron = require('node-cron');
const { ShopifyStore } = require('../models');
const { makeShopifyRequest, syncCustomers, syncProducts, syncOrders } = require('./shopifyService');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Start the scheduler service
  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('🕐 Starting scheduler service...');

    // Schedule jobs for all active stores
    this.scheduleAllStores();

    // Schedule a job to check for new stores every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.scheduleAllStores();
    });

    console.log('✅ Scheduler service started');
  }

  // Stop the scheduler service
  stop() {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    this.isRunning = false;
    console.log('🛑 Stopping scheduler service...');

    // Stop all jobs
    this.jobs.forEach((job, storeId) => {
      job.destroy();
      console.log(`Stopped job for store ${storeId}`);
    });

    this.jobs.clear();
    console.log('✅ Scheduler service stopped');
  }

  // Schedule jobs for all active stores
  async scheduleAllStores() {
    try {
      const stores = await ShopifyStore.findAll({
        where: { 
          isActive: true,
          syncStatus: { [require('sequelize').Op.ne]: 'syncing' }
        }
      });

      for (const store of stores) {
        await this.scheduleStore(store);
      }
    } catch (error) {
      console.error('Error scheduling stores:', error);
    }
  }

  // Schedule sync job for a specific store
  async scheduleStore(store) {
    const storeId = store.id;
    const jobKey = `store_${storeId}`;

    // Skip if job already exists
    if (this.jobs.has(jobKey)) {
      return;
    }

    // Skip if auto sync is disabled
    if (!store.settings?.autoSync) {
      return;
    }

    const syncInterval = store.settings?.syncInterval || 3600; // Default 1 hour
    const cronExpression = this.getCronExpression(syncInterval);

    console.log(`📅 Scheduling sync for store ${store.shopName} (${storeId}) every ${syncInterval}s`);

    const job = cron.schedule(cronExpression, async () => {
      await this.syncStoreData(store);
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set(jobKey, job);
  }

  // Get cron expression based on interval in seconds
  getCronExpression(intervalSeconds) {
    if (intervalSeconds < 60) {
      // Less than 1 minute - run every intervalSeconds
      return `*/${intervalSeconds} * * * * *`;
    } else if (intervalSeconds < 3600) {
      // Less than 1 hour - run every intervalSeconds/60 minutes
      const minutes = Math.floor(intervalSeconds / 60);
      return `*/${minutes} * * * *`;
    } else if (intervalSeconds < 86400) {
      // Less than 1 day - run every intervalSeconds/3600 hours
      const hours = Math.floor(intervalSeconds / 3600);
      return `0 */${hours} * * *`;
    } else {
      // 1 day or more - run daily
      return '0 0 * * *';
    }
  }

  // Sync data for a specific store
  async syncStoreData(store) {
    try {
      console.log(`🔄 Starting sync for store ${store.shopName} (${store.id})`);

      // Update sync status
      await store.update({ 
        syncStatus: 'syncing',
        lastSyncAt: new Date()
      });

      const syncResults = {};

      // Sync customers if enabled
      if (store.settings?.syncCustomers) {
        try {
          syncResults.customers = await syncCustomers(store);
          console.log(`✅ Synced ${syncResults.customers.synced} customers for ${store.shopName}`);
        } catch (error) {
          console.error(`❌ Failed to sync customers for ${store.shopName}:`, error.message);
          syncResults.customers = { error: error.message };
        }
      }

      // Sync products if enabled
      if (store.settings?.syncProducts) {
        try {
          syncResults.products = await syncProducts(store);
          console.log(`✅ Synced ${syncResults.products.synced} products for ${store.shopName}`);
        } catch (error) {
          console.error(`❌ Failed to sync products for ${store.shopName}:`, error.message);
          syncResults.products = { error: error.message };
        }
      }

      // Sync orders if enabled
      if (store.settings?.syncOrders) {
        try {
          syncResults.orders = await syncOrders(store);
          console.log(`✅ Synced ${syncResults.orders.synced} orders for ${store.shopName}`);
        } catch (error) {
          console.error(`❌ Failed to sync orders for ${store.shopName}:`, error.message);
          syncResults.orders = { error: error.message };
        }
      }

      // Update sync status to completed
      await store.update({ syncStatus: 'completed' });

      console.log(`✅ Completed sync for store ${store.shopName}`);
      return syncResults;

    } catch (error) {
      console.error(`❌ Sync failed for store ${store.shopName}:`, error);
      
      // Update sync status to failed
      await store.update({ syncStatus: 'failed' });
      
      throw error;
    }
  }

  // Manually trigger sync for a specific store
  async triggerSync(storeId) {
    try {
      const store = await ShopifyStore.findByPk(storeId);
      if (!store) {
        throw new Error('Store not found');
      }

      return await this.syncStoreData(store);
    } catch (error) {
      console.error(`Failed to trigger sync for store ${storeId}:`, error);
      throw error;
    }
  }

  // Update sync settings for a store
  async updateStoreSyncSettings(storeId, settings) {
    try {
      const store = await ShopifyStore.findByPk(storeId);
      if (!store) {
        throw new Error('Store not found');
      }

      const updatedSettings = {
        ...store.settings,
        ...settings
      };

      await store.update({ settings: updatedSettings });

      // Reschedule the store if auto sync is enabled
      if (updatedSettings.autoSync) {
        await this.scheduleStore(store);
      } else {
        // Remove job if auto sync is disabled
        const jobKey = `store_${storeId}`;
        if (this.jobs.has(jobKey)) {
          this.jobs.get(jobKey).destroy();
          this.jobs.delete(jobKey);
        }
      }

      return store;
    } catch (error) {
      console.error(`Failed to update sync settings for store ${storeId}:`, error);
      throw error;
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.jobs.size,
      jobs: Array.from(this.jobs.keys())
    };
  }
}

// Create singleton instance
const schedulerService = new SchedulerService();

module.exports = schedulerService;
