import UsersInvitation from '../../models/usersInvitationOrm.js';
import { recordUserInvitation } from '../../models/usersInvitationOrm.js';


export const recordUserInvitationController = async (req, res) => {
    try{
        const { postId } = req.params;
        const userId  = req.user.id;

        if(!userId || !postId){
            return res.status(400).json({ success: false, message: 'userId and postId are required', error: 'Missing required fields' });
        }

        const invitation = await recordUserInvitation(userId, postId);
        if(!invitation){
            return res.status(400).json({ success: false, message: 'Failed to record user invitation', error: 'Failed to record user invitation' });
        }
        return res.status(200).json({ success: true, message: 'User invitation recorded successfully', data: invitation });
    }
    catch(error){
        console.error('Error recording user invitation:', error);
        return res.status(500).json({ success: false, message: 'Error recording user invitation', error: error.message });
    }
}