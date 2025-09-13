import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  Calendar,
  Store
} from 'lucide-react';
import toast from 'react-hot-toast';

const Tenants = () => {
  const { tenants, createTenant, deleteTenant, loading } = useTenant();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    description: ''
  });
  const [createLoading, setCreateLoading] = useState(false);

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    
    if (!createForm.name.trim() || !createForm.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }

    setCreateLoading(true);
    try {
      const result = await createTenant(createForm);
      if (result.success) {
        setShowCreateModal(false);
        setCreateForm({ name: '', slug: '', description: '' });
      }
    } catch (error) {
      console.error('Create tenant error:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId, tenantName) => {
    if (window.confirm(`Are you sure you want to delete "${tenantName}"? This action cannot be undone.`)) {
      try {
        await deleteTenant(tenantId);
      } catch (error) {
        console.error('Delete tenant error:', error);
      }
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name) => {
    setCreateForm({
      ...createForm,
      name,
      slug: generateSlug(name)
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600">Manage your business tenants and organizations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Tenant
        </button>
      </div>

      {/* Tenants Grid */}
      {tenants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-primary-100">
                    <Building2 className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                    <p className="text-sm text-gray-500">@{tenant.slug}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => navigate(`/tenants/${tenant.id}`)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="View Details"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete Tenant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {tenant.description && (
                <p className="text-sm text-gray-600 mb-4">{tenant.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {new Date(tenant.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Store className="h-4 w-4 mr-1" />
                  {tenant.stores?.length || 0} stores
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/tenants/${tenant.id}`)}
                  className="w-full btn-outline"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first tenant to organize your Shopify stores.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Tenant
            </button>
          </div>
        </div>
      )}

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Tenant</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateTenant}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="label">
                      Tenant Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={createForm.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="input-field"
                      placeholder="My Business"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="slug" className="label">
                      Slug
                    </label>
                    <input
                      type="text"
                      id="slug"
                      value={createForm.slug}
                      onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                      className="input-field"
                      placeholder="my-business"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="label">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Brief description of this tenant..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="btn-primary"
                  >
                    {createLoading ? 'Creating...' : 'Create Tenant'}
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

export default Tenants;
