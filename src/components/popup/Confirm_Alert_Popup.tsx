import React from 'react';
import { Confirm_Alert_PopupProps } from '../../interface/global';
import Button from '../common/button/Button';

const Confirm_Alert_Popup: React.FC<Confirm_Alert_PopupProps> = ({
  isAlert,
  onClose,
  onConfirm,
  message,
  className,
  autoFocus = true,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      onConfirm;
    }
  };

  return (
    <div
      className={`fixed -translate-x-2/4 -translate-y-2/4 z-[4] left-2/4 top-2/4 ${isAlert ? ' alert-modal' : ''} ${className}`}
      onKeyDown={handleKeyPress}
    >
      <div className='relative flex flex-col items-center bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] p-10 rounded-2xl border-2 border-solid border-[#c0c0c0] '>
        {!isAlert && <h1 className='mb-4 text-xl font-bold'>Medi</h1>}
        <p>{message}</p>
        <div className='flex gap-8 mb-4 mt-8 px-8'>
          <Button
            id ='ok_button'
            handleOnKeyDown={(e) => {
              if (e.key === 'Tab') {
                document.getElementById('cancel_button')?.focus();
                e.preventDefault();
              }
            }}
            handleOnClick={onConfirm}
            autoFocus={autoFocus}
          >
            OK
          </Button>
          {!isAlert && (
            <Button type='fog' handleOnClick={onClose}
            id = 'cancel_button'
              handleOnKeyDown={(e: any) => {
                  if (e.key === 'Tab') {
                    document.getElementById('ok_button')?.focus();
                    e.preventDefault();
                  }
                }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Confirm_Alert_Popup;
