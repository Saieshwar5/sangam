import { DataTypes } from 'sequelize';
import sequelize from '../config/mySqlConfig.js';

const groupMedia = sequelize.define('groupMedia', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    mediaId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    groupId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mediaUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mediaKey: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    caption: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'group_media',
    timestamps: true,
    underscored: true,
},

);

export default groupMedia;