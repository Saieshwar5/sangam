

import { DataTypes } from 'sequelize';
import sequelize from '../config/mySqlConfig.js';

const ChatUser = sequelize.define('chatUsers', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'ID of the user in the chat'
    },
    chatUserId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'ID of the user in the chat'
    },
    timestamp: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Last activity timestamp'
    },
    isOnline: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Online status of the user'
    },
    unreadCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of unread messages from this user'
    },
    lastMessageTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp of the last message'
    },
    lastMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Preview of the last message'
    }
}, {
    tableName: 'chat_users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default ChatUser;