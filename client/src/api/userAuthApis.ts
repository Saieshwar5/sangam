



export async function createUser(user: any) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign_up`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(user),
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}

export async function signInWithEmail(user: any) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign_in`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(user),
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}

export async function signOut() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign_out`, {
            credentials: "include",
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}

export async function getCurrentUser() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/current_user`, {
            credentials: "include",
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }   
}

