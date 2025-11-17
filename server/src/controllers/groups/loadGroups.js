import Communities from '../../models/groupsOrm.js';
import UserGroups from '../../models/userGroupsOrm.js';

export async function getGroupInfoController(req, res) {
    try {
        const { groupId } = req.params;
        const group = await Communities.findOne({ where: { groupId } });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
                error: 'Group not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Group loaded successfully',
            data: group,
        });
    } catch (error) {
        console.error('Error loading group info:', error);
        return res.status(500).json({
            success: false,
            message: 'Error loading groups',
            error: error.message,
        });
    }
}

export async function getUserCreatedGroupsController(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                error: 'Unauthorized',
            });
        }

        const groups = await Communities.findAll({ where: { createdBy: userId } });
        if (!groups.length) {
            return res.status(404).json({
                success: false,
                message: 'No groups found',
                error: 'No groups found',
            });
        }

        const finalData = groups.map(group => ({ ...group.toJSON() }));
        return res.status(200).json({
            success: true,
            message: 'Groups loaded successfully',
            data: finalData,
        });
    } catch (error) {
        console.error('Error loading created groups:', error);
        return res.status(500).json({
            success: false,
            message: 'Error loading groups',
            error: error.message,
        });
    }
}

export async function getUserFollowedGroupsController(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                error: 'Unauthorized',
            });
        }

        const groups = await Communities.findAll({
            include: [
                {
                    model: UserGroups,
                    as: 'userGroupEntries',
                    where: { userId, isFollowed: true },
                    attributes: [],
                    required: true,
                },
            ],
        });

        const finalData = groups.map(group => ({ ...group.toJSON() }));
        return res.status(200).json({
            success: true,
            message: 'Groups loaded successfully',
            data: finalData,
        });
    } catch (error) {
        console.error('Error loading followed groups:', error);
        return res.status(500).json({
            success: false,
            message: 'Error loading groups',
            error: error.message,
        });
    }
}

