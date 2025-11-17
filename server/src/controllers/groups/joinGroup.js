import Communities from '../../models/groupsOrm.js';
import UserGroups from '../../models/userGroupsOrm.js';

export async function joinGroupController(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                error: 'Unauthorized',
            });
        }

        const { groupId } = req.body;
        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: groupId',
                error: 'groupId is required',
            });
        }

        const group = await Communities.findOne({ where: { groupId } });
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
                error: 'Group not found',
                data: null,
            });
        }

        const existingMembership = await UserGroups.findOne({
            where: { userId, groupId },
        });

        if (existingMembership) {
            return res.status(200).json({
                success: true,
                message: 'Already a member of this group',
                data: group.get({ plain: true }),
            });
        }

        const userGroup = await UserGroups.create({
            userId,
            groupId,
            isFollowed: true,
            isCreator: false,
            isLeader: false,
            isModerator: false,
            isMember: true,
            joinedAt: new Date(),
            isActive: true,
        });

        if (!userGroup) {
            return res.status(400).json({
                success: false,
                message: 'Failed to join group',
                error: 'Failed to join group',
                data: null,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Group joined successfully',
            data: group.get({ plain: true }),
        });
    } catch (error) {
        console.error('Error joining group:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
        });
    }
}