"use client"

export default function GroupLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-full bg-white rounded-lg border-1 border-black">
            {children}
        </div>
    )
}
