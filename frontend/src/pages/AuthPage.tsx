import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../configs/firebaseConfigs';
import Toast from '../components/Toast'; // Import the Toast component

const AuthPage: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Successful sign-in is handled by App.tsx's onAuthStateChanged
      console.log("Sign-in process initiated.");
      // Optionally, show a success toast, though redirection might be too fast
      // setToastMessage("Signed in successfully!");
      // setToastType("success");
    } catch (error) {
      console.error("Error during sign-in:", error);
      let errorMessage = "Failed to sign in with Google. Please try again.";
      if (error instanceof Error) {
        // You could customize messages based on error.code if needed
        // e.g., if (error.code === 'auth/popup-closed-by-user')
        errorMessage = `Sign-in error: ${error.message}`;
      }
      setToastMessage(errorMessage);
      setToastType("error");
    }
  };

  const handleCloseToast = () => {
    setToastMessage(null);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <h1>Welcome</h1>
        <p>Please sign in to continue to the Todo App.</p>
        <button onClick={handleSignIn} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Sign in with Google
        </button>
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleCloseToast}
        />
      )}
    </>
  );
};

export default AuthPage;
