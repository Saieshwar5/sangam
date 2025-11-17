"use client"

import { useEffect, useState, Suspense } from "react";
import { useUser } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useUserProfileStore } from "@/app/context/userProfileStore";
import { useJoinGroup } from "@/hooks/userGroups";


type ProfileData = {
  userId?: string;
  email?: string | null;
  displayName?: string | null;
  name: string;
  bio: string;
  profession: string;
  profilePicture: string;
};

function ProfileForm() {
  const joinGroupHook = useJoinGroup();
  const user  = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const redirect = searchParams.get('redirect');
  const newUser = searchParams.get('newUser');
  const {
    profile,
    error,
    success,
    isProfileLoaded,
    loadProfile,
    updateProfile,
    saveProfile,
  } = useUserProfileStore();

  const [form, setForm] = useState<ProfileData>({
    name: "",
    bio: "",
    profession: "",
    profilePicture: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isJoining, setIsJoining] = useState(false);



  useEffect(() => {
    if (user?.id && newUser !== 'true') {
  
      loadProfile(user.id);
      console.log( "profile status", isProfileLoaded);
    }

  }, [user?.id]);


  // ✅ Populate form when profile loads
  useEffect(() => {
    if (profile && profile.userId) {
      setForm({
        name: profile.name || "",
        bio: profile.bio || "",
        profession: profile.profession || "",
        profilePicture: profile.profilePicture || "",
       
      });
      if(profile.profilePicture) {
        console.log("profile.profilePicture", profile.profilePicture);
        setImagePreview(`${profile.profilePicture}`);
      }
      else {
        setImagePreview("");
      }
      setIsEditing(true);  // Profile exists, so we're in edit mode
 if(newUser === 'true') {
      setTimeout(() => {
        router.push(`/main/groups`);
      }, 3000);
    }
  }
  }, [profile]);

  useEffect(() => {
      
    if(redirect === 'join') {

      if (!isProfileLoaded) {
        console.log("🚫 Guard: Profile not loaded");
        return;
    }
    
    if (groupId === null || groupId === undefined) {
        console.log("🚫 Guard: GroupId is null/undefined");
        return;
    }
    
    if (redirect !== 'join') {
        console.log("🚫 Guard: Redirect is not 'join'");
        return;
    }
    
    if (!profile.name || profile.name === "") {
        console.log("🚫 Guard: Profile name is empty");
        return;
    }

     
       
       const response = handleJoinGroup();
       if(!response) {
      setMessage({ type: "success", text: "You have successfully joined the group" });
      router.push(`/main/${groupId}`);
     }
    }

  }, [isProfileLoaded, groupId, redirect, profile.name]);


  const handleJoinGroup = async () => {
    setIsJoining(true);
    try {
      const response = await joinGroupHook(groupId || '');
      if (response) {
        router.push(`/main/groups?message=Group joined successfully&success=true&follow=true`);
        setIsJoining(false);
        return true;
      }
      else {
        setIsJoining(false);
        return false;
      }
    }
    catch (error) {
      console.error(error);
    } finally {
      setIsJoining(false);
    }
  }
        

    
  

  // ✅ Show success/error from store
  useEffect(() => {
    if (success) {
      setMessage({ type: "success", text: success });
    } else if (error) {
      setMessage({ type: "error", text: error });
    }
  }, [success, error]);

  // Auto-clear messages
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const onChange =
    (key: keyof ProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);

    const objectUrl = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return objectUrl;
    });
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ✅ Combined save/update handler
  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('bio', form.bio.trim());
      formData.append('profession', form.profession.trim());
      formData.append('userId', user?.id || '');
      formData.append('email', user?.email || '');
      formData.append('displayName', form.name.trim());

      if (imageFile) {
        formData.append('image', imageFile);
      }

      // ✅ Check if we're editing or creating

      console.log( "isProfileLoaded####", isProfileLoaded);
      if (isProfileLoaded) {
        // Update existing profile
        console.log("you are in a wrong place")
        await updateProfile(formData, user?.id || '');
      } else {
        // Create new profile
        await saveProfile(formData);
        setIsEditing(true);  // After creating, switch to edit mode
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Operation failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleGoHome = () => {
    router.push('/main');
  };





  if(isJoining) {
    return <div>Joining group...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Your Profile' : 'Create Your Profile'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Update your personal information' : 'Complete your profile to get started'}
              </p>
            </div>
            
            {/* Home Button */}
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Avatar */}
            <div className="md:col-span-1">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 mb-4 relative group">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6S7 2.686 7 6s2.239 6 5 6zM2 22c0-3.866 4.477-7 10-7s10 3.134 10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <input type="file" accept="image/*" onChange={onSelectImage} className="hidden" />
                  {imagePreview ? 'Change photo' : 'Upload photo'}
                </label>
              </div>
            </div>

            {/* Fields */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={onChange("name")}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                <input
                  type="text"
                  value={form.profession}
                  onChange={onChange("profession")}
                  placeholder="e.g., Software Engineer, Designer, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={onChange("bio")}
                  placeholder="Tell us about yourself..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.bio.length} characters
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        name: profile.name || "",
                        bio: profile.bio || "",
                        profession: profile.profession || "",
                        profilePicture: profile.profilePicture || "",
                      });
                      setImageFile(null);
                      if (profile.profilePicture) {
                        setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/${profile.profilePicture}`);
                      }
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditing ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isEditing ? 'Update Profile' : 'Save Profile'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Preview Card */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </h2>
            <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-gray-300 shadow-sm">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6S7 2.686 7 6s2.239 6 5 6zM2 22c0-3.866 4.477-7 10-7s10 3.134 10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-gray-900 font-semibold text-lg">
                    {form.name || "Your name"}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {form.profession || "Your profession"}
                  </div>
                </div>
              </div>
              {form.bio && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {form.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileForm />
    </Suspense>
  );
}