// server/src/routes/members/loadMembers.js

import express from 'express';
import { authMiddleWare } from '../../middleware/authMiddleWare.js';
import UserGroups from '../../models/userGroupsOrm.js';
import User from '../../models/usersOrm.js';
import Profile from '../../models/profileOrm.js';

const loadMembersRouter = express.Router();

/**
 * ✅ MOST EFFICIENT: Single query with nested includes
 * Gets all members of a group with their profiles in ONE database query
 */
loadMembersRouter.get('/:groupId/members', async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: 'Group ID is required'
            });
        }

        // ✅ SINGLE QUERY - Gets UserGroups + User + Profile in one go
        const members = await UserGroups.findAll({
            where: {
                groupId: groupId,
                isActive: true,  // Only active members
            },
            include: [{
                model: User,
                as: 'user',  // Must match alias in associations
                attributes: ['userId', 'email', 'createdAt'],  // Select only needed fields
                include: [{
                    model: Profile,
                    attributes: [
                        'name',
                        'displayName',
                        'bio',
                        'profession',
                        'profilePicture',
                        'isVerified'
                    ]
                }]
            }],
            attributes: [
                'userId',
                'isCreator',
                'isLeader',
                'isModerator',
                'isMember',
                'joinedAt'
            ],
            order: [
                ['isCreator', 'DESC'],    // Creators first
                ['isLeader', 'DESC'],     // Then leaders
                ['isModerator', 'DESC'],  // Then moderators
                ['joinedAt', 'ASC']       // Then by join date
            ]
        });

        // ✅ Transform data to flat structure for easier client consumption
        const transformedMembers = members.map(member => {
            const memberData = member.toJSON();
            const userData = memberData.user || {};
            const profileData = userData.profile || {};

            return {
                userId: memberData.userId,
                // User group metadata
                isCreator: memberData.isCreator,
                isLeader: memberData.isLeader,
                isModerator: memberData.isModerator,
                isMember: memberData.isMember,
                joinedAt: memberData.joinedAt,
                // User data
                email: userData.email,
                userCreatedAt: userData.createdAt,
                // Profile data
                name: profileData.name || 'Unknown User',
                displayName: profileData.displayName,
                bio: profileData.bio,
                profession: profileData.profession,
                profilePicture: profileData.profilePicture,
                isVerified: profileData.isVerified || false,
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Members loaded successfully',
            data: transformedMembers,
            meta: {
                count: transformedMembers.length,
                groupId: groupId
            }
        });

    } catch (error) {
        console.error('❌ Error loading members:', error);
        return res.status(500).json({
            success: false,
            message: 'Error loading members',
            error: error.message
        });
    }
});

export default loadMembersRouter;