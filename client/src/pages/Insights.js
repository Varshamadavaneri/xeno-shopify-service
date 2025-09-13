import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import axios from 'axios';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Calendar,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const Insights = () => {
  const { tenantId } = useParams();
  const { getTenantById } = useTenant();
  const [insights, setInsights] = useState({
    overview: null,
    revenueTrends: null,
    customerAnalytics: null,
    productPerformance: null,
    salesFunnel: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const tenant = getTenantById(tenantId);

  useEffect(() => {
    if (tenantId) {
      fetchAllInsights();
    }
  }, [tenantId]);

  const fetchAllInsights = async () => {
    try {
      setLoading(true);
      const [overview, revenueTrends, customerAnalytics, productPerformance, salesFunnel] = await Promise.all([
        axios.get(`/api/insights/${tenantId}/overview`),
        axios.get(`/api/insights/${tenantId}/revenue-trends`),
        axios.get(`/api/insights/${tenantId}/customer-analytics`),
        axios.get(`/api/insights/${tenantId}/product-performance`),
        axios.get(`/api/insights/${tenantId}/sales-funnel`)
      ]);

      setInsights({
        overview: overview.data.data,
        revenueTrends: revenueTrends.data.data,
        customerAnalytics: customerAnalytics.data.data,
        productPerformance: productPerformance.data.data,
        salesFunnel: salesFunnel.data.data
      });
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      toast.error('Failed to load insights data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'revenue', name: 'Revenue Trends', icon: DollarSign },
    { id: 'customers', name: 'Customer Analytics', icon: Users },
    { id: 'products', name: 'Product Performance', icon: ShoppingBag },
    { id: 'funnel', name: 'Sales Funnel', icon: Calendar }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insights & Analytics</h1>
          <p className="text-gray-600">Analyze your business performance and trends</p>
        </div>
        <button
          onClick={fetchAllInsights}
          className="btn-outline inline-flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && insights.overview && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {insights.overview.overview.customerCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {insights.overview.overview.productCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {insights.overview.overview.orderCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-primary-100">
                  <DollarSign className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${insights.overview.overview.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: ${insights.overview.overview.avgOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers by Spend</h3>
            {insights.overview.topCustomers?.length > 0 ? (
              <div className="space-y-3">
                {insights.overview.topCustomers.slice(0, 10).map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
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
        </div>
      )}

      {/* Revenue Trends Tab */}
      {activeTab === 'revenue' && insights.revenueTrends && (
        <div className="space-y-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
            {insights.revenueTrends.trends?.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={insights.revenueTrends.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm">No revenue data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Analytics Tab */}
      {activeTab === 'customers' && insights.customerAnalytics && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Distribution</h3>
              {insights.customerAnalytics.orderCountRanges?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={insights.customerAnalytics.orderCountRanges}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ customer_type, count }) => `${customer_type}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {insights.customerAnalytics.orderCountRanges.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm">No customer analytics data available</p>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers by LTV</h3>
              {insights.customerAnalytics.topCustomersByLTV?.length > 0 ? (
                <div className="space-y-3">
                  {insights.customerAnalytics.topCustomersByLTV.slice(0, 5).map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
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
          </div>
        </div>
      )}

      {/* Product Performance Tab */}
      {activeTab === 'products' && insights.productPerformance && (
        <div className="space-y-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
            {insights.productPerformance.topProducts?.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={insights.productPerformance.topProducts.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value.toLocaleString(), 'Quantity Sold']}
                  />
                  <Bar dataKey="totalQuantity" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm">No product performance data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sales Funnel Tab */}
      {activeTab === 'funnel' && insights.salesFunnel && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
              {insights.salesFunnel.orderStatusDistribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={insights.salesFunnel.orderStatusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {insights.salesFunnel.orderStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm">No order status data available</p>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Metrics</h3>
              {insights.salesFunnel.conversionMetrics ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Customers:</span>
                    <span className="font-medium">{insights.salesFunnel.conversionMetrics.totalCustomers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="font-medium">{insights.salesFunnel.conversionMetrics.totalOrders.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Orders per Customer:</span>
                    <span className="font-medium">{insights.salesFunnel.conversionMetrics.avgOrdersPerCustomer}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm">No conversion data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
