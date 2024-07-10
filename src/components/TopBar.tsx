import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../UserContext';
import userlogo from '../../src/assets/icons/user.png';
import { useNavigate } from 'react-router-dom';

export const TopBar = () => {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const { logout, user } = useUser();
  const popupRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const togglePopup = () => {
    setPopupVisible(!isPopupVisible);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setPopupVisible(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setPopupVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className='fixed top-1 right-0 z-10 p-1'>
      <div className='relative flex items-center'>
        <img
          className='h-12 w-12 rounded-full cursor-pointer border-2 border-gray-300  bg-cyan-100'
          src={userlogo}
          alt='profile'
          onClick={togglePopup}
        />
        {isPopupVisible && (
          <div
            ref={popupRef}
            className='absolute top-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50'
          >
            <h3 className='text-base font-bold mb-2'>Profile Options</h3>
            <ul>
              <li className='mb-1'>
                <p className='text-gray-700'>{user?.email}</p>
              </li>
              <div className='w=full flex flex-col gap-4'>
                <button
                  type='button'
                  className='py-1 px-1 w-full inline-flex justify-center items-center gap-x-2 text-sm border-gray-500 font-semibold rounded-lg border border-transparent text-blue-500 hover:bg-cyan-900 hover:text-cyan-800 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-yellow-800/30 dark:hover:text-cyan-600'
                  onClick={() => navigate('/redirecttocompany')}
                >
                  Switch Company
                </button>
                <button
                  type='button'
                  className='py-1 px-1 w-full inline-flex justify-center items-center border-gray-500 gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-500 hover:bg-red-100 hover:text-red-800 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-red-800/30 dark:hover:text-red-400'
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
