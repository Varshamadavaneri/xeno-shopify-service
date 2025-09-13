import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import axios from 'axios';
import {
  Building2,
  Store,
  Users,
  ShoppingBag,
  TrendingUp,
  Plus,
  ArrowRight,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { tenants, selectedTenant } = useTenant();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedTenant) {
      fetchOverview();
    } else {
      setLoading(false);
    }
  }, [selectedTenant]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/insights/${selectedTenant.id}/overview`);
      setOverview(response.data.data);
    } catch (error) {
      console.error('Failed to fetch overview:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedTenant) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tenant selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a tenant to start managing your Shopify stores.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/tenants')}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Tenant
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with {selectedTenant.name}.
        </p>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Customers"
            value={overview.overview.customerCount.toLocaleString()}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Total Products"
            value={overview.overview.productCount.toLocaleString()}
            icon={ShoppingBag}
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={overview.overview.orderCount.toLocaleString()}
            icon={Activity}
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={`$${overview.overview.totalRevenue.toLocaleString()}`}
            icon={TrendingUp}
            color="primary"
            subtitle={`Avg: $${overview.overview.avgOrderValue.toFixed(2)}`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
            <button
              onClick={() => navigate(`/tenants/${selectedTenant.id}/insights`)}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          {overview?.topCustomers?.length > 0 ? (
            <div className="space-y-3">
              {overview.topCustomers.slice(0, 5).map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                      {customer.firstName?.[0]}{customer.lastName?.[0]}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${customer.totalSpent.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{customer.totalOrders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm">No customer data available</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button
              onClick={() => navigate(`/tenants/${selectedTenant.id}/stores`)}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          {overview?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {overview.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${order.totalPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.shopifyCreatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm">No recent orders</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate(`/tenants/${selectedTenant.id}/stores`)}
            className="card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <Store className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Manage Stores</h4>
                <p className="text-xs text-gray-500">Connect and sync Shopify stores</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => navigate(`/tenants/${selectedTenant.id}/insights`)}
            className="card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">View Insights</h4>
                <p className="text-xs text-gray-500">Analyze your business performance</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/tenants')}
            className="card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Manage Tenants</h4>
                <p className="text-xs text-gray-500">Create and manage tenants</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
