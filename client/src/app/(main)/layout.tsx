"use client"

import { useEffect } from "react"

import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"

import styles from "./mainLayout.module.css"
import Header from "../ui_components/header"
import SideBar from "../ui_components/sideBar"

export default function MainLayout({children}: Readonly<{
    children: React.ReactNode;
  }> )
{
     

    return(
        <div className={styles.mainPageLayout} > 
           <div className={styles.top}>
            <Header />
           </div >
           <div className={styles.left}>
            <SideBar />
           </div>
           <div className={styles.main}>
           {children} 
            </div> 
        </div>
    )
}