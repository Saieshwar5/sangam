import GroupMedia from '../../models/groupMedia.js';




export async function saveGroupMediaController(req, res) {
    try {
        const { groupId } = req.params;
        const file = req.file;
        const { caption } = req.body;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'File is required',
                error: 'File is required',
                data: null,
            });
        }
        const mediaId = `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const media = await GroupMedia.create({
            mediaId,
            groupId,
            mediaUrl: file.location,
            mediaKey: file.key,
            caption,
        });
        if (!media) {
            return res.status(400).json({
                success: false,
                message: 'Failed to save media',
                error: 'Failed to save media',
                data: null,
            });
        }

        res.status(201).json({
            success: true,
            message: 'Media saved successfully',
            data: media
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


export async function loadGroupMediaController(req, res) {
    try {
        const { groupId } = req.params;
        const media = await GroupMedia.findAll({ where: { groupId } });

        if (!media.length) {
            return res.status(404).json({
                success: false,
                message: 'No media found',
                error: 'No media found',
                data: null,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Media loaded successfully',
            data: media,
        });
    } catch (error) {
        console.error('Error loading group media:', error);
        return res.status(500).json({
            success: false,
            message: 'Error loading group media',
            error: error.message,
        });
    }
}