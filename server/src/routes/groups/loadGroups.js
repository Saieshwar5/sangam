import express from "express";

import {authMiddleWare} from "../../middleware/authMiddleWare.js";

import UserGroups from "../../models/userGroupsOrm.js";
import Communities from "../../models/groupsOrm.js";

import {verifyToken, decodeToken} from "../../util/jwtUtils.js";
import communities from "../../models/groupsOrm.js";

const loadGroupsRouter = express.Router();







   loadGroupsRouter.get('/group/info/:groupId', async (req, res) => {
    try{
        const groupId = req.params.groupId;
        const group = await communities.findOne({ where: { groupId } });
        if(!group){
            return res.status(404).json({ success: false, message: 'Group not found', error: 'Group not found' });
        }
        return res.status(200).json({ success: true, message: 'Group loaded successfully', data: group });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error loading groups', error: error.message });
    }
});






    loadGroupsRouter.get('/groups/load/created', authMiddleWare, async (req, res) => {
        try{
            const userId = req.user.id;
            if(!userId){
                return res.status(401).json({ success: false, message: 'Unauthorized', error: 'Unauthorized' });
            }
            const groups = await communities.findAll({ where: { createdBy: userId} });

            if(groups.length > 0){
                const finalData= groups.map((group)=> {
                    return {
                        ...group.toJSON(),
                    }
                })
                return res.status(200).json({ success: true, message: 'Groups loaded successfully', data: finalData });
            }   
            else{
                return res.status(404).json({ success: false, message: 'No groups found', error: 'No groups found' });
            }
        }
        catch(error){
            console.error(error);
            res.status(500).json({ success: false, message: 'Error loading groups', error: error.message });
        }
    });



    loadGroupsRouter.get('/groups/load/followed/',authMiddleWare, async (req, res) => {
        try{
            const userId = req.user.id;
            if(!userId){
                return res.status(401).json({ success: false, message: 'Unauthorized', error: 'Unauthorized' });
            }
            const groups = await communities.findAll({
                include: [{
                    model: UserGroups,
                    as: 'userGroupEntries',
                    where: {
                        userId: userId,
                        isFollowed: true
                    },
                    attributes: [],
                    required: true,
                }]
            }); 

            console.log("groups_________", groups);
        
                const finalData= groups.map((group)=> {
                    return {
                        ...group.toJSON(),
                    }
                });
                return res.status(200).json({ success: true, message: 'Groups loaded successfully', data: finalData });
            
    }
    catch(error){
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error loading groups', error: error.message });
    }
});






export default loadGroupsRouter;