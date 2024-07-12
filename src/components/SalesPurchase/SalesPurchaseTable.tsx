import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confirm_Alert_Popup from '../popup/ConfirmAlertPopup';
import { Sales_Table } from '../../views/SalesPurchase/index';

export const Sales_Purchase_Table = ({ type }: { type: string }) => {
  const navigate = useNavigate();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    return navigate('/sales_purchase_table', {
      state: type,
    });
  };

  return (
    <div>
      {<Sales_Table type={type} />}
      {popupState.isAlertOpen && (
        <Confirm_Alert_Popup
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
    </div>
  );
};
