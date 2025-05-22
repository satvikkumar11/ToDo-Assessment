import React, { useState } from 'react';
import { summarizeTodos } from '../utils/api';
import Toast from './Toast'; // Assuming you have a Toast component

const FloatingActionButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSummarize = async () => {
    setIsLoading(true);
    setToast(null);
    try {
      const response = await summarizeTodos();
      setToast({ message: response.message, type: 'success' });
      // Optionally, you can display the summary: console.log(response.summary);
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to summarize.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <button
        
        className='fixed bottom-4 min-w-6 right-4 cursor-pointer bg-[#007bff] text-white shadow-[0_4px_8px_rgba(0,0,0,0.2)] text-[24px] px-2 rounded-md'
        onClick={handleSummarize}
        disabled={isLoading}
        title="Summarize Todos to Slack"
      >
        {isLoading ? (
          <svg
            aria-hidden="true"
            role="status"
            style={{ width: '24px', height: '24px', fill: 'white', animation: 'spin 1s linear infinite' }}
            viewBox="0 0 100 101"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#E5E7EB"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          // Replace with an actual icon if you have one, e.g., a Paper Plane for "send"
          <span>Summarize</span> 
        )}
      </button>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </>
  );
};

export default FloatingActionButton;
