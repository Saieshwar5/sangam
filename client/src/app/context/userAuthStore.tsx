import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";





import { createUser, signInWithEmail, signOut, getCurrentUser } from "@/api/userAuthApis";
import { useUserProfileStore } from "@/app/context/userProfileStore";
import { useUserGroupPostsStore } from "@/app/context/userGroupPostsStore";
import { useUserGroupsStore } from "@/app/context/userGroupsStore";


interface User {
    id: string;
    email: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}





interface UserAuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    success: string | null;
    isAuthenticated: boolean;
    createUser: (user: any) => Promise<void>;
    signInWithEmail: (user: any) => Promise<void>;
    signOut: () => Promise<boolean>;
    getCurrentUser: () => Promise<void>;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSuccess: (success: string | null) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    clearMessages: () => void;

}


export const useUserAuthStore = create<UserAuthState>()(
    devtools(
        persist(
            (set, get) => ({
                user: null,
                loading: false,
                error: null,
                success: null,
                isAuthenticated: false,
                setLoading: (loading: boolean) => set({ loading }),
                setError: (error: string | null) => set({ error }),
                setSuccess: (success: string | null) => set({ success }),
                setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
                clearMessages: () => set({ error: null, success: null }),


                createUser: async (user: any) => {
                    const { setLoading, setError, setSuccess, setIsAuthenticated } = useUserAuthStore.getState();
                    try {
                        setLoading(true);
                        setError(null);
                        setSuccess(null);
                        setIsAuthenticated(false);
                        const response = await createUser(user);
                        if (response.success) {
                            set({ user: response.data });
                            setIsAuthenticated(true);
                            setSuccess(response.message);
                        } else {
                            setError(response.message);
                        }
                    } catch (error) {
                        // ✅ Fix: Type cast error to Error or check if it has a message property
                        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
                    } finally {
                        setLoading(false);
                    }
                },
                signInWithEmail: async (user: any) => {
                    const { setLoading, setError, setSuccess, setIsAuthenticated } = useUserAuthStore.getState();
                    try {
                        setLoading(true);
                        setError(null);
                        setSuccess(null);
                        setIsAuthenticated(false);

                        const response = await signInWithEmail(user );
                        if(response.success)
                        {
                            set({ user: response.data });
                            setIsAuthenticated(true);
                            setSuccess(response.message);
                        }
                        else
                        {
                            setError(response.message);
                        }
                    }
                    catch(error){
                        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
                    }
                    finally{
                        setLoading(false);
                    }
                    // Ensure signOut always returns a boolean (never undefined)
                },
                signOut: async () => {
                    const { setLoading, setError, setSuccess, setIsAuthenticated } = useUserAuthStore.getState();
                    try {
                        setLoading(true);
                        
                        // ✅ FIX 1: Clear storage FIRST, before any state changes
                        sessionStorage.removeItem('userAuthStore');
                        sessionStorage.removeItem('user-profile-store');
                        sessionStorage.removeItem('user-groups-store');
                        sessionStorage.removeItem('user-group-posts-store');
                        localStorage.clear();
                        sessionStorage.clear();
                        
                        // ✅ FIX 2: Clear other stores FIRST
                        useUserProfileStore.getState().clearProfile();
                        useUserGroupPostsStore.getState().clearUserGroupPosts();
                        useUserGroupsStore.getState().clearUserGroups();
                        
                        // ✅ FIX 3: Reset auth state LAST
                        set({ 
                            user: null, 
                            isAuthenticated: false,
                            error: null,
                            success: null 
                        });
                        
                        const response = await signOut();
                        if (response.success) {
                            setSuccess(response.message);
                            return true;
                        } else {
                            setError(response.message);
                            return false;
                        }
                    } catch (error) {
                        // ✅ FIX 4: Clear everything on error too
                        sessionStorage.clear();
                        localStorage.clear();
                        set({ user: null, isAuthenticated: false });
                        
                        useUserProfileStore.getState().clearProfile();
                        useUserGroupPostsStore.getState().clearUserGroupPosts();
                        useUserGroupsStore.getState().clearUserGroups();
                        
                        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
                        return false;
                    } finally {
                        setLoading(false);
                    }
                },

                getCurrentUser: async () => {
                    const { setLoading, setError, setSuccess, setIsAuthenticated } = useUserAuthStore.getState();
                    try {
                        setLoading(true);
                        setError(null);
                        setSuccess(null);
                        setIsAuthenticated(false);
                        const response = await getCurrentUser();
                        if(response.success)
                        {
                            set({ user: response.data });
                            setIsAuthenticated(true);
                            setSuccess(response.message);
                        }
                        else
                        {
                            setError(response.message);
                        }
                    }
                    catch(error){
                        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
                    }
                    finally{
                        setLoading(false);
                    }
                

                }
                
               
            }),
            {
                name: "userAuthStore",
                storage:{
                    getItem:(name: string)=> {
                        const str = sessionStorage.getItem(name);
                        return str ? JSON.parse(str) : null;
                    },
                    setItem:(name: string, value: any)=> {
                        sessionStorage.setItem(name, JSON.stringify(value));
                    },
                    removeItem:(name: string)=> {
                        sessionStorage.removeItem(name);

                    },
                },
            }
        )
    )
)

