# Comments API Endpoints Reference

This file contains reference endpoints for the comments feature. Implement these in your Express routes.

## Base URL
`/api/comments`

---

## Endpoints

### 1. Get Comments for a Post
**Endpoint:** `GET /comments/post/:postId`

**Description:** Retrieve all comments (with nested replies) for a specific post.

**Parameters:**
- `postId` (path parameter): The ID of the post

**Response:**
```json
{
  "success": true,
  "message": "Comments loaded successfully",
  "data": [
    {
      "commentId": "comment-123",
      "postId": "post-456",
      "userId": "user-789",
      "userName": "johndoe",
      "commentText": "This is a comment",
      "createdAt": "2025-10-31T12:00:00.000Z",
      "updatedAt": "2025-10-31T12:00:00.000Z",
      "replies": [
        {
          "commentId": "reply-234",
          "userId": "user-890",
          "userName": "janedoe",
          "commentText": "This is a reply",
          "createdAt": "2025-10-31T12:30:00.000Z",
          "updatedAt": "2025-10-31T12:30:00.000Z",
          "replies": []
        }
      ]
    }
  ]
}
```

---

### 2. Add a Comment to a Post
**Endpoint:** `POST /comments/post/:postId`

**Description:** Add a new top-level comment to a post.

**Parameters:**
- `postId` (path parameter): The ID of the post

**Request Body:**
```json
{
  "commentText": "This is my comment",
  "userId": "user-789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "commentId": "comment-123",
    "postId": "post-456",
    "userId": "user-789",
    "commentText": "This is my comment",
    "createdAt": "2025-10-31T12:00:00.000Z",
    "updatedAt": "2025-10-31T12:00:00.000Z"
  }
}
```

---

### 3. Add a Reply to a Comment
**Endpoint:** `POST /comments/:commentId/reply`

**Description:** Add a nested reply to an existing comment.

**Parameters:**
- `commentId` (path parameter): The ID of the parent comment

**Request Body:**
```json
{
  "postId": "post-456",
  "replyText": "This is my reply",
  "userId": "user-890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply added successfully",
  "data": {
    "commentId": "reply-234",
    "parentCommentId": "comment-123",
    "userId": "user-890",
    "replyText": "This is my reply",
    "createdAt": "2025-10-31T12:30:00.000Z",
    "updatedAt": "2025-10-31T12:30:00.000Z"
  }
}
```

---

### 4. Update a Comment
**Endpoint:** `PUT /comments/:commentId`

**Description:** Update an existing comment's text.

**Parameters:**
- `commentId` (path parameter): The ID of the comment to update

**Request Body:**
```json
{
  "commentText": "Updated comment text"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "commentId": "comment-123",
    "commentText": "Updated comment text",
    "updatedAt": "2025-10-31T13:00:00.000Z"
  }
}
```

---

### 5. Delete a Comment
**Endpoint:** `DELETE /comments/:commentId`

**Description:** Soft delete a comment (mark as deleted).

**Parameters:**
- `commentId` (path parameter): The ID of the comment to delete

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully",
  "data": {
    "commentId": "comment-123"
  }
}
```

---

## Database Schema Suggestion

### Comments Table
```sql
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  comment_id VARCHAR(255) NOT NULL UNIQUE,
  post_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  parent_comment_id VARCHAR(255) NULL,  -- NULL for top-level comments
  comment_text TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id),
  INDEX idx_parent_comment_id (parent_comment_id),
  
  FOREIGN KEY (post_id) REFERENCES group_posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);
```

### Sequelize Model Suggestion
```javascript
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
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'comments',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['post_id'] },
        { fields: ['user_id'] },
        { fields: ['parent_comment_id'] },
    ],
});

export default Comment;
```

---

## Implementation Notes

1. **Nested Comments Structure:**
   - Store all comments flat in the database with `parent_comment_id` field
   - When fetching, recursively build the nested structure
   - Top-level comments have `parent_comment_id = NULL`

2. **Soft Delete:**
   - Don't actually delete comments, just mark them as `is_deleted = true`
   - This preserves reply structure even if parent is deleted

3. **Security:**
   - Add authentication middleware to verify user identity
   - Users should only be able to update/delete their own comments
   - Validate `userId` matches authenticated user

4. **Performance:**
   - Index on `post_id` for fast retrieval
   - Consider pagination for posts with many comments
   - Cache comment trees for popular posts

5. **Recursive Query Example:**
```javascript
// Fetch top-level comments
const topLevelComments = await Comment.findAll({
    where: { 
        postId, 
        parentCommentId: null,
        isDeleted: false 
    },
    order: [['createdAt', 'DESC']]
});

// For each top-level comment, recursively fetch replies
async function fetchReplies(commentId) {
    const replies = await Comment.findAll({
        where: { 
            parentCommentId: commentId,
            isDeleted: false 
        },
        order: [['createdAt', 'ASC']]
    });
    
    for (const reply of replies) {
        reply.replies = await fetchReplies(reply.commentId);
    }
    
    return replies;
}

for (const comment of topLevelComments) {
    comment.replies = await fetchReplies(comment.commentId);
}
```

---

## Frontend Integration Complete ✓

The frontend is already set up with:
- ✅ Zustand store for state management (`commentsStore.tsx`)
- ✅ API client functions (`commentsApis.ts`)
- ✅ UI components for displaying comments (`commentsSection.tsx`, `commentComponent.tsx`)
- ✅ Integration in post detail page (`page.tsx`)
- ✅ Reddit-style nested replies with collapse/expand

**Next Steps:**
1. Create the database table/Sequelize model
2. Implement the Express routes
3. Add authentication middleware
4. Test the endpoints
5. Update the API URLs if needed

