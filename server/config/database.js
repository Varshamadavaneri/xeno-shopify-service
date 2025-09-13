const { Sequelize } = require('sequelize');

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (isProduction && databaseUrl) {
  // Production: Use PostgreSQL
  try {
    sequelize = new Sequelize(databaseUrl, {
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
    console.log('✅ Connected to PostgreSQL database');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed, falling back to SQLite:', error.message);
    // Fallback to SQLite if PostgreSQL fails
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    });
  }
} else {
  // Development: Use SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
  console.log('✅ Connected to SQLite database');
}

module.exports = { sequelize };
