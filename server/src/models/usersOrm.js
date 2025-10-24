import { DataTypes } from 'sequelize';

import sequelize from '../config/mySqlConfig.js';

const User = sequelize.define('users', {
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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
    
},
 {
    tableName: 'users',
    timestamps: true,
    underscored: true
   
});

// ✅ Sync will be handled in associations.js after relationships are defined

export default User;