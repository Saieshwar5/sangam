import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize('sangam', process.env.DB_USER_NAME, process.env.DB_PASSWORD, {
  host: process.env.DB_END_POINT,
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

