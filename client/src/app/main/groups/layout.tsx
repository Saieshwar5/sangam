"use client"



import GroupsList from "@/app/ui_components/groupsList"

import { Suspense } from "react"

import { useSearchParams, usePathname } from "next/navigation"



function GroupsLayoutForm({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const signedIn = searchParams.get('signedIn')
    const pathName = usePathname()
    const isIndexPage = pathName === "/main/groups";

    return (
        <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
              <div className=
              { `${isIndexPage ? 'block' : 'hidden'} md:basis-2/5 md:block h-full overflow-y-auto bg-teal-100` }>
                 <GroupsList signedIn={signedIn === 'true'} />
              </div>
              <div className={`${isIndexPage ? 'hidden' : 'block'} md:basis-3/5 md:block h-full bg-teal-100`}>
                {children}
              </div>
        </div>
    )
}

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GroupsLayoutForm children={children} />
    </Suspense>
  );
}