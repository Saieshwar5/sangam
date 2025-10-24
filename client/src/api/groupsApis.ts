


async function createGroup(group: any)
{
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups`, {
            method: "POST",
            body: group,
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}


async function loadUserFollowedGroupsApi() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/groups/load/followed`,
            {
                method: "GET",
                credentials: "include",
            }
        );
        return response.json();
    } catch(error) {
        console.error(error);
        throw error;
    }
}

async function loadUserCreatedGroupsApi() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/groups/load/created`,
            {
                method: "GET",
                credentials: "include",
            }
        );
        return response.json();
    } catch(error) {
        console.error(error);
        throw error;
    }
}


async function joinGroupApi(groupId: string)
{
    try{
        console.log
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/join`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify({ groupId: groupId }),
        });
        return response.json();
    }

        catch(error){
            console.error(error);
            throw error;
        }

    }



 async function leaveGroupApi(groupId: string)
 {
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/leave?groupId=${groupId}`, {
            method: "GET",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
 }

 async function loadGroupInfoApi(groupId: string)
 {
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/group/info/${groupId}`, {
            method: "GET",
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
 }










export { createGroup, loadUserFollowedGroupsApi, joinGroupApi, loadUserCreatedGroupsApi, leaveGroupApi, loadGroupInfoApi };