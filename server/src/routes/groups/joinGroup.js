import express from "express";
import User from "../../models/usersOrm.js";
import Communities from "../../models/groupsOrm.js";
import UserGroups from "../../models/userGroupsOrm.js";
import {authMiddleWare} from "../../middleware/authMiddleWare.js";


import { verifyToken, decodeToken } from "../../util/jwtUtils.js";

const joinGroupRouter = express.Router();




joinGroupRouter.post('/groups/join', authMiddleWare, async (req, res) => {
    const userId = req.user.id;


    if(!userId)
    {
        console.log("No token provided");
        return res.status(401).json({ 
            success: false,
            message: 'Unauthorized',
            error: 'Unauthorized'
        });
    }
    try{
        console.log("userId", userId);
        const groupId = req.body.groupId;
        const group = await Communities.findOne({ where: { groupId } });
        if(!group)
        {
            return res.status(400).json({ 
                success: false,
                message: 'Group not found',
                error: 'Group not found',
                data: null
            });
        }
        const userGroup = await UserGroups.create({ userId,
             groupId,
             isFollowed: true,
             isCreator: false,
             isLeader: false,
             isModerator: false,
             isMember: true,
             joinedAt: new Date(),
             isActive: true,
        });
        if(!userGroup)
        {
            return res.status(400).json({ 
                success: false,
                message: 'Failed to join group',
                error: 'Failed to join group',
                data: null
            });
        }

        console.log("group+++++++++++++++++++++_________________________", group);
        res.status(200).json(
            {
                success: true,
                message: 'Group joined successfully',
                data: group.get({plain: true})
            }
        );
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message 
        });
    }
});


export default joinGroupRouter;