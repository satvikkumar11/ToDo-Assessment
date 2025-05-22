import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './configs/firebaseConfigs';
import TodoApp from './components/TodoApp';
import AuthPage from './pages/AuthPage'; // Assuming AuthPage is in src/pages
import FloatingActionButton from './components/FloatingActionButton';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            currentUser ? (
              <>
                <TodoApp />
                <FloatingActionButton />
              </>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/auth"
          element={currentUser ? <Navigate to="/" replace /> : <AuthPage />}
        />
        {/* Optional: Catch-all route to redirect to a known safe page */}
        <Route path="*" element={<Navigate to={currentUser ? "/" : "/auth"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
