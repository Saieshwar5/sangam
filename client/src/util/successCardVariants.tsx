"use client"

import SuccessCard from '../app/ui_components/SuccessCard';

// Sign Up Success
export function SignUpSuccess({ onContinue }: { onContinue?: () => void }) {
  return (
    <SuccessCard
      title="Welcome!"
      message="You have successfully signed up!"
      //buttonText="Go to Dashboard"
     // onButtonClick={onContinue}
    />
  );
}

// Login Success
export function LoginSuccess({ onContinue }: { onContinue?: () => void }) {
  return (
    <SuccessCard
      title="Welcome Back!"
      message="You have successfully logged in!"
      buttonText="Continue"
      onButtonClick={onContinue}
    />
  );
}

// Profile Update Success
export function ProfileUpdateSuccess({ onContinue }: { onContinue?: () => void }) {
  return (
    <SuccessCard
      title="Profile Updated!"
      message="Your profile has been successfully updated!"
      buttonText="View Profile"
      onButtonClick={onContinue}
    />
  );
}

// Password Reset Success
export function PasswordResetSuccess({ onContinue }: { onContinue?: () => void }) {
  return (
    <SuccessCard
      title="Password Reset!"
      message="Your password has been successfully reset!"
      buttonText="Login"
      onButtonClick={onContinue}
    />
  );
}

// Generic Success with Custom Icon
export function CustomSuccess({ 
  title, 
  message, 
  buttonText, 
  onContinue,
  icon 
}: { 
  title: string;
  message: string;
  buttonText?: string;
  onContinue?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <SuccessCard
      title={title}
      message={message}
      buttonText={buttonText}
      onButtonClick={onContinue}
      icon={icon}
    />
  );
}