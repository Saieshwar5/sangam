"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useIsAuthenticated, useSignOut } from "@/hooks/useAuth"

import { IoIosNotifications } from "react-icons/io";

export default function SideBar() {
    const [activeButton, setActiveButton] = useState<string>("")
    const router = useRouter()

   
    const isAuthenticated = useIsAuthenticated()
    const signOut = useSignOut()
    const handleButtonClick = (buttonName: string) => {
        setActiveButton(buttonName)
        // You can add navigation logic here if needed
        switch(buttonName) {
            case "groups":
                // Navigate to groups page
                router.push("/groups")
                break
            case "chat":
                // Navigate to chat page
                router.push("/chat")
                break
            case "profile":
                window.location.href = "/profile"
                break
            case "login":
                router.push("/auth/sign-up")
                break
            case "logout":
                handleLogout()
            default:
                break
        }
    }

    const handleLogout = async () => {
        const result = await signOut()
        if(result){
            router.push("/auth/sign-up")
            return true;
        }
        else{
            return false;
        }
    }
    const buttonStyle = (isActive: boolean) => {
        const baseStyle = "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-teal-400"
        const activeStyle = "bg-teal-600 text-white border-r-2 border-black"
        const inactiveStyle = "text-black hover:text-gray-900"
        
        return `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
    }

    return (
        <div className="h-full flex flex-col justify-between">  
        <div className="flex flex-col p-4">
            {/* Groups Button */}
            <button
                onClick={() => handleButtonClick("groups")}
                className={`${buttonStyle(activeButton === "groups")} mb-4`}
            >
                <Image
                    src="/groups.svg"
                    alt="Groups"
                    width={24}
                    height={24}
                    className="flex-shrink-0 "
                />
                <span>Groups</span>
            </button>

            {/* Chat Button */}
            <button
                onClick={() => handleButtonClick("chat")}
                className={`${buttonStyle(activeButton === "chat")} mb-4`}
            >
                <Image
                    src="/chat.svg"
                    alt="Chat"
                    width={24}
                    height={24}
                    className="flex-shrink-0"
                />
                <span>Chat</span>
            </button>

            {/* Profile Button */}
            <button
                onClick={() => handleButtonClick("profile")}
                className={`${buttonStyle(activeButton === "profile")}`}
            >
                <Image
                    src="/profile.svg"
                    alt="Profile"
                    width={24}
                    height={24}
                    className="flex-shrink-0"
                />
                <span>Profile</span>
            </button>

        </div>

        <div className= "flex justify-center items-center mb-10">
            {isAuthenticated ? (
                <button className="bg-teal-400 text-black px-6 py-4 rounded-lg font-medium hover:bg-teal-600 transition-colors" onClick={() => { handleButtonClick("logout")}}>
                    Logout
                </button>
            ) : (
            <button className="bg-teal-400 text-black px-6 py-4 rounded-lg font-medium hover:bg-teal-600 transition-colors" onClick={() => { handleButtonClick("login")}}>
                Log-In
            </button>
            )}
        </div>




        </div>
    )
}