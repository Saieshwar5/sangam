import { DataTypes } from 'sequelize';
import sequelize from '../config/mySqlConfig.js';

const UsersMessages = sequelize.define("usersMessages",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'ID of the user who sent the message'
        },
        messageId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            comment: 'Unique identifier for the message'
        },
        sendTo: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'ID of the user receiving the message'
        },
        roomId: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Optional room/chat ID for group messages'
        },
        text: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Message content'
        },
        timestamp: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Timestamp of the message'
        },

        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether the message has been read'
        },
        isSent: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether the message was successfully sent'
        }
    },
    {
        tableName: 'users_messages',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default UsersMessages;
