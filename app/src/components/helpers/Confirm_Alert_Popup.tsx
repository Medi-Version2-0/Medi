import React, { useEffect } from 'react';
import './helpers.css'; 
import { Confirm_Alert_PopupProps } from '../../interface/global';

const Confirm_Alert_Popup: React.FC<Confirm_Alert_PopupProps> = ({ isAlert, onClose, onConfirm, message }) => {

  useEffect(() => {
    setTimeout(() => {
      document.getElementById('ok_button')?.focus();
    }, 1);
  }, []);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      onConfirm
    }
  };

  return (
    <div className={`modal1${isAlert ? ' alert-modal' : ''}`} onKeyPress={handleKeyPress}>
      <div className="modal-content1">
        {!isAlert && <h1 className='modal-content1-header'>Medi</h1>}
        <p>{message}</p>
        <div className="modal-buttons1">
          <button id='ok_button' className='ok_button' onClick={onConfirm}>OK</button>
          {!isAlert && <button onClick={onClose}>Cancel</button>}
        </div>
      </div>
    </div>
  );
};

export default Confirm_Alert_Popup;
