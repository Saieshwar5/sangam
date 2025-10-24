import express from 'express';
import Profile from '../../models/profileOrm.js';
import User from '../../models/usersOrm.js';
import upload from '../../middleware/multer.js';

const profileRouter = express.Router();

profileRouter.post('/profile', upload.single('image'), async (req, res) => {
    console.log("Creating profile...");
    
    try {
        const { name, bio, profession, userId, email, displayName } = req.body;
        const imageFile = req.file; // File info from multer
        
        console.log('Text data:', { name, bio, profession, userId, email, displayName });
        console.log('Image file:', imageFile);
        
        // ✅ Check if user exists
        const user = await User.findOne({ where: { userId } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // ✅ Check if profile already exists
        const existingProfile = await Profile.findOne({ where: { userId } });
        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: 'Profile already exists for this user'
            });
        }

        // ✅ Create profile (was 'User', should be 'Profile')
        const profile = await Profile.create({
            name,
            bio,
            profession,
            profilePicture: imageFile ? imageFile.filename : null,
            userId,
            email,
            displayName
        });

        console.log('Profile created:', profile);
        res.status(201).json({ 
            success: true, 
            message: 'Profile created successfully',
            data: profile 
        });

    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating profile',
            error: error.message 
        });
    }
});







//route for the update of the profile 

profileRouter.put('/profile/:userId', upload.single('image'), async (req, res) => {
    console.log("Updating profile...");
    
    try {
        const { userId } = req.params;
        const { name, bio, profession, email, displayName } = req.body;
        const imageFile = req.file; // File info from multer

        // ✅ Find existing profile
        const profile = await Profile.findOne({ where: { userId } });
        
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // ✅ Update profile
        await profile.update({
            name: name || profile.name,
            bio: bio || profile.bio,
            profession: profession || profile.profession,
            profilePicture: imageFile ? imageFile.filename : profile.profilePicture,
            email: email || profile.email,
            displayName: displayName || profile.displayName
        });

        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            data: profile 
        });
    }
    catch(error){
        console.error('Error updating profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating profile',
            error: error.message 
        });
    }
}); 

// ✅ Get profile by userId with user data
profileRouter.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // ✅ Get profile with user data (showcasing the relationship)
        const profile = await Profile.findOne({
            where: { userId },
            include: [{
                model: User,
                attributes: ['userId', 'email', 'createdAt']  // Don't include password!
            }]
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});
























export default profileRouter;
