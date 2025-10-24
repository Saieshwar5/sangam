
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/config/firebaseAuth";
import { useAuthStore } from "@/app/context/userAuthState";

export const googleAuth = async () => {
  const { signInWithGoogle } = useAuthStore.getState();
  await signInWithGoogle();
};

export default googleAuth;