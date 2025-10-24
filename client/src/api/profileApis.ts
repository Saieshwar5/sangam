


export async function saveProfile(profile: any) {

    console.log("saveProfile", profile);
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
            method: "POST",
            credentials: "include",
            body: profile,
        });
        return response.json();
    } catch (error) {

        console.error(error);
        throw error;
    }

}



export async function loadProfileFromServer(userId: string) {
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${userId}`,
           { credentials: "include",
        }
        );


        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}


export async function updateProfileOnServer(profile: FormData, userId: string)
{
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${userId}`, {
            method: "PUT",
            credentials: "include",
            body: profile,
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}