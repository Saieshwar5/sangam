import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Communities from '../../models/groupsOrm.js';
import UserGroups from '../../models/userGroupsOrm.js';

const groupsRouter = express.Router();

import upload from '../../middleware/multer.js';

groupsRouter.post('/groups/', upload.fields([{name: 'coverImage', maxCount: 1}, {name: 'logo', maxCount: 1}]), async (req, res) => {
    try {
        // ✅ Extract all fields including social media URLs
        const { 
            groupName, 
            description, 
            createdBy, 
            uniqueName, 
            vision, 
            address,
            youtubeUrl,
            twitterUrl,
            instagramUrl
        } = req.body;
        
        // Handle file uploads safely
        const coverImage = req.files?.coverImage?.[0];
        const logo = req.files?.logo?.[0];
        
        console.log("coverImage_________", coverImage);
        console.log("logo_________", logo);
        
        // Validate required fields
        if (!groupName || !description || !createdBy || !uniqueName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: groupName, description, createdBy, uniqueName' 
            });
        }
        
        const group = await Communities.create({
            groupId: uuidv4(),
            groupName: groupName,
            description: description,
            createdBy: createdBy,
            uniqueName: uniqueName,
            vision: vision || null,
            address: address || null,
            coverImage: coverImage?.filename || null,
            logo: logo?.filename || null,
            // ✅ Add social media URLs
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


        if(group){
            console.log("group created successfully%%%%%%%%%%%%", group);
        }
        console.log("group_________", group);
        res.json({ 
            success: true, 
            message: 'Group created successfully', 
            data: group.get({plain: true}) 
        });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message 
        });
    }
});

export default groupsRouter;