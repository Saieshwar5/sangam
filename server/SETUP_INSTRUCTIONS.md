# Server Setup Instructions

## ✅ Implementation Complete!

All database relationships and model configurations have been successfully implemented.

## 🔧 Required: Create .env File

You need to create a `.env` file in the `/server` directory with the following content:

```bash
# Create the file
cd /home/sai-eshwar/my_folder/project2/server
touch .env
```

Then add this content to `/server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=e5f8a9b2c4d6e1f3a7b9c2d5e8f1a4b7c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b9c2d5e8f1a4b7c9d2e5f8a1b4c7d0e3f6
JWT_EXPIRES_IN=7d

# Client Configuration
CLIENT_URL=http://localhost:3000
```

### Generate a Secure JWT Secret (Production)

For production, generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and replace the JWT_SECRET value.

## 🚀 Start the Server

```bash
cd /home/sai-eshwar/my_folder/project2/server
npm run dev
```

You should see:

```
✅ Model associations set up successfully
✅ User model synchronized
✅ Profile model synchronized
✅ All models synchronized successfully
🚀 Server is running on port 5000
```

## 📊 What Was Implemented

### 1. Database Relationships
- **User ↔ Profile**: One-to-One relationship
- Foreign Key: `userId` in Profile table references User table
- Cascade Delete: Deleting user deletes profile
- Cascade Update: Updating userId updates profile

### 2. Files Modified/Created

#### Created:
- `src/models/associations.js` - Manages relationships and syncing

#### Modified:
- `src/models/usersOrm.js` - Removed individual sync
- `src/models/profileOrm.js` - Removed force sync (prevents data loss)
- `index.js` - Added model sync before server start
- `src/routes/profile/profile.js` - Fixed to use Profile model correctly

### 3. API Endpoints

#### Create Profile
```http
POST /api/profile
Content-Type: multipart/form-data

Body:
- userId (required)
- email (required)
- name
- bio
- profession
- displayName
- image (file, optional)
```

#### Update Profile
```http
PUT /api/profile/:userId
Content-Type: multipart/form-data

Body:
- name
- bio
- profession
- email
- displayName
- image (file, optional)
```

#### Get Profile (with User data)
```http
GET /api/profile/:userId
```

Response includes associated user data:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "abc-123",
    "name": "John Doe",
    "bio": "Developer",
    "profession": "Software Engineer",
    "profilePicture": "image.jpg",
    "user": {
      "userId": "abc-123",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## 🧪 Testing the Relationship

### Test Flow:

1. **Sign Up a User**
```http
POST /api/auth/sign_up
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Response will include `userId`.

2. **Create Profile for User**
```http
POST /api/profile
Content-Type: multipart/form-data

userId: <userId-from-signup>
email: test@example.com
name: John Doe
bio: Software Developer
profession: Engineer
```

3. **Get Profile with User Data**
```http
GET /api/profile/<userId>
```

This will return the profile with associated user information.

## ⚠️ Important Notes

1. **Create .env file first** - Server won't start without JWT_SECRET
2. **User must exist** before creating a profile
3. **userId links the models** - Profile.userId references User.userId
4. **Cascade delete is enabled** - Deleting user deletes profile
5. **Never use force: true in production** - It drops tables!

## 🔍 Troubleshooting

### Error: "JWT_SECRET is not defined"
- Create the `.env` file with JWT_SECRET

### Error: "User not found"
- Sign up a user first before creating profile

### Error: "Profile already exists"
- Each user can only have one profile
- Use PUT /api/profile/:userId to update instead

### Database sync issues
- Check MySQL connection in `src/config/mySqlConfig.js`
- Ensure MySQL is running
- Verify database "sangam" exists

## 📚 Documentation

See `DATABASE_RELATIONSHIPS.md` for detailed information about:
- Database structure
- Relationship details
- Code examples
- Query patterns

## ✅ Checklist

- [x] User model updated
- [x] Profile model updated
- [x] Associations created
- [x] Server index.js updated
- [x] Profile routes fixed
- [ ] Create `.env` file (YOU NEED TO DO THIS)
- [ ] Test the server starts
- [ ] Test creating profiles
- [ ] Test fetching profiles with user data

## 🎉 You're All Set!

Once you create the `.env` file, your server is ready to run with proper User ↔ Profile relationships!

