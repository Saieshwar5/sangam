"use client"

import { useState , useRef, useEffect} from "react";
import { CiMenuKebab } from "react-icons/ci";
import MobileMenu from "./mobileMenu"; // adjust path
import { useAuth , useSignOut} from "@/hooks/useAuth"; // or wherever you get auth info

import { useProfileName, useIsProfileLoaded , useProfileLoader } from "@/hooks/useProfile";




export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const { user } = useAuth();
    const signOut = useSignOut();
    const profileName = useProfileName();
    const isProfileLoaded = useIsProfileLoaded();
    const loadProfile = useProfileLoader();


    useEffect(() => {
        if(user && !isProfileLoaded){
            console.log("Loading profile for user: ", user.id);
            loadProfile(user.id);
        }
    }, [user, isProfileLoaded, loadProfile]);



    return (
        <>
        <div className="flex items-center justify-between md:px-6 md:py-4 py-1 px-2 h-full w-full">
            
            <h1 className="text-medium md:text-2xl font-bold">Vedika.space</h1>

            <div className="flex items-center gap-3">
        
            <button
            ref={buttonRef}
            className="inline-flex h-10 w-10 items-center justify-center text-xl text-slate-600 transition hover:bg-slate-100 md:hidden"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <CiMenuKebab />
          </button>
            </div>
            
        </div>

        <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRef={buttonRef}
        isAuthenticated={!!user}
        profileName={profileName}
        onLogout={async () => {
            await signOut();
            setIsMenuOpen(false);
        }}
      />
        </>
    );
}