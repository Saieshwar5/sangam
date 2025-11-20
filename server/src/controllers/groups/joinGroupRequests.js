import JoinGroupRequests from '../../models/joinGroupRequestsOrm.js';
import User from '../../models/usersOrm.js';
import Profile from '../../models/profileOrm.js';
import UserGroups from '../../models/userGroupsOrm.js';



import { sendToUser } from '../../util/socketUtils.js';
import Communities from '../../models/groupsOrm.js';

export async function joinGroupRequestController(req, res) {
    try {
        const { groupId, referrerId } = req.body;
        const userId = req.user?.id;
        if (!groupId || !referrerId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: groupId, referrerId and userId are required',
            });
        }


         // ✅ Check if request already exists
         const existingRequest = await JoinGroupRequests.findOne({
            where: {
                groupId,
                userId,
                isRejected: false, // Allow new request if previous was rejected? Usually yes, or maybe not.
                isAccepted: false
            }
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'You have already requested to join this group.',
            });
        }

        // ✅ Check if already a member
        const existingMember = await UserGroups.findOne({
            where: { userId, groupId }
        });

        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this group.',
            });
        }



        const joinGroupRequest = await JoinGroupRequests.create({
            groupId,
            userId,
            referrerId,
            isAccepted: false,
            isRejected: false,
        });
        if (!joinGroupRequest) {
            return res.status(400).json({
                success: false,
                message: 'Failed to create join group request',
            });
        }

        try {
            const group = await Communities.findOne({ where: { groupId } });
            if (group && group.createdBy) {
                const io = req.app.get('io'); // ✅ Get io instance
                if (io) {
                    sendToUser(io, group.createdBy, 'new_join_request', {
                        groupId: groupId,
                        groupName: group.groupName,
                        requesterId: userId,
                        requestId: joinGroupRequest.id,
                        timestamp: new Date()
                    });
                    console.log(`🔔 Notification sent to creator ${group.createdBy} for group ${groupId}`);
                }
            }
        } catch (notifyError) {
            console.error('Error sending notification:', notifyError);
            // Don't fail the request just because notification failed
        }







        return res.status(200).json({
            success: true,
            message: 'Group request joined successfully',
            data: joinGroupRequest,
        });
    }
    catch(error){
        console.error('Error creating join group request:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create join group request',
            error: error.message,
        });
    }
}

export async function loadJoinGroupRequestsController(req, res) {
    try {
        const { groupId } = req.params;
        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: 'Group ID is required',
            });
        }

        const joinGroupRequests = await JoinGroupRequests.findAll({ 
            where: { groupId, isRejected: false, isAccepted: false }, // Only show pending requests
            include: [
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'email', 'userId'], // Get basic user info
                    include: [ // ✅ Nested include to get Profile details
                        {
                            model: Profile,
                            // as: 'profile', // This depends on your association alias. In associations.js, User.hasOne(Profile) doesn't specify 'as', so it defaults to 'profile' or 'Profile'
                            attributes: ['displayName', 'profilePicture', 'name'] // Select fields you need
                        }
                    ]
                },
                { 
                    model: User, 
                    as: 'referrer', 
                    attributes: ['id', 'email', 'userId'],
                    include: [ // ✅ Nested include for Referrer's profile too
                        {
                            model: Profile,
                            attributes: ['displayName', 'profilePicture', 'name']
                        }
                    ]
                }
            ] 
        });

        // Transformation (Optional): Flatten the structure if needed for the frontend
        // or return as is. The frontend will receive user.profile.displayName etc.
        
        // Let's map it to a cleaner structure if your frontend expects it flat
        const formattedRequests = joinGroupRequests.map(request => {
            const plainRequest = request.get({ plain: true });
            
            // Merge profile info into user object for easier frontend access
            if (plainRequest.user && plainRequest.user.profile) {
                plainRequest.user.username = plainRequest.user.profile.displayName || plainRequest.user.profile.name || plainRequest.user.email.split('@')[0];
                plainRequest.user.profile_picture = plainRequest.user.profile.profilePicture;
            }
            
            if (plainRequest.referrer && plainRequest.referrer.profile) {
                plainRequest.referrer.username = plainRequest.referrer.profile.displayName || plainRequest.referrer.profile.name || plainRequest.referrer.email.split('@')[0];
                plainRequest.referrer.profile_picture = plainRequest.referrer.profile.profilePicture;
            }

            return plainRequest;
        });

        return res.status(200).json({
            success: true,
            message: 'Join group requests loaded successfully',
            data: formattedRequests,
        });
    }
    catch(error){
        console.error('Error loading join group requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to load join group requests',
            error: error.message,
        });
    }
}

export async function rejectJoinGroupRequestController(req, res) {
    try {
        const { requestId } = req.body; // Changed to req.body to match client API
        if (!requestId) {
            return res.status(400).json({
                success: false,
                message: 'Request ID is required',
            });
        }
        const joinGroupRequest = await JoinGroupRequests.findOne({ where: { id: requestId } });
        if (!joinGroupRequest) {
            return res.status(404).json({
                success: false,
                message: 'Join group request not found',
            });
        }
        joinGroupRequest.isRejected = true;
        await joinGroupRequest.save();
        
        return res.status(200).json({
            success: true,
            message: 'Join group request rejected successfully',
            data: joinGroupRequest,
        });
    }
    catch(error){
        console.error('Error rejecting join group request:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reject join group request',
            error: error.message,
        });
    }
}

export async function acceptJoinGroupRequestController(req, res) {
    try {
        const { requestId } = req.body;
        if (!requestId) {
            return res.status(400).json({
                success: false,
                message: 'Request ID is required',
            });
        }

        const joinGroupRequest = await JoinGroupRequests.findOne({ where: { id: requestId } });
        if (!joinGroupRequest) {
            return res.status(404).json({
                success: false,
                message: 'Join group request not found',
            });
        }

        if (joinGroupRequest.isAccepted) {
             return res.status(400).json({
                success: false,
                message: 'Request already accepted',
            });
        }

        // Add user to the group
        const existingMembership = await UserGroups.findOne({
            where: { userId: joinGroupRequest.userId, groupId: joinGroupRequest.groupId },
        });

        if (!existingMembership) {
            await UserGroups.create({
                userId: joinGroupRequest.userId,
                groupId: joinGroupRequest.groupId,
                isFollowed: true,
                isCreator: false,
                isLeader: false,
                isModerator: false,
                isMember: true,
                joinedAt: new Date(),
                isActive: true,
            });
        }

        joinGroupRequest.isAccepted = true;
        await joinGroupRequest.save();


        try {
            const group = await Communities.findOne({ where: { groupId: joinGroupRequest.groupId } });
            if (group) {
                const io = req.app.get('io');
                if (io) {
                    sendToUser(io, joinGroupRequest.userId, 'join_request_accepted', {
                        groupId: joinGroupRequest.groupId,
                        groupName: group.groupName,
                        groupLogo: group.logo,
                        requestId: joinGroupRequest.id,
                        timestamp: new Date()
                    });
                    console.log(`🔔 Acceptance notification sent to user ${joinGroupRequest.userId} for group ${joinGroupRequest.groupId}`);
                }
            }
        } catch (notifyError) {
            console.error('Error sending acceptance notification:', notifyError);
            // Don't fail the request just because notification failed
        }


        return res.status(200).json({
            success: true,
            message: 'Join group request accepted successfully',
            data: joinGroupRequest,
        });
    }
    catch(error){
        console.error('Error accepting join group request:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to accept join group request',
            error: error.message,
        });
    }
}