import { PopupProps } from '../../interface/global';
import { FaTimes } from 'react-icons/fa';

export const Popup: React.FC<PopupProps> = ({
  heading,
  children,
  className,
  childClass,
  id,
  isSuggestionPopup,
  onClose,
}) => {
  return (
    <div className={`flex justify-center items-center fixed w-full h-full overflow-auto bg-[#00000066] z-[3] left-0 top-0 ${className}`} id={id}>
      <div className={`${isSuggestionPopup ? 'min-w-md max-w-[75%] h-fit' : ''} max-w-xs max-h-[42rem] bg-white border px-0 py-4 rounded-[0.4rem] border-solid border-[#888] ${childClass}`}>
      <div className='w-full flex justify-between relative px-4 py-3'>
          {heading && (<h2 className="font-bold text-[#171A1FFF] mb-0"> {heading}</h2>)}
        {onClose && (
          <button
            type="button"
            className="absolute top-[-10px] right-1  text-black-500 hover:text-red-700  bg-white"
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
