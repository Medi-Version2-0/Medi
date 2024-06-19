import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Confirm_Alert_Popup from '../popup/Confirm_Alert_Popup';
import { Sales_Table } from '../../views/sales_purchase/index';

export const Sales_Purchase_Table: React.FC<any> = () => {
  const location = useLocation();
  const selection = location.state || {};
  const navigate = useNavigate();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    return navigate('/sales_purchase_table' , {state: selection === 'Sales Account' ? 'Sales' : 'Purchase'});
  };

  return (
    <div>
      {<Sales_Table type={selection === 'Sales Account' ? 'Sales' : 'Purchase'} />}
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
