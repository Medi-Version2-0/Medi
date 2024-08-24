import { PopupProps } from '../../interface/global';
import { FaTimes } from 'react-icons/fa';

export const Popup: React.FC<PopupProps> = ({
  heading,
  children,
  className,
  childClass,
  id,
  onClose,
  isSuggestionPopup
}) => {
  return (
    <div className={`flex justify-center items-center fixed w-full h-full overflow-auto bg-[#00000066] z-[3] left-0 top-0 ${className}`} id={id}>
      <div className={`${isSuggestionPopup ? 'min-w-md max-w-[48%] h-fit' : ''} relative min-w-[28%] bg-white border px-0 py-4 rounded-[0.4rem] border-solid border-[#888] ${childClass}`}>
        {onClose && (
          <button
            type="button"
            className="absolute top-0 right-0 m-2 text-red-500 hover:text-red-700  bg-white"
            onClick={onClose}
          >
            <FaTimes fontSize={'18px'} />
          </button>
        )}
        {heading && <h2 className='w-[90%] font-bold text-[#171A1FFF] mb-4 mx-4 my-0'>{heading}</h2>}
        {children}
      </div>
    </div>
  );
};
