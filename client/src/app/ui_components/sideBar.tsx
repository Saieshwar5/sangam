"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useIsAuthenticated, useSignOut , useUser} from "@/hooks/useAuth"
import { useMessageStore } from '@/app/context/userMessageStore';
import { useNotification } from '@/app/context/socketContext';


import { MdGroups } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import { HiOutlineChatAlt2 } from "react-icons/hi";

export default function SideBar() {
    const { unreadCount, loadUnreadCount, isLoadingUnread } = useMessageStore();
    const [activeButton, setActiveButton] = useState<string>("")
    const router = useRouter()
    const user = useUser()
   
    const isAuthenticated = useIsAuthenticated()
    const signOut = useSignOut()
    const { notification, changeNotification } = useNotification();
    // Sample unread messages count
    
    // Simulate receiving new messages (sample data)
    useEffect(() => {
        if (user?.id) {
            // Load unread count on mount
            loadUnreadCount(user.id);
              
        }
    }, [user?.id, loadUnreadCount]);

    useEffect(() => {
         if(unreadCount > 0){
            changeNotification(true);
         }
         else{
            changeNotification(false);
         }
    }, [unreadCount]);
    
    const handleButtonClick = (buttonName: string) => {
        setActiveButton(buttonName)
        // You can add navigation logic here if needed
        switch(buttonName) {
            case "groups":
                // Navigate to groups page
                router.push("/main/groups")
                break
            case "chat":
                // Navigate to chat page// Clear unread count when opening chat
                router.push("/main/chat")
                break
            case "profile":{

                if(!user?.id){
                        router.push("/auth/sign-in")

                }
                else{
                    window.location.href = "/profile"
                }
                break
            }
            case "login":
                router.push("/auth/sign-up")
                break
            case "logout":
                handleLogout()
            default:
                break
        }
    }


   useEffect(() => {

    if (window.matchMedia("(min-width: 768px)").matches) return;

    if(user?.id){
        handleButtonClick("groups")
    }
   }, [user?.id])

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
        // FIXED: Changed 'wd:w-full' to 'md:w-full'
        const baseStyle = "flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-teal-400 relative md:w-full"
        const activeStyle = "bg-teal-600 text-white border-r-2 border-black"
        const inactiveStyle = "text-black hover:text-gray-900"
        
        return `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
    }
    
    return (
        <div className=" h-full w-full md:h-full  flex flex-row md:flex-col justify-between md:justify-start  "> 
           {/* <div className="flex-row justify-between h-full bg-yellow-500 w-full gap-4 md:flex-column p-4"> */}
                

               <div className="h-full w-full flex flex-row md:flex-col md:justify-start md:mb-4 md:gap-6 md:mt-4">
                <div className="flex items-center justify-center w-full h-full md:w-auto md:h-auto">
                
                
                <button
                    onClick={() => handleButtonClick("groups")}
                    className={`${buttonStyle(activeButton === "groups")} w-full md:flex-none`}
                >
                    <MdGroups className="w-6 h-6" />
                    <span>Groups</span>
                </button>
                </div>
            
                <div className="flex items-center justify-center  w-full h-full md:w-auto md:h-auto">
                    
                <button
                    onClick={() => handleButtonClick("chat")}
                    className={`${buttonStyle(activeButton === "chat")} w-full md:flex-none relative`}
                >
                    <HiOutlineChatAlt2 className="w-6 h-6" />
                    <span>Chat</span>
                    
            
                    {notification && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                            <IoIosNotifications className="w-3 h-3" />
                        </span>
                    )}
                </button>

                
        </div>

            
            
            
            <button
                onClick={() => handleButtonClick("profile")}
                className={`hidden md:flex ${buttonStyle(activeButton === "profile")}`}
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

        <div className= "hidden md:flex justify-center items-center mb-10">
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