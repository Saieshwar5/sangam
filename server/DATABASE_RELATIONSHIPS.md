# Database Relationships - User & Profile

## 🔗 Relationship Type: One-to-One

Each User has exactly one Profile, and each Profile belongs to one User.

## 📊 Database Structure

```sql
-- users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- profiles table
CREATE TABLE profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255) UNIQUE NOT NULL,  -- Foreign Key
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    bio TEXT,
    profession VARCHAR(255),
    profilePicture VARCHAR(255),
    displayName VARCHAR(255),
    phoneNumber VARCHAR(255),
    isActive BOOLEAN DEFAULT true,
    isVerified BOOLEAN DEFAULT false,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);
```

## 📁 Files Updated

1. **usersOrm.js** - Removed individual sync, added relationship support
2. **profileOrm.js** - Removed force sync, added relationship support
3. **associations.js** (NEW) - Defines relationships and handles syncing
4. **index.js** - Updated to sync models before starting server
5. **profile.js** - Fixed routes to properly use Profile model

## 🚀 API Endpoints

### Create Profile
```http
POST /api/profile
Content-Type: multipart/form-data

Fields:
- userId (required)
- email (required)
- name
- bio
- profession
- displayName
- image (file)
```

### Update Profile
```http
PUT /api/profile/:userId
Content-Type: multipart/form-data

Fields:
- name
- bio
- profession
- email
- displayName
- image (file)
```

### Get Profile
```http
GET /api/profile/:userId

Response includes user data:
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "abc-123",
    "name": "John Doe",
    "bio": "Developer",
    "user": {
      "userId": "abc-123",
      "email": "john@example.com",
      "createdAt": "2024-01-01"
    }
  }
}
```

## 💻 Using Relationships in Code

### Get User with Profile
```javascript
const user = await User.findOne({
    where: { userId: 'some-uuid' },
    include: [Profile]
});
console.log(user.profile);  // Access associated profile
```

### Get Profile with User
```javascript
const profile = await Profile.findOne({
    where: { userId: 'some-uuid' },
    include: [{
        model: User,
        attributes: ['userId', 'email', 'createdAt']  // Exclude password
    }]
});
console.log(profile.user);  // Access associated user
```

### Create Profile for User
```javascript
const user = await User.findOne({ where: { userId: 'some-uuid' } });
const profile = await user.createProfile({
    name: 'John Doe',
    bio: 'Software Developer'
});
```

## ✅ Benefits

- **Referential Integrity**: Can't create profile without valid user
- **Cascade Delete**: Delete user → profile deleted automatically
- **Cascade Update**: Update userId → profile updated automatically
- **Easy Queries**: Join user and profile data in single query
- **Type Safety**: Sequelize validates foreign keys

## ⚠️ Important Notes

1. **Order Matters**: User must exist before creating Profile
2. **userId is the Foreign Key**: Links Profile to User
3. **Cascade Delete**: Deleting a user will delete their profile
4. **Use alter: true**: In development to update schema without losing data
5. **Never use force: true**: In production - it drops tables!

## 🔄 Sync Process

The server now syncs models in this order:
1. Load associations from `associations.js`
2. Setup relationships (hasOne/belongsTo)
3. Sync User model first
4. Sync Profile model second
5. Start server only after successful sync

## 🧪 Testing

1. Create a user via sign up
2. Use the returned userId to create a profile
3. Fetch profile with GET /api/profile/:userId
4. Verify user data is included in response

