import User from './usersOrm.js';
import Profile from './profileOrm.js';
import Communities from './groupsOrm.js';
import UserGroups from './userGroupsOrm.js';
import GroupPosts from './groupPosts.js';
import UsersMessages from './usersMessagesOrm.js';
import { DataTypes } from 'sequelize';
import ChatUser from './chatUsersOrm.js';



/**
 * Define relationships between models
 */
export function setupAssociations() {
    // ================================
    // User ↔ Profile (One-to-One)
    // ================================
    User.hasOne(Profile, {
        foreignKey: 'userId',
        sourceKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });

    Profile.belongsTo(User, {
        foreignKey: 'userId',
        targetKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });

    // ================================
    // User ↔ Groups (Many-to-Many)
    // ================================
    
    // Users can belong to many Groups
    User.belongsToMany(Communities, {
        through: UserGroups,           // Junction table
        foreignKey: {
            name: 'userId',
            type: DataTypes.STRING
        },
        otherKey: {
            name: 'groupId',
            type: DataTypes.STRING
        },
        sourceKey: 'userId',
        as: 'groups',                  // Alias for accessing groups from user
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });

    // Groups can have many Users
    Communities.belongsToMany(User, {
        through: UserGroups,
        foreignKey: {
            name: 'groupId',
            type: DataTypes.STRING  // ✅ Explicitly set type!
        },
        sourceKey: 'groupId',  // ✅ Use groupId (VARCHAR), not id (INT)!
        otherKey: {
            name: 'userId',
            type: DataTypes.STRING  // ✅ Explicitly set type!
        },
        as: 'members',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });
    

    // ================================
    // User ↔ Groups Creator Relationship
    // ================================
    
    // User can create many Groups
    User.hasMany(Communities, {
        foreignKey: {
            name: 'createdBy',
            type: DataTypes.STRING  // ✅ Explicitly set type!
        },
        sourceKey: 'userId',  // ✅ Use userId field
        as: 'createdGroups',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });



    // ================================
// UserGroups ↔ Communities (for easy joins)
// ================================

// UserGroups belongs to Communities
UserGroups.belongsTo(Communities, {
    foreignKey: 'groupId',
    targetKey: 'groupId',
    as: 'group',  // ✅ Use this alias when including
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Communities has many UserGroups entries
Communities.hasMany(UserGroups, {
    foreignKey: 'groupId',
    sourceKey: 'groupId',
    as: 'userGroupEntries',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
    
    // Group belongs to User (creator)
    Communities.belongsTo(User, {
        foreignKey: {
            name: 'createdBy',
            type: DataTypes.STRING  // ✅ Explicitly set type!
        },
        targetKey: 'userId',  // ✅ Use userId field
        as: 'creator',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });

    // ================================
    // Group ↔ Group Posts (One-to-Many)
    // ================================
    
    // Group can have many Group Posts
    Communities.hasMany(GroupPosts, {
        foreignKey: 'groupId',
        sourceKey: 'groupId',
        as: 'groupPosts',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });

    // Group Posts belongs to Group
    GroupPosts.belongsTo(Communities, {
        foreignKey: 'groupId',
        targetKey: 'groupId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });
    
    User.hasMany(GroupPosts, {
        foreignKey: 'postCreator',
        sourceKey: 'userId',
        as: 'groupPosts',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });
    
    GroupPosts.belongsTo(User, {
        foreignKey: 'postCreator',
        
        targetKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });


// ================================
// UserGroups ↔ User (for accessing user data from UserGroups)
// ================================
UserGroups.belongsTo(User, {
    foreignKey: 'userId',
    targetKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

User.hasMany(UserGroups, {
    foreignKey: 'userId',
    sourceKey: 'userId',
    as: 'groupMemberships',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});


// =========================================
// UsersMessages <-> User (for accessing user data from UserMessages)
// ==========================================

// User can send many messages
User.hasMany(UsersMessages, {
    foreignKey: 'userId',
    sourceKey: 'userId',
    as: 'sentMessages',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Messages belong to the user who sent them
UsersMessages.belongsTo(User, {
    foreignKey: 'userId',
    targetKey: 'userId',
    as: 'sender',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// User can receive many messages
User.hasMany(UsersMessages, {
    foreignKey: 'sendTo',
    sourceKey: 'userId',
    as: 'receivedMessages',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Messages belong to the user receiving them
UsersMessages.belongsTo(User, {
    foreignKey: 'sendTo',
    targetKey: 'userId',
    as: 'receiver',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});


// ================================
// ChatUsers <-> User (for accessing user data from ChatUsers)
// ================================
ChatUser.belongsTo(User, {
    foreignKey: 'userId',
    targetKey: 'userId',
    as: 'owner',  // ✅ Clear alias: "owner of this chat contact"
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

User.hasMany(ChatUser, {
    foreignKey: 'userId',
    sourceKey: 'userId',
    as: 'chatContacts',  // ✅ Clear alias: "list of chat contacts"
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Relationship 2: ChatUsers.chatUserId belongs to User (the contact)
// "Which user is this chat contact referring to"
ChatUser.belongsTo(User, {
    foreignKey: 'chatUserId',
    targetKey: 'userId',
    as: 'contactUser',  // ✅ Clear alias: "the contact user"
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

User.hasMany(ChatUser, {
    foreignKey: 'chatUserId',
    sourceKey: 'userId',
    as: 'appearsInChatLists',  // ✅ Clear alias
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// ChatUser belongs to Profile (the contact's profile via chatUserId)
ChatUser.belongsTo(Profile, {
    foreignKey: 'chatUserId',  // Link to contact's userId
    targetKey: 'userId',
    as: 'profile',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Profile can appear in many chat lists
Profile.hasMany(ChatUser, {
    foreignKey: 'chatUserId',
    sourceKey: 'userId',
    as: 'inChatLists',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});



    console.log('✅ Model associations set up successfully');
}

/**
 * Sync all models with database
 */
export async function syncModels() {
    try {
        // Setup associations first
        setupAssociations();
        
        // Sync in order: independent tables first, then dependent ones
        await User.sync({ alter: false });
        console.log('✅ User model synchronized');
        
        await Profile.sync({ alter: false });
        console.log('✅ Profile model synchronized');
        
        await Communities.sync({ alter: false });
        console.log('✅ Groups model synchronized');
        
        await UserGroups.sync({ alter: false });
        console.log('✅ UserGroups junction table synchronized');
        
        await GroupPosts.sync({ alter: false });
        console.log('✅ GroupPosts model synchronized');
        
        await UsersMessages.sync({ alter: false });
        console.log('✅ UsersMessages model synchronized');
        
        await ChatUser.sync({ alter: false });
        console.log('✅ ChatUsers model synchronized');
        
        console.log('✅ All models synchronized successfully');
    } catch (error) {
        console.error('❌ Error synchronizing models:', error);
        throw error;
    }
}

export { User, Profile, Communities, UserGroups, GroupPosts, UsersMessages, ChatUser };