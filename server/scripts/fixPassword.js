const { User } = require('../models');
const bcrypt = require('bcryptjs');

const fixPassword = async () => {
  try {
    console.log('🔧 Fixing password for demo user...');
    
    // Find the demo user
    const user = await User.findOne({ where: { email: 'demo@xeno.com' } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    // Hash the password once
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    // Update the password directly without triggering hooks
    await User.update(
      { password: hashedPassword },
      { where: { email: 'demo@xeno.com' } }
    );
    
    console.log('✅ Password fixed successfully!');
    
    // Test the password
    const updatedUser = await User.findOne({ where: { email: 'demo@xeno.com' } });
    const isPasswordValid = await updatedUser.comparePassword('demo123');
    
    console.log('🔐 Password test result:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('✅ Login credentials:');
      console.log('Email: demo@xeno.com');
      console.log('Password: demo123');
    } else {
      console.log('❌ Password still not working');
    }
    
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  }
};

// Run the script
if (require.main === module) {
  fixPassword()
    .then(() => {
      console.log('Password fix completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { fixPassword };
