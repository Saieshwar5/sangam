import { DataTypes } from 'sequelize';
import sequelize from  '../config/mySqlConfig.js';

const JoinGroupRequests = sequelize.define('joinGroupRequests', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    groupId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    referrerId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isAccepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    isRejected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'join_group_requests',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['group_id', 'user_id']
        }
    ]
});

export default JoinGroupRequests;