"use client"



import GroupsList from "@/app/ui_components/groupsList"


import { useSearchParams } from "next/navigation"



export default function GroupsLayout({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const signedIn = searchParams.get('signedIn')

    return (
        <div className="flex h-full w-full flex-row overflow-hidden">
              <div className="w-120 h-full overflow-y-auto bg-teal-100">
                 <GroupsList signedIn={signedIn === 'true'} />
              </div>
              <div className="flex-1 h-full bg-teal-100">
                {children}
              </div>
        </div>
    )
}