import { useUserAuthStore } from '@/app/context/userAuthStore';

/**
 * Hook to get current user
 */
export const useUser = () => {
    return useUserAuthStore((state) => state.user);
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
    return useUserAuthStore((state) => state.isAuthenticated);
};

/**
 * Hook to get loading state
 */
export const useAuthLoading = () => {
    return useUserAuthStore((state) => state.loading);
};

/**
 * Hook to get error state
 */
export const useAuthError = () => {
    return useUserAuthStore((state) => state.error);
};

/**
 * Hook to get success message
 */
export const useAuthSuccess = () => {
    return useUserAuthStore((state) => state.success);
};

/**
 * Hook to get all auth actions
 */
export const useAuthActions = () => {
    return useUserAuthStore((state) => ({
        createUser: state.createUser,
        signInWithEmail: state.signInWithEmail,
        signOut: state.signOut,
        getCurrentUser: state.getCurrentUser,
        setLoading: state.setLoading,
        setError: state.setError,
        setSuccess: state.setSuccess,
        setIsAuthenticated: state.setIsAuthenticated,
    }));
};

/**
 * Hook to get specific action
 */
export const useSignIn = () => {
    return useUserAuthStore((state) => state.signInWithEmail);
};

export const useSignUp = () => {
    return useUserAuthStore((state) => state.createUser);
};

export const useSignOut = () => {
    return useUserAuthStore((state) => state.signOut);
};

/**
 * Combined hook to get user info and loading state
 */
export const useAuthState = () => {
    return useUserAuthStore((state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        success: state.success,
    }));
};

/**
 * Hook to get everything (use sparingly - causes more re-renders)
 */
export const useAuth = () => {
    return useUserAuthStore();
};