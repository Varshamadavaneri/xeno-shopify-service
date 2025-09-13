import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import axios from 'axios';
import {
  Store,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const Stores = () => {
  const { tenantId } = useParams();
  const { getTenantById } = useTenant();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectForm, setConnectForm] = useState({
    shopDomain: '',
    accessToken: '',
    shopName: ''
  });
  const [connectLoading, setConnectLoading] = useState(false);

  const tenant = getTenantById(tenantId);

  useEffect(() => {
    if (tenantId) {
      fetchStores();
    }
  }, [tenantId]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/shopify/${tenantId}/stores`);
      setStores(response.data.data.stores);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStore = async (e) => {
    e.preventDefault();
    
    if (!connectForm.shopDomain || !connectForm.accessToken || !connectForm.shopName) {
      toast.error('All fields are required');
      return;
    }

    setConnectLoading(true);
    try {
      const response = await axios.post(`/api/shopify/${tenantId}/connect`, connectForm);
      if (response.data.success) {
        toast.success('Store connected successfully!');
        setShowConnectModal(false);
        setConnectForm({ shopDomain: '', accessToken: '', shopName: '' });
        fetchStores();
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to connect store';
      toast.error(message);
    } finally {
      setConnectLoading(false);
    }
  };

  const handleSyncStore = async (storeId) => {
    try {
      toast.loading('Syncing store data...', { id: 'sync' });
      const response = await axios.post(`/api/shopify/${tenantId}/${storeId}/sync`, {
        dataType: 'all'
      });
      toast.success('Store synced successfully!', { id: 'sync' });
      fetchStores();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to sync store';
      toast.error(message, { id: 'sync' });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'syncing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Synced';
      case 'syncing':
        return 'Syncing...';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-600">Manage your connected Shopify stores</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchStores}
            className="btn-outline inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowConnectModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Connect Store
          </button>
        </div>
      </div>

      {/* Stores Grid */}
      {stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-primary-100">
                    <Store className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{store.shopName}</h3>
                    <p className="text-sm text-gray-500">{store.shopDomain}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(store.syncStatus)}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    store.syncStatus === 'completed' ? 'text-green-600' :
                    store.syncStatus === 'syncing' ? 'text-yellow-600' :
                    store.syncStatus === 'failed' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getStatusText(store.syncStatus)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-medium text-gray-900">{store.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="font-medium text-gray-900">
                    {store.lastSyncAt 
                      ? new Date(store.lastSyncAt).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSyncStore(store.id)}
                  disabled={store.syncStatus === 'syncing'}
                  className="flex-1 btn-outline text-sm disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Sync
                </button>
                <button
                  onClick={() => window.open(`https://${store.shopDomain}`, '_blank')}
                  className="btn-outline text-sm"
                  title="Open Store"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No stores connected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Connect your first Shopify store to start syncing data and analytics.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowConnectModal(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Connect Your First Store
            </button>
          </div>
        </div>
      )}

      {/* Connect Store Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Connect Shopify Store</h3>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleConnectStore}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="shopDomain" className="label">
                      Shop Domain
                    </label>
                    <input
                      type="text"
                      id="shopDomain"
                      value={connectForm.shopDomain}
                      onChange={(e) => setConnectForm({ ...connectForm, shopDomain: e.target.value })}
                      className="input-field"
                      placeholder="your-store.myshopify.com"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your Shopify store domain (e.g., my-store.myshopify.com)
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="shopName" className="label">
                      Shop Name
                    </label>
                    <input
                      type="text"
                      id="shopName"
                      value={connectForm.shopName}
                      onChange={(e) => setConnectForm({ ...connectForm, shopName: e.target.value })}
                      className="input-field"
                      placeholder="My Store"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="accessToken" className="label">
                      Access Token
                    </label>
                    <input
                      type="password"
                      id="accessToken"
                      value={connectForm.accessToken}
                      onChange={(e) => setConnectForm({ ...connectForm, accessToken: e.target.value })}
                      className="input-field"
                      placeholder="shpat_..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your Shopify private app access token
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={connectLoading}
                    className="btn-primary"
                  >
                    {connectLoading ? 'Connecting...' : 'Connect Store'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stores;
