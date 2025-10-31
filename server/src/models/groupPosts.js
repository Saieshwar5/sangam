import { DataTypes } from 'sequelize';
import sequelize from '../config/mySqlConfig.js';

const groupPosts = sequelize.define('groupPosts', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    groupId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    postId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    postCreator: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    postCreatorName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    postType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    postContent: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    pollData: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    eventData: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    postIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    postIsDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'group_posts',
    timestamps: true,
    underscored: true,
},

);

export default groupPosts;