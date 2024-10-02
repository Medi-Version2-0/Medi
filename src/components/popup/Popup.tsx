import { useEffect, useState } from 'react';
import { PopupProps } from '../../interface/global';
import { FaTimes } from 'react-icons/fa';
import { TabManager } from '../class/tabManager';

export const Popup: React.FC<PopupProps> = ({
  heading,
  children,
  className,
  childClass,
  id,
  isSuggestionPopup,
  onClose,
  focusChain =[]
}) => {
  const tabManager = TabManager.getInstance();
  const [initialTabId, setInitialTabId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const currentTabId = tabManager.activeTabId;
      setInitialTabId(currentTabId);
      setTimeout(() => {
        tabManager.addPopupToActiveTab(id, focusChain);
      }, 0);
    }
    return () => {
      if (id) {
        tabManager.removePopupFromActiveTab(id);
      }
    };
  }, []);

  
  
  return (
    <div className={`flex justify-center items-center fixed w-full h-full overflow-auto bg-[#00000066] z-[3] left-0 top-0 ${className}`} id={id && initialTabId ? `${initialTabId}-${id}` : ''}>
      <div className={`${isSuggestionPopup ? 'min-w-md max-w-[75%] h-fit' : ''} max-w-xs max-h-[42rem] bg-white border px-0 py-4 rounded-[0.4rem] border-solid border-[#888] ${childClass}`}>
        <div className='flex justify-between relative px-4'>
          {heading && (<h2 className="font-bold text-[#171A1FFF] mb-4"> {heading}</h2>)}
        {onClose && (
          <button
            type="button"
            id='cross'
            className="absolute top-[-5px] right-2 m-2 text-red-500 hover:text-red-700  bg-white"
            onClick={onClose}
          >
            <FaTimes fontSize={'18px'} />
          </button>
        )}
        </div>
        {children}
      </div>
    </div>
  );
};
