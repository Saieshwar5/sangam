import { DataTypes } from 'sequelize';
import sequelize from '../config/mySqlConfig.js';

const Comment = sequelize.define('comment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    commentId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Unique identifier for the comment',
    },
    postId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'References group_posts.post_id',
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'References users.user_id',
    },
    parentCommentId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'NULL for top-level comments, references comments.comment_id for replies',
    },
    commentText: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'The content of the comment',
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Soft delete flag',
    },
}, {
    tableName: 'comments',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['post_id'],
            name: 'idx_comments_post_id',
        },
        {
            fields: ['user_id'],
            name: 'idx_comments_user_id',
        },
        {
            fields: ['parent_comment_id'],
            name: 'idx_comments_parent_comment_id',
        },
        {
            fields: ['comment_id'],
            name: 'idx_comments_comment_id',
        },
    ],
});

export default Comment;

