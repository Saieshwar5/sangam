"use client"




export default function CreateGroupLayout({children}: {children: React.ReactNode}) {
    return (
        <div className= "w-full h-full flex justify-center items-start">
            <div className="mt-10 w-200 h-full">
                {children}
            </div>
          
        </div>
    )
}