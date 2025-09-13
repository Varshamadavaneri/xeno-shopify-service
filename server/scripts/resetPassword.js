const { User } = require('../models');
const bcrypt = require('bcryptjs');

const resetPassword = async () => {
  try {
    console.log('🔄 Resetting password for demo user...');
    
    // Find the demo user
    const user = await User.findOne({ where: { email: 'demo@xeno.com' } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    // Update the password
    await user.update({ password: hashedPassword });
    
    console.log('✅ Password reset successfully!');
    console.log('Login credentials:');
    console.log('Email: demo@xeno.com');
    console.log('Password: demo123');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  }
};

// Run the script
if (require.main === module) {
  resetPassword()
    .then(() => {
      console.log('Password reset completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { resetPassword };
