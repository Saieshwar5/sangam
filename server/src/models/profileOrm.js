import { DataTypes } from 'sequelize';

import sequelize from '../config/mySqlConfig.js';

const Profile = sequelize.define('profile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // Authentication fields
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },

  displayName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  // Profile fields
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  profession: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profilePicture: {
    type: DataTypes.STRING, // Store URL or file path
    allowNull: true,
  },
  profilePictureKey: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
  
}, {
  // Table options
  tableName: 'profiles',
  timestamps: true,
  underscored: true,
});

// ✅ Sync will be handled in associations.js after relationships are defined

export default Profile;
