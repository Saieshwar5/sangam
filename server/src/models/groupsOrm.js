import { DataTypes } from 'sequelize';

import sequelize from  '../config/mySqlConfig.js';


const communities = sequelize.define('communities', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: true,
        // ✅ Remove foreign key constraint for now
        // references: {
        //     model: 'users',
        //     key: 'userId',
        // },
    },
    // ✅ Fix field names to match your route
    groupId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    groupName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    uniqueName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // ✅ Add unique constraint
    },
    vision: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    coverImage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    coverImageKey: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    logoKey: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // ✅ Add social media fields
    youtubeUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    twitterUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    instagramUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // ✅ Add default value
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // ✅ Add default value
    },
    isSuspended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // ✅ Add default value
    },
    isBanned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // ✅ Add default value
    },
}, {
    tableName: 'communities',
    timestamps: true,
    underscored: true,
});


export default communities;