import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotAuthorized = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='flex flex-col items-center bg-white p-10 rounded-lg shadow-md'>
        <h1 className='text-4xl text-red-600 font-bold mb-6'>Not Authorized</h1>
        <p className='text-lg text-gray-700 mb-8'>
          You do not have permission to view this page.
        </p>
        <button
          onClick={() => navigate('/login')}
          className='px-6 py-2 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 transition-colors duration-200'
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
