import { DataTypes } from 'sequelize';
import sequelize from '../config/mySqlConfig.js';

const UsersInvitation = sequelize.define('usersInvitation', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    eventPostId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isAccepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'users_invitation',
    timestamps: true,
    underscored: true,
});





const recordUserInvitation = async (userId, eventPostId) => {
    try{
    const [invitation] = await UsersInvitation.upsert({
        userId,
        eventPostId,
        isAccepted: true,
    }, { returning: true });
    return invitation;
    }
    catch(error){
        console.error('Error recording user invitation:', error);
        return null;
    }
}


export default UsersInvitation;
export { recordUserInvitation };