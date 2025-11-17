



async function createGroupPost(GroupPost: any)
{
    try{
        console.log("createGroupPost", GroupPost);

        console.log( "server url", `${process.env.NEXT_PUBLIC_API_URL}/api/posts`);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/create`, {
            method: "POST",
            credentials: "include",
            body: GroupPost,
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}


async function getUserGroupPosts(groupId: string)
{
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/group/${groupId}`,
            {
                method: "GET",
                credentials: "include",
            }
        );
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}


async function voteOnPollPost(voteData: any, postId: string)
{
    console.log("we are at the api function");
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/poll/${postId}/vote`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify(voteData),
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}

async function recordEventParticipationApi(userId: string, postId: string)
{
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/event/${postId}/participate`, {
            credentials: "include",
            method: "POST",
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}






export { createGroupPost, getUserGroupPosts, voteOnPollPost, recordEventParticipationApi };