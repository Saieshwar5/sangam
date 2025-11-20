"use client"



import GroupsList from "@/app/ui_components/groupsList"

import { Suspense, useEffect ,useState} from "react"

import { useSearchParams, usePathname, useRouter } from "next/navigation"

import { useGroupJoinAcceptSocketRequests } from "@/app/socketRequests/groupJoinAcceptSocketReQuests"

import { useUserGroupsStore } from "@/app/context/userGroupsStore"


function GroupsLayoutForm({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const signedIn = searchParams.get('signedIn')
    const message = searchParams.get('message')
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const pathName = usePathname()
    const isIndexPage = pathName === "/main/groups";
    const router = useRouter();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const { userFollowedGroups, loadUserFollowedGroupById } = useUserGroupsStore();
    const [showAcceptToast, setShowAcceptToast] = useState(false);
    const [acceptToastMessage, setAcceptToastMessage] = useState('');
    const [isAcceptSuccess, setIsAcceptSuccess] = useState(false);


    const { acceptedRequest, hasAcceptedRequest, clearAcceptedNotification } = useGroupJoinAcceptSocketRequests();


    useEffect(() => {
      if (message && (success === 'true' || error === 'true')) {
          setToastMessage(message);
          setIsSuccess(success === 'true');
          setShowToast(true);

          // Auto-hide after 5 seconds
          const timer = setTimeout(() => {
              setShowToast(false);
              // Optional: Clear URL params cleanly without refresh
              // router.replace(pathName); 
          }, 5000);

          return () => clearTimeout(timer);
      }
  }, [message, success, error]);



  // ✅ New useEffect for join request accepted notification
  useEffect(() => {
    if (hasAcceptedRequest && acceptedRequest) {
        // Set toast message
        setAcceptToastMessage(`🎉 Your request to join "${acceptedRequest.groupName}" has been accepted!`);
        setIsAcceptSuccess(true);
        setShowAcceptToast(true);
        loadUserFollowedGroupById(acceptedRequest.groupId);

        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
            setShowAcceptToast(false);
            clearAcceptedNotification(); // Clear the notification state
        }, 5000);

        return () => clearTimeout(timer);
    }
}, [hasAcceptedRequest, acceptedRequest, clearAcceptedNotification]);

const handleAcceptToastClose = () => {
    setShowAcceptToast(false);
    clearAcceptedNotification();
};

const handleAcceptToastClick = () => {
    if (acceptedRequest?.groupId) {
        router.push(`/main/groups/${acceptedRequest.groupId}`);
        handleAcceptToastClose();
    }
};


    return (
        <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">


             {showToast && (
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-down ${
                    isSuccess ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    {isSuccess ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    <span className="font-medium">{toastMessage}</span>
                    <button 
                        onClick={() => setShowToast(false)}
                        className="ml-2 hover:opacity-70"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}



               {/* ✅ New accept toast notification */}
            {showAcceptToast && (
                <div 
                    className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 bg-green-50 text-green-800 border border-green-200 animate-fade-in-down cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={handleAcceptToastClick}
                >
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="flex-1">
                        <p className="font-medium text-sm">{acceptToastMessage}</p>
                        {acceptedRequest?.groupId && (
                            <p className="text-xs text-green-600 mt-0.5">Click to view group</p>
                        )}
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent navigation when clicking close
                            handleAcceptToastClose();
                        }}
                        className="ml-2 hover:opacity-70 flex-shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}






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