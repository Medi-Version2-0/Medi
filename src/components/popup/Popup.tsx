import { PopupProps } from '../../interface/global';

export const Popup: React.FC<PopupProps> = ({
  heading,
  children,
  className,
  childClass
}) => {

  return (
    <div className={`flex justify-center items-center fixed w-full h-full overflow-auto bg-[#00000066] z-[3] left-0 top-0 ${className}`}>
      <div className={` max-w-xs max-h-[32rem] bg-white border px-0 py-4 rounded-[0.4rem] border-solid border-[#888] ${childClass}`}>
        <h2 className='w-[90%] font-bold text-[#171A1FFF] mb-4 mx-4 my-0'>{heading}</h2>
        {children}
      </div>
    </div>
  );
};
