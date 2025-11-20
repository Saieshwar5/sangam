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



loadMembersRouter.get('/:groupId/user-role', authMiddleWare, async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user?.id; // Get from authenticated user
        const queryUserId = req.query.userId; // Optional: allow query param for flexibility

        // Use query param if provided, otherwise use authenticated user
        const targetUserId = queryUserId || userId;

        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: 'Group ID is required'
            });
        }

        if (!targetUserId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // ✅ Find user's role in the group
        const userGroup = await UserGroups.findOne({
            where: {
                groupId: groupId,
                userId: targetUserId,
                isActive: true
            },
            attributes: [
                'userId',
                'groupId',
                'isCreator',
                'isLeader',
                'isModerator',
                'isMember',
                'isFollowed',
                'joinedAt',
                'isActive'
            ]
        });

        if (!userGroup) {
            return res.status(404).json({
                success: false,
                message: 'User is not a member of this group',
                data: null
            });
        }

        const userRoleData = userGroup.toJSON();

        return res.status(200).json({
            success: true,
            message: 'User role loaded successfully',
            data: {
                userId: userRoleData.userId,
                groupId: userRoleData.groupId,
                isCreator: userRoleData.isCreator,
                isLeader: userRoleData.isLeader,
                isModerator: userRoleData.isModerator,
                isMember: userRoleData.isMember,
                isFollowed: userRoleData.isFollowed,
                joinedAt: userRoleData.joinedAt,
                isActive: userRoleData.isActive
            }
        });

    } catch (error) {
        console.error('❌ Error loading user role:', error);
        return res.status(500).json({
            success: false,
            message: 'Error loading user role',
            error: error.message
        });
    }
});



loadMembersRouter.put('/:groupId/update-role/:targetUserId', authMiddleWare, async (req, res) => {
    try {
        const { groupId, targetUserId } = req.params;
        const requesterId = req.user?.id; // The person making the request
        const { isLeader, isModerator, isMember } = req.body; // New role values

        // ✅ Validation
        if (!groupId || !targetUserId) {
            return res.status(400).json({
                success: false,
                message: 'Group ID and Target User ID are required'
            });
        }

        if (!requesterId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Please login'
            });
        }

        // ✅ Check if requester is the group creator
        const requesterRole = await UserGroups.findOne({
            where: {
                groupId: groupId,
                userId: requesterId,
                isActive: true
            }
        });

        if (!requesterRole || !requesterRole.isCreator) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied - Only group creator can update roles'
            });
        }

        // ✅ Find the target user
        const targetUser = await UserGroups.findOne({
            where: {
                groupId: groupId,
                userId: targetUserId,
                isActive: true
            }
        });

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found in this group'
            });
        }

        // ✅ Prevent changing creator role
        if (targetUser.isCreator) {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify creator role'
            });
        }

        // ✅ Prevent creator from demoting themselves
        if (targetUserId === requesterId) {
            return res.status(403).json({
                success: false,
                message: 'Creator cannot change their own role'
            });
        }

        // ✅ Update roles - only if provided in request body
        if (typeof isLeader === 'boolean') {
            targetUser.isLeader = isLeader;
        }
        if (typeof isModerator === 'boolean') {
            targetUser.isModerator = isModerator;
        }
        if (typeof isMember === 'boolean') {
            targetUser.isMember = isMember;
        }

        // ✅ Save changes
        await targetUser.save();

        // ✅ Get updated user with profile details
        const updatedMember = await UserGroups.findOne({
            where: {
                groupId: groupId,
                userId: targetUserId
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['userId', 'email'],
                include: [{
                    model: Profile,
                    attributes: ['name', 'displayName', 'profilePicture']
                }]
            }],
            attributes: [
                'userId',
                'groupId',
                'isCreator',
                'isLeader',
                'isModerator',
                'isMember',
                'joinedAt'
            ]
        });

        // ✅ Transform response
        const memberData = updatedMember.toJSON();
        const userData = memberData.user || {};
        const profileData = userData.profile || {};

        return res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            data: {
                userId: memberData.userId,
                groupId: memberData.groupId,
                isCreator: memberData.isCreator,
                isLeader: memberData.isLeader,
                isModerator: memberData.isModerator,
                isMember: memberData.isMember,
                joinedAt: memberData.joinedAt,
                // User details
                email: userData.email,
                name: profileData.name,
                displayName: profileData.displayName,
                profilePicture: profileData.profilePicture
            }
        });

    } catch (error) {
        console.error('❌ Error updating user role:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating user role',
            error: error.message
        });
    }
});





export default loadMembersRouter;