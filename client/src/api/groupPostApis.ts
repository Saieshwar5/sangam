



async function createGroupPost(GroupPost: any)
{
    try{
        console.log("createGroupPost", GroupPost);

        console.log( "server url", `${process.env.NEXT_PUBLIC_API_URL}/api/posts`);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
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

export { createGroupPost, getUserGroupPosts };