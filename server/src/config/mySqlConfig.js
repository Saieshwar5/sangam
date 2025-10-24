import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('sangam', 'root', 'mysecretpassword', {
  host: 'localhost',
  dialect: 'mysql',
  // Control naming conventions
  define: {
    // Keep camelCase in database (set to false to use snake_case)
    freezeTableName: true,  // Prevents pluralization
    underscored: true,     // Set to true to use snake_case in DB
    timestamps: true,      // Automatically adds createdAt/updatedAt
   // createdAt: 'created_at', // Custom timestamp field names
   // updatedAt: 'updated_at'
  },
  query: {
    raw: false
  }
});

export default sequelize;