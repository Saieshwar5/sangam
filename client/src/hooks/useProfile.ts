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

    export const useIsProfileLoaded = () => {
        return useUserProfileStore((state) => state.isProfileLoaded);
    }
    
    // ✅ Converted to custom hook (starts with "use")
    export const useProfileName = () => {
        const { profile } = useUserProfileStore();
        return profile?.name;
    }
    
    // ✅ Already a hook - no changes needed
    export const useProfileLoader = () => {
        return useUserProfileStore((state) => state.loadProfile);
    }
   
    
    
