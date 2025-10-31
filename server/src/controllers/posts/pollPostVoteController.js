import GroupPosts from '../../models/groupPosts.js';
import PollPostVote from '../../models/pollsPostOrm.js';
import { recordPollVote } from '../../models/pollsPostOrm.js';



export const voteOnPollPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, selectedOptions } = req.body;

        if (!userId || !selectedOptions) {
            return res.status(400).json({
                success: false,
                message: 'userId and selectedOptions are required',
                error: 'Missing required fields'
            });
        }

        const post = await GroupPosts.findOne({
            where: { postId, postType: 'poll', postIsDeleted: false }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Poll post not found',
                error: 'Not found'
            });
        }

        // Record the vote first
        const voteData = { selectedOptions };
        const vote = await recordPollVote(postId, userId, voteData);

        if (!vote) {
            return res.status(400).json({ 
                success: false, 
                message: 'Failed to record vote', 
                error: 'Failed to record vote' 
            });
        }

        // Now update the poll data with recalculated votes and percentages
        const pollData = post.pollData || {};
        const currentPollOptions = Array.isArray(pollData.pollOptions) ? pollData.pollOptions : [];

        // selectedOptions is already an array of option objects with id
        const selectedOptionIds = Array.isArray(selectedOptions) 
            ? selectedOptions.map(opt => String(opt.id || opt)) 
            : [];

        // Build vote count map from current data
        const votesForEachOption = {};
        let totalVotes = 0;

        currentPollOptions.forEach(option => {
            const optId = String(option.id);
            votesForEachOption[optId] = option.votes || 0;
            totalVotes += option.votes || 0;
        });

        // Increment votes for newly selected options
        selectedOptionIds.forEach(selectedId => {
            const idStr = String(selectedId);
            if (votesForEachOption.hasOwnProperty(idStr)) {
                votesForEachOption[idStr]++;
                totalVotes++;
            }
        });

        // Rebuild options array with updated votes and percentages
        const updatedPollOptions = currentPollOptions.map(option => {
            const optId = String(option.id);
            const votes = votesForEachOption[optId] || 0;
            const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            return { ...option, votes, percentage };
        });

        // Persist updated pollData back to the database
        await post.update({
            pollData: { ...pollData, pollOptions: updatedPollOptions }
        });

        // Return the updated post data
        return res.status(200).json({ 
            success: true, 
            message: 'Vote recorded', 
            data: post.get({ plain: true })
        });
    } catch (error) {
        console.error('Error recording poll vote:', error);
        return res.status(500).json({
            success: false,
            message: 'Error recording poll vote',
            error: error.message
        });
    }
};
