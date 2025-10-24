"use client"

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { saveProfile , updateProfileOnServer, loadProfileFromServer } from "@/api/profileApis";



interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  name: string;
  bio: string;
  profession: string;
  photoURL: File | null;
  phoneNumber: string;
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  isArchived: boolean;
  isSuspended: boolean;
  isBanned: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserProfileState {
  profile: UserProfile;
  error: string | null;
  success: string | null;
  isProfileLoaded: boolean;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
  updateProfile: (profile: FormData, userId: string) => void;
  saveProfile: (profile: FormData) => Promise<void>;
  getProfile: () => UserProfile;
  loadProfile: (userId: string) => Promise<void>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setIsProfileLoaded: (isProfileLoaded: boolean) => void;
}

export const useUserProfileStore = create<UserProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state - declare each property ONCE
        profile: {
          userId: "",
          email: "",
          displayName: "",
          name: "",
          bio: "",
          profession: "",
          photoURL: null,   
          phoneNumber: "",
          isActive: false,
          isVerified: false,
          isDeleted: false,
          isArchived: false,
          isSuspended: false,
          isBanned: false,
          isBlocked: false,
          createdAt: "",
          updatedAt: "",
        },
        error: null,
        success: null,
        isProfileLoaded: false,
        
        // Actions
        setProfile: (profile) => set({ profile }),
        clearProfile: () => {
          // ✅ Clear the persisted storage first
          sessionStorage.removeItem('user-profile-store');
          
          // ✅ Reset to initial state
          set({ 
              profile: {
                  userId: "",
                  email: "",
                  displayName: "",
                  name: "",
                  bio: "",
                  profession: "",
                  photoURL: null,
                  phoneNumber: "",
                  isActive: false,
                  isVerified: false,
                  isDeleted: false,
                  isArchived: false,
                  isSuspended: false,
                  isBanned: false,
                  isBlocked: false,
                  createdAt: "",
                  updatedAt: "",
              },
              error: null,
              success: null,
              isProfileLoaded: false
          });
      },
        updateProfile: async (profile, userId) => {

            try{

                set({error: null,
                    success: null,
                });

                if(userId === ""){
                    set({ error: "User ID is required" });
                    return;
                }

                const response = await updateProfileOnServer(profile, userId);

                if(response.success){
                    set({ profile: response.data });
                    set({ isProfileLoaded: true });
                    set({ success: response.message });
                }
                else{
                    set({ profile: { name: "", bio: "", profession: "", photoURL: null, userId: "", email: "", displayName: "", phoneNumber: "", isActive: false, isVerified: false, isDeleted: false, isArchived: false, isSuspended: false, isBanned: false, isBlocked: false, createdAt: "", updatedAt: "" } });
                    set({ error: response.message });
                }
            }
            catch(error){
                console.error(error);
               
            }




        },

        saveProfile: async (profile : FormData) => {
          try {
            
            set({ isProfileLoaded: false });
            set({ error: null });
            set({ success: null });

            profile.forEach((value, key) => {
              console.log("key", key);
              console.log("value", value);
            });
            console.log("what the fuck dude", profile);

            const response = await saveProfile(profile);

            console.log("response", response);

            if (response.success) {
              set({ profile: response.data });
              set({ isProfileLoaded: true });
              set({ success: response.message });
            } else {
              set({ profile: { name: "", bio: "", profession: "", photoURL: null, userId: "", email: "", displayName: "", phoneNumber: "", isActive: false, isVerified: false, isDeleted: false, isArchived: false, isSuspended: false, isBanned: false, isBlocked: false, createdAt: "", updatedAt: "" } });
              set({ isProfileLoaded: false });
              set({ error: response.message });
            }
          } catch (error: any) {
            set({ error: error.message });
            set({ isProfileLoaded: false });
            set({ success: null });
          }
        },

        loadProfile: async (userId) =>
        {
            try{
                set({error: null,
                    success: null,
                    isProfileLoaded: false,
                });

                const response = await loadProfileFromServer(userId);

                if(response.success)
                {
                    set({ profile: response.data });
                    set({ isProfileLoaded: true });
                    set({ success: response.message });
                }
                else{
                    set({ profile: { name: "", bio: "", profession: "", photoURL: null, userId: "", email: "", displayName: "", phoneNumber: "", isActive: false, isVerified: false, isDeleted: false, isArchived: false, isSuspended: false, isBanned: false, isBlocked: false, createdAt: "", updatedAt: "" } });
                    set({ isProfileLoaded: false });
                    set({ error: response.message });
                }
            }
            catch(error){
                console.error(error);
            }

        },
        
        getProfile: () => get().profile,
        setError: (error) => set({ error }),
        setSuccess: (success) => set({ success }),
        setIsProfileLoaded: (isProfileLoaded) => set({ isProfileLoaded }),
        
      }),   
      {
        name: "user-profile-store",
        storage: {
          getItem: (name) => {
            const str = sessionStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          },
          setItem: (name, value) => {
            sessionStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => {
            sessionStorage.removeItem(name);
          },
        },
      }
    ),
    {
      name: "user-profile-store",
    }
  )
);