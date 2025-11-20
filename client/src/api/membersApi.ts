

async function loadMembersApi(groupId: string){
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members/${groupId}/members`, {
            method: 'GET',
            credentials: 'include',
        });
        if(response.ok){
            const data = await response.json();
            return data;
        }
        else{
            throw new Error('Failed to load members');
        }
    }
    catch(error){
        console.error(error);
        throw new Error('Failed to load members');
    }
}


async function loadUserRoleApi(groupId: string, userId: string){
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members/${groupId}/user-role?userId=${userId}`, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    }
    catch(error){
        console.error(error);   
        throw new Error('Failed to load user role');
    }
}



// Update user role in group
async function updateUserRoleApi(
    groupId: string, 
    targetUserId: string, 
    roles: {
        isLeader?: boolean;
        isModerator?: boolean;
        isMember?: boolean;
    }
) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/load-members/${groupId}/update-role/${targetUserId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(roles),
            }
        );
        return response.json();
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
}



export { loadMembersApi, loadUserRoleApi, updateUserRoleApi };