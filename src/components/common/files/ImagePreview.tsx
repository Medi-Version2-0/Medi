import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Popup } from '../../popup/Popup';

interface ImagePreviewProps {
  url: string;
  name?: string;
  formik?: any;
  setNewImg: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ url, name, formik, setNewImg, className }) => {
  const [show, setShow] = useState(false);
  
  const handleRemove = () => {
    if (formik && name) {
      formik.setFieldValue(name, null);
    }
    setNewImg(true);
  };

  const handleClosePopup = () => {
    setShow(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <img 
        src={url} 
        alt='' 
        className='rounded-sm border-solid border-black border-2' 
        onClick={() => setShow(true)}
      />
      <button
        type='button'
        className='absolute top-[2px] right-[2px] p-0 text-red-500 hover:text-red-700 bg-white'
        onClick={handleRemove}
      >
        <FaTimes fontSize={'16px'}/>
      </button>
      {show && (
        <Popup heading='' onClose={handleClosePopup} childClass={'flex items-center justify-center p-0 m-0 max-w-[90vw] max-h-[90vh]'}>
          <img src={url} alt='' className='w-auto max-h-[90vh]' />
        </Popup>
      )}
    </div>
  );
};

export default ImagePreview;
