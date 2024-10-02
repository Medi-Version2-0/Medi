import React, { useEffect, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { Confirm_Alert_PopupProps } from '../../interface/global';
import Button from '../common/button/Button';
import { TabManager } from '../class/tabManager';

const Confirm_Alert_Popup: React.FC<Confirm_Alert_PopupProps> = ({
  isAlert,
  onClose,
  onConfirm,
  message,
  className,
  onAdd,
  addText,
  id,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose?.();
    }
  };

  const tabManager = TabManager.getInstance();
  const [initialTabId, setInitialTabId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const currentTabId = tabManager.activeTabId;
      setInitialTabId(currentTabId);
      setTimeout(() => {
        tabManager.addPopupToActiveTab(id, ['confirm' , ...(!isAlert ? ['cancel'] : [])]);
      }, 0);
    }
    return () => {
      if (id) {
        tabManager.removePopupFromActiveTab(id);
      }
    };
  }, []);

  return (
    <FocusTrap>
      <div
        className={`fixed -translate-x-2/4 -translate-y-2/4 z-[4] left-2/4 top-2/4 ${isAlert ? ' alert-modal' : ''} ${className}`}
        onKeyDown={handleKeyPress}
        tabIndex={-1}
        id={id && initialTabId ? `${initialTabId}-${id}` : ''}>
        <div className='relative flex flex-col items-center bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] p-10 rounded-2xl border-2 border-solid border-[#c0c0c0]'>
          {!isAlert && <h1 className='mb-4 text-xl font-bold'>Medi</h1>}
          <p>{message}</p>
          <div className='flex gap-8 mb-4 mt-8 px-8'>
            <Button
              className=''
              id='confirm'
              type='highlight'
              handleOnClick={onConfirm}
            >
              OK
            </Button>
            {!isAlert && (
              <Button type='fog' id='cancel' handleOnClick={onClose}>
                Cancel
              </Button>
            )}
            {onAdd && addText && (
              <Button type='fill' handleOnClick={onAdd}>
                {addText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};

export default Confirm_Alert_Popup;
