import { useAuthStore } from "@/app/context/userAuthState";

export const phoneAuth = {
  sendOTP: async (phoneNumber: string) => {
    const { sendOTP } = useAuthStore.getState();
    await sendOTP(phoneNumber);
  },

  verifyOTP: async (otp: string) => {
    const { verifyOTP } = useAuthStore.getState();
    await verifyOTP(otp);
  },

  resendOTP: async () => {
    const { resendOTP } = useAuthStore.getState();
    await resendOTP();
  },
};

export default phoneAuth;
