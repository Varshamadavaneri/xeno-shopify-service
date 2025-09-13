const { User } = require('../models');
const bcrypt = require('bcryptjs');

const debugLogin = async () => {
  try {
    console.log('🔍 Debugging login issue...');
    
    // Find the demo user
    const user = await User.findOne({ where: { email: 'demo@xeno.com' } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      passwordLength: user.password ? user.password.length : 0
    });
    
    // Test password comparison
    const testPassword = 'demo123';
    const isPasswordValid = await user.comparePassword(testPassword);
    
    console.log('🔐 Password test:', {
      testPassword,
      isPasswordValid,
      storedPasswordHash: user.password ? user.password.substring(0, 20) + '...' : 'null'
    });
    
    // Test direct bcrypt comparison
    const directCompare = await bcrypt.compare(testPassword, user.password);
    console.log('🔐 Direct bcrypt test:', directCompare);
    
  } catch (error) {
    console.error('❌ Error debugging login:', error);
  }
};

// Run the script
if (require.main === module) {
  debugLogin()
    .then(() => {
      console.log('Debug completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { debugLogin };
