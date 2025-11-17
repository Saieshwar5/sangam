"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
  isAuthenticated: boolean;
  profileName?: string;
  onLogout?: () => Promise<void> | void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  anchorRef,
  isAuthenticated,
  profileName,
  onLogout,
}: MobileMenuProps) {



  const router = useRouter();


  const handleProfileNameClick = () => {

    if(profileName){
      router.push(`/profile`);
    }
    else{
      router.push(`/auth/sign-in`);
    }
  }


  if (!isOpen || !anchorRef.current) return null;
     
  return (
    <div
      className="fixed inset-0 z-40 md:hidden"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="absolute right-4 top-16 w-48 rounded-xl border border-slate-200 bg-white py-3 shadow-xl">
        <div className="px-4 pb-2">
          <div className="text-xs text-slate-400">Signed in as</div>
          <div className="text-sm font-semibold text-slate-900"
           onClick={handleProfileNameClick}>
            {isAuthenticated ? profileName ?? "Member" : "Guest"}
          </div>
        </div>

        

        <div className="border-t border-slate-100 pt-2 px-4">
          {isAuthenticated ? (
            <button
              onClick={async () => {
                await onLogout?.();
                onClose();
              }}
              className="w-full rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Log out
            </button>
          ) : (
            <Link
              href="/auth/sign-in"
              className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
              onClick={onClose}
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}