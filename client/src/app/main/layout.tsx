"use client"

import { useEffect } from "react"


import { SocketProvider } from "../context/socketContext";
import { usePathname } from "next/navigation"
import styles from "./mainLayout.module.css"
import Header from "../ui_components/header"
import SideBar from "../ui_components/sideBar"

import { GroupJoinAcceptSocketRequestsProvider } from "../socketRequests/groupJoinAcceptSocketReQuests"


export default function MainLayout({children}: Readonly<{
    children: React.ReactNode;
  }> )
{
    const pathname = usePathname()

    const isGroupsRoot = pathname === "/main/groups";
  const isGroupDetail =
    pathname?.startsWith("/main/groups/") && !isGroupsRoot;

  // When on a group detail route, hide header + sidebar on small screens
  const hideChromeOnMobile = isGroupDetail;


    return(
        <SocketProvider>
        <GroupJoinAcceptSocketRequestsProvider>
        <div className={styles.mainPageLayout} > 
           <div className={`${styles.top} ${hideChromeOnMobile ? "!hidden md:!flex" : ""}`}
           >
            <Header />
           </div >
           <div className={`${styles.left} ${hideChromeOnMobile ? "!hidden md:!flex" : ""}`}

           >
            <SideBar />
           </div>
           <div className={styles.main}>
           {children} 
            </div> 
        </div>
        </GroupJoinAcceptSocketRequestsProvider>
        </SocketProvider>
    )
}

