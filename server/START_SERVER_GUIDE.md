# Quick Start Guide - Comments Feature Backend

## 🚀 Starting the Server

### 1. **Navigate to Server Directory**
```bash
cd /home/sai-eshwar/my_folder/project2/server
```

### 2. **Install Dependencies** (if not already done)
```bash
npm install
```

### 3. **Check Environment Variables**
Make sure your `.env` file has:
```env
PORT=4000
CLIENT_URL=http://localhost:3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=3306
```

### 4. **Start the Server**
```bash
npm start
# or
node index.js
```

### 5. **Expected Output**
```
✅ User model synchronized
✅ Profile model synchronized
✅ Groups model synchronized
✅ UserGroups junction table synchronized
✅ GroupPosts model synchronized
✅ PollPostVote model synchronized
✅ UsersInvitation model synchronized
✅ UsersMessages model synchronized
✅ ChatUsers model synchronized
✅ Comment model synchronized          ← NEW!
✅ All models synchronized successfully
✅ Model associations set up successfully
🚀 Server is running on port 4000
🔌 Socket.IO server is ready for connections
```

---

## 🗄️ Database Table Creation

The `comments` table will be **automatically created** when you start the server for the first time!

**Table Structure:**
```sql
comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  comment_id VARCHAR(255) UNIQUE,
  post_id VARCHAR(255),
  user_id VARCHAR(255),
  parent_comment_id VARCHAR(255) NULL,
  comment_text TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (post_id) REFERENCES group_posts(post_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id)
)
```

---

## ✅ Verify Installation

### **1. Check if Comments Routes Are Active**
```bash
curl http://localhost:4000/api/comments/post/test-post-id
```

**Expected:** Either a 404 (post not found) or a 200 with empty array
**Not Expected:** Connection refused or 404 on route itself

### **2. Check Database Table**
```sql
-- Login to MySQL
mysql -u your_user -p

-- Use your database
USE your_database_name;

-- Check if table exists
SHOW TABLES LIKE 'comments';

-- Check table structure
DESCRIBE comments;

-- Check indexes
SHOW INDEXES FROM comments;
```

**Expected Output:**
```
+----------------------------+
| Tables_in_db (comments)    |
+----------------------------+
| comments                   |
+----------------------------+

Field                Type            Null    Key     Default
---------------------------------------------------------------
id                   int             NO      PRI     NULL
comment_id           varchar(255)    NO      UNI     NULL
post_id              varchar(255)    NO      MUL     NULL
user_id              varchar(255)    NO      MUL     NULL
parent_comment_id    varchar(255)    YES     MUL     NULL
comment_text         text            NO              NULL
is_deleted           tinyint(1)      NO              0
created_at           timestamp       NO              CURRENT_TIMESTAMP
updated_at           timestamp       NO              CURRENT_TIMESTAMP
```

---

## 🧪 Test the API

### **Test 1: Get Comments (with no comments yet)**
```bash
curl http://localhost:4000/api/comments/post/ANY_EXISTING_POST_ID
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Comments loaded successfully",
  "data": []
}
```

### **Test 2: Add a Comment**
First, get a valid postId and userId from your database:
```sql
SELECT post_id FROM group_posts LIMIT 1;
SELECT user_id FROM users LIMIT 1;
```

Then:
```bash
curl -X POST http://localhost:4000/api/comments/post/YOUR_POST_ID \
  -H "Content-Type: application/json" \
  -d '{
    "commentText": "Testing comments feature!",
    "userId": "YOUR_USER_ID"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "commentId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "postId": "YOUR_POST_ID",
    "userId": "YOUR_USER_ID",
    "commentText": "Testing comments feature!",
    "createdAt": "2025-10-31T...",
    "updatedAt": "2025-10-31T..."
  }
}
```

### **Test 3: Verify in Database**
```sql
SELECT * FROM comments ORDER BY created_at DESC LIMIT 1;
```

---

## 🔧 Troubleshooting

### **Problem: Server won't start**
**Solution:**
1. Check if port 4000 is already in use:
   ```bash
   lsof -i :4000
   # or
   netstat -an | grep 4000
   ```
2. Kill the process or change PORT in `.env`

### **Problem: "Comment model synchronized" doesn't appear**
**Solution:**
1. Check for errors in `associations.js`
2. Make sure `import Comment from './commentsOrm.js';` is present
3. Check server console for error messages

### **Problem: Foreign key constraint errors**
**Solution:**
1. Make sure `group_posts.post_id` is UNIQUE:
   ```sql
   ALTER TABLE group_posts ADD UNIQUE KEY (post_id);
   ```
2. Make sure `users.user_id` exists and is indexed

### **Problem: Comments not appearing in frontend**
**Solution:**
1. Check browser console for API errors
2. Verify API base URL in frontend:
   ```typescript
   // client/src/api/commentsApis.ts
   const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
   ```
3. Check CORS settings in `server/index.js`

---

## 🎯 Integration Checklist

- [ ] Server starts without errors
- [ ] `comments` table created in database
- [ ] Can GET comments for a post (even if empty)
- [ ] Can POST a new comment
- [ ] Can POST a reply to a comment
- [ ] Frontend loads comments on post page
- [ ] Frontend can add new comments
- [ ] Frontend can add replies
- [ ] Nested replies display correctly
- [ ] Comments persist after page refresh

---

## 📞 Support

If you encounter any issues:

1. **Check Server Logs:** Look for error messages in terminal
2. **Check Database:** Verify table structure and data
3. **Check Frontend Console:** Look for network errors
4. **Check API Response:** Use `curl` or Postman to test directly

---

## 🎉 Success!

If all tests pass, your comments feature is **fully operational**! 🚀

**Next Steps:**
1. Start your client: `cd client && npm run dev`
2. Navigate to any post detail page
3. Try adding comments and replies
4. Watch them appear in real-time with nested structure!

**The full comments system is now live!** ✨

