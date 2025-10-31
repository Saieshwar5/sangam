import { DataTypes } from 'sequelize';
import sequelize from '../config/mySqlConfig.js';



const PollPostVote = sequelize.define('pollPostVote', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    pollPostId: {
        type: DataTypes.STRING,
        allowNull: false, // references GroupPosts.postId
        comment: 'The postId of the poll post in group_posts',
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false, // references Users.userId
        comment: 'User who selected an option in the poll',
    },
    voteData: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'The data of the vote',
    },
}, {
    tableName: 'poll_post_votes',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['poll_post_id', 'user_id'], // prevent multiple votes by same user on same poll
        },
        {
            fields: ['poll_post_id'],
        },
        {
            fields: ['user_id'],
        },
    ],
});



const recordPollVote = async (pollPostId, userId, voteData ) => {
    try{
    const [vote] = await PollPostVote.upsert({
        pollPostId,
        userId,
        voteData
    }, { returning: true });
    return vote;
    } catch (error) {
        console.error('Error recording poll vote:', error);
        return null;
    }
};


export default PollPostVote;
export { recordPollVote };