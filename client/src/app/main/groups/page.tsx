"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import Link from "next/link"

function GroupsPageForm() {
    const searchParams = useSearchParams();
    const signedIn = searchParams.get("signedIn") === "true";

    return (

        
        <div className="flex h-full items-center justify-center bg-teal-100 p-6">
            {signedIn ? (
                    <div className="flex h-full items-center justify-center bg-teal-100 p-6">
                        <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-lg border border-dashed border-teal-500 bg-white p-8 text-center shadow-sm">
                            <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
                            <p className="text-sm text-gray-600">
                                You are not signed in. Please sign in to continue.
                            </p>
                        </div>
                    </div>
                ):
                (
            <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-lg border border-dashed border-teal-500 bg-white p-8 text-center shadow-sm">
                <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
                <p className="text-sm text-gray-600">
                    You haven’t selected a group yet. Get started by creating one.
                </p>
                <Link
                    href="/create_group"
                    className="inline-flex items-center gap-2 rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                    </svg>
                    Create Group
                </Link>
            </div>
            )}
        </div>
        
    )
}

export default function GroupsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GroupsPageForm />
        </Suspense>
    )
}