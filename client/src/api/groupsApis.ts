


async function createGroup(group: any)
{
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/create`, {
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



async function joinGroupRequestApi(groupId: string, referrerId: string)
{
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/join/request`, {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupId: groupId, referrerId: referrerId }),
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/info/${groupId}`, {
            method: "GET",
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
 }

 async function loadJoinGroupRequestsApi(groupId: string)
 {
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/join/requests/${groupId}`, {
            method: "GET",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
 }


 async function rejectJoinGroupRequestApi(requestId: string)
 {
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/join/requests/reject`, {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ requestId: requestId }),
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
 }


 async function acceptJoinGroupRequestApi(requestId: string)
 {
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/join/requests/accept`, {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ requestId: requestId }),
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
 }











export { createGroup, loadUserFollowedGroupsApi, joinGroupApi, loadUserCreatedGroupsApi, leaveGroupApi, loadGroupInfoApi, loadJoinGroupRequestsApi, joinGroupRequestApi, rejectJoinGroupRequestApi, acceptJoinGroupRequestApi };