import { v4 as uuidv4 } from 'uuid';
import Communities from '../../models/groupsOrm.js';
import UserGroups from '../../models/userGroupsOrm.js';

export async function createGroupController(req, res) {
    try {
        const {
            groupName,
            description,
            createdBy,
            uniqueName,
            vision,
            address,
            youtubeUrl,
            twitterUrl,
            instagramUrl,
        } = req.body;

        const coverImage = req.files?.coverImage?.[0];
        const coverImageUrl = coverImage?.location;
        const coverImageKey = coverImage?.key;
        const logo = req.files?.logo?.[0];
        const logoUrl = logo?.location;
        const logoKey = logo?.key;

        if (!groupName || !description || !createdBy || !uniqueName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: groupName, description, createdBy, uniqueName',
            });
        }

        const group = await Communities.create({
            groupId: uuidv4(),
            groupName,
            description,
            createdBy,
            uniqueName,
            vision: vision || null,
            address: address || null,
            coverImage: coverImageUrl || null,
            coverImageKey: coverImageKey || null,
            logo: logoUrl || null,
            logoKey: logoKey || null,
            youtubeUrl: youtubeUrl || null,
            twitterUrl: twitterUrl || null,
            instagramUrl: instagramUrl || null,
            isActive: true,
            isDeleted: false,
            isSuspended: false,
            isBanned: false,
        });

        await UserGroups.create({
            userId: createdBy,
            groupId: group.groupId,
            isFollowed: false,
            isCreator: true,
            isLeader: true,
            isModerator: true,
            isMember: true,
        });

        return res.json({
            success: true,
            message: 'Group created successfully',
            data: group.get({ plain: true }),
        });
    } catch (error) {
        console.error('Error creating group:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
        });
    }
}