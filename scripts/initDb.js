const sequelize = require('../config/database');
const Role = require('../models/role');
const User = require('../models/user'); // Import User model to ensure its table is also created/synced

const seedDatabase = async () => {
  try {
    console.log('Attempting to connect to the database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all defined models to the database.
    // { force: true } will drop existing tables and re-create them.
    // Use with caution, especially in production. Good for initial setup or development reset.
    console.log('Synchronizing models with the database (force: true)...');
    await sequelize.sync({ force: true });
    console.log('All models were synchronized successfully. Tables created!');

    // Seed initial roles
    console.log('Seeding roles...');
    const rolesToSeed = [
      { name: 'admin', permission: { description: 'Administrator with full access' } },
      { name: 'reader', permission: { description: 'Reader with limited access' } },
    ];

    for (const roleData of rolesToSeed) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData,
      });
      if (created) {
        console.log(`Role '${role.name}' created.`);
      } else {
        // If you want to update existing roles, you can add logic here
        // await role.update(roleData);
        console.log(`Role '${role.name}' already exists. Skipped creation.`);
      }
    }
    console.log('Roles seeded successfully.');

    // Optional: Create a default admin user (example)
    // Ensure you have a role 'admin' seeded first.
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (adminRole) {
      const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL;
      const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

      if(!defaultAdminPassword || !defaultAdminPassword){
        throw new Error("Misisng DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD in configuration")
      }

      const [adminUser, adminCreated] = await User.findOrCreate({
        where: { email: defaultAdminEmail },
        defaults: {
          name: 'Default Admin',
          email: defaultAdminEmail,
          password: defaultAdminPassword, // Will be hashed by the model hook
          role_id: adminRole.id
        }
      });
      if (adminCreated) {
        console.log(`Default admin user '${adminUser.email}' created with password '${defaultAdminPassword}'. Please change this password.`);
      } else {
        console.log(`Default admin user '${adminUser.email}' already exists.`);
      }
    } else {
      console.warn("Admin role not found. Could not create default admin user.");
    }


  } catch (error) {
    console.error('Error during database initialization or seeding:', error);
  } finally {
    console.log('Closing database connection.');
    await sequelize.close();
  }
};

// Execute the seeding function
seedDatabase();
