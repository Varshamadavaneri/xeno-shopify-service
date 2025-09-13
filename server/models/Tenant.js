const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 50],
      is: /^[a-z0-9-]+$/
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  subscriptionPlan: {
    type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'),
    defaultValue: 'free',
    field: 'subscription_plan'
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'past_due'),
    defaultValue: 'active',
    field: 'subscription_status'
  }
}, {
  tableName: 'tenants',
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['owner_id']
    }
  ]
});

module.exports = Tenant;
