import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch tenants when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTenants();
    }
  }, [isAuthenticated]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tenants');
      setTenants(response.data.data.tenants);
      
      // Auto-select first tenant if none selected
      if (response.data.data.tenants.length > 0 && !selectedTenant) {
        setSelectedTenant(response.data.data.tenants[0]);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const createTenant = async (tenantData) => {
    try {
      const response = await axios.post('/api/tenants', tenantData);
      const newTenant = response.data.data.tenant;
      
      setTenants(prev => [newTenant, ...prev]);
      toast.success('Tenant created successfully!');
      return { success: true, tenant: newTenant };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create tenant';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateTenant = async (tenantId, updateData) => {
    try {
      const response = await axios.put(`/api/tenants/${tenantId}`, updateData);
      const updatedTenant = response.data.data.tenant;
      
      setTenants(prev => 
        prev.map(tenant => 
          tenant.id === tenantId ? updatedTenant : tenant
        )
      );
      
      // Update selected tenant if it's the one being updated
      if (selectedTenant?.id === tenantId) {
        setSelectedTenant(updatedTenant);
      }
      
      toast.success('Tenant updated successfully!');
      return { success: true, tenant: updatedTenant };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update tenant';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const deleteTenant = async (tenantId) => {
    try {
      await axios.delete(`/api/tenants/${tenantId}`);
      
      setTenants(prev => prev.filter(tenant => tenant.id !== tenantId));
      
      // Clear selected tenant if it's the one being deleted
      if (selectedTenant?.id === tenantId) {
        const remainingTenants = tenants.filter(tenant => tenant.id !== tenantId);
        setSelectedTenant(remainingTenants.length > 0 ? remainingTenants[0] : null);
      }
      
      toast.success('Tenant deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete tenant';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const selectTenant = (tenant) => {
    setSelectedTenant(tenant);
  };

  const getTenantById = (tenantId) => {
    return tenants.find(tenant => tenant.id === tenantId);
  };

  const value = {
    tenants,
    selectedTenant,
    loading,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    selectTenant,
    getTenantById
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
