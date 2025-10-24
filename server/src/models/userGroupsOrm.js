import { DataTypes } from 'sequelize';
import sequelize from '../config/mySqlConfig.js';

const UserGroups = sequelize.define('userGroups', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    groupId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isFollowed: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    isCreator: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    isLeader: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    isModerator: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    isMember: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
}, {
    // ✅ Single options object (not duplicate!)
    tableName: 'user_groups',
    timestamps: true,
    underscored: true,
});

// ✅ Sync handled in associations.js

export default UserGroups;