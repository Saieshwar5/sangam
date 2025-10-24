"use client"

import { useState, useEffect , useRef} from 'react';
import useAuth from '@/hooks/useAuth';
import GoogleSignInButton from '../../ui_components/googleIcon';
import { useRouter } from 'next/navigation';


import { SignUpSuccess } from '@/util/successCardVariants';

export default function SignUpPage() {


  const [activeTab, setActiveTab] = useState<'google' | 'phone'>('google');
  const [render, setRender] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp ] = useState('');
  const router = useRouter();
  const {
    loading,
    error,
    success,
    isPhoneVerification,
    isAuthenticated,
    signInWithGoogle,
    sendOTP,
    verifyOTP,
    resendOTP,
    setOtp: otpSet,
    setIsPhoneVerification,
    clearMessages,
  } = useAuth();




  // beow useEffect is used to redirect to profile is user is new and before we show show to the user is authenticated

  useEffect(() => {
    if (isAuthenticated) {

    

      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    }
  }, [isAuthenticated]);

  // Handle Google Sign Up
  const handleGoogleSignUp = async () => {
    clearMessages();
    await signInWithGoogle();
  };

  // Handle Phone Number Sign Up
  const handlePhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    clearMessages();
    await sendOTP(phoneNumber);
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    
    clearMessages();
    await verifyOTP(otp);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    clearMessages();
    await resendOTP();
  };

  // Reset phone verification
  const handleResetPhone = () => {
    setIsPhoneVerification(false);
    setPhoneNumber('');
    setOtp('');
    clearMessages();
  };

  // Redirect if authenticated
  if (isAuthenticated) {
     return <SignUpSuccess />;
    
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-teal-400 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Choose your preferred sign-up method</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('google')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'google'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setActiveTab('phone')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'phone'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Phone
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Google Sign Up */}
          {activeTab === 'google' && !isPhoneVerification && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Sign up quickly and securely with your Google account
                </p>
                <div onClick={handleGoogleSignUp} className="cursor-pointer">
                  <GoogleSignInButton />
                </div>
              </div>
            </div>
          )}

          {/* Phone Number Form */}
          {activeTab === 'phone' && !isPhoneVerification && (
            <div className="space-y-6">
              <form onSubmit={handlePhoneSignUp} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                    placeholder="+1 (555) 123-4567"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending OTP...' : 'Send Verification Code'}
                </button>
              </form>
            </div>
          )}

          {/* OTP Verification Form */}
          {isPhoneVerification && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Phone</h3>
                <p className="text-gray-600 text-sm">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
              </div>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-center text-lg tracking-widest"
                    placeholder="000000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="flex-1 text-indigo-600 py-2 px-4 rounded-lg font-medium hover:text-indigo-700 transition-colors disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPhone}
                    className="flex-1 text-gray-600 py-2 px-4 rounded-lg font-medium hover:text-gray-800 transition-colors"
                  >
                    Change Number
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/auth/log_in" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* reCAPTCHA Container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}