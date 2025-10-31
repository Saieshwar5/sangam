import { useUserProfileStore } from "@/app/context/userProfileStore";

export const useProfile = () => {
    const { profile, error, success, isProfileLoaded, loadProfile, updateProfile, saveProfile } = useUserProfileStore();
    return { profile, error, success, isProfileLoaded, loadProfile, updateProfile, saveProfile };
}

export const useProfileState = () => {
    return useUserProfileStore((state) => ({
        profile: state.profile,
        error: state.error,
        success: state.success,
        isProfileLoaded: state.isProfileLoaded,
    }));
}


    export const useProfileActions = () => {
        return useUserProfileStore((state) => ({
            loadProfile: state.loadProfile,
            updateProfile: state.updateProfile,
            saveProfile: state.saveProfile,
        }));
    }

    export const isProfileLoaded = () => {
        return useUserProfileStore((state) => state.isProfileLoaded);
    }


export const profileName = () => {
    const { profile } = useUserProfileStore();
    return profile?.name;
}

export const useProfileLoader = () => {
    return useUserProfileStore((state) => state.loadProfile);
}

   
    
    
