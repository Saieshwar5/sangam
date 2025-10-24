

async function loadMembersApi(groupId: string){
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/group/${groupId}/members`, {
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



export { loadMembersApi };