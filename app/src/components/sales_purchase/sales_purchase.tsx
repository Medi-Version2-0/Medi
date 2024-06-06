import { useFormik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sales_Purchase_Section } from './sales_puchase_section';
import * as Yup from 'yup';
import { Popup } from '../helpers/popup';
import Confirm_Alert_Popup from '../helpers/Confirm_Alert_Popup';

export const Sales_Purchase: React.FC<any> = () => {
  const [selection, setSelection] = useState<'Sales' | 'Purchase'>('Sales');
  const [salesPurchaseValidationSchema, setSalesPurchaseValidationSchema] =
    useState(Yup.object().shape({}));
  const [open, setOpen] = useState<boolean>(true);
  const [hasErrors, setHasErrors] = useState(true);
  const location = useLocation();
  const data = location.state || {};
  const navigate = useNavigate();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const electronAPI = (window as any).electronAPI;

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    return navigate('/sales_purchase');
  };

  const handleSelection = (value: 'Sales' | 'Purchase') => {
    setSelection(value);
  };

  const togglePopup = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const handleSidebarClick = (event: any) => {
      if (event.target.id === 'sales_purchase_link') {
        setOpen(true);
      }
    };

    window.addEventListener('click', handleSidebarClick);

    return () => {
      window.removeEventListener('click', handleSidebarClick);
    };
  }, []);

  const sales_purchase_config = useFormik({
    initialValues: {
      spType: data?.spType || '',
      igst: data?.igst || '0.00',
      cgst: data?.cgst || '0.00',
      sgst: data?.sgst || '0.00',
      stPer: data?.stPer || '',
      surCharge: data?.surCharge || '',
      spNo: data?.spNo || '',
      column: data?.column || '',
      shortName: data?.shortName || '',
      shortName2: data?.shortName2 || '',
    },
    validationSchema: salesPurchaseValidationSchema,
    onSubmit: (values) => {
      console.log('sales/purchase data', values);
    },
  });

  const receiveValidationSchemaSalesPurchase = useCallback((schema: any) => {
    setSalesPurchaseValidationSchema(schema);
  }, []);

  const handleSubmit = () => {
    sales_purchase_config.handleSubmit();
    const allData = {
      ...sales_purchase_config.values,
    };
    console.log('>>>>>all Data : ', allData);

    electronAPI.addSalesPurchase(allData);
  };

  useEffect(() => {
    const checkErrors = async () => {
      const sales_purchase_configErrors =
        await sales_purchase_config.validateForm();

      const allErrors = {
        ...sales_purchase_configErrors,
      };

      setHasErrors(Object.keys(allErrors).length > 0);
    };

    checkErrors();
  }, [sales_purchase_config.values, sales_purchase_config.isValid]);

  return (
    <div>
      {open && (
        <Popup headding='Choose the type' className='popup-heading'>
          <div className='main-div'>
            <button
              id='sales_button'
              className='sales_purchase_button'
              onClick={() => {
                handleSelection('Sales');
                togglePopup();
              }}
            >
              Sales
            </button>
            <button
              id='purchase_button'
              className='sales_purchase_button'
              onClick={() => {
                handleSelection('Purchase');
                togglePopup();
              }}
            >
              Purchase
            </button>
          </div>
        </Popup>
      )}
      <Sales_Purchase_Section
        type={selection}
        formik={sales_purchase_config}
        receiveValidationSchemaSalesPurchase={
          receiveValidationSchemaSalesPurchase
        }
      />
      <button
        type='button'
        id='submit_all'
        onClick={() => {
          handleSubmit();
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: `${selection} account created successfully`,
          });
        }}
        className='submit_button'
        disabled={hasErrors}
        onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
          if (e.key === 'ArrowUp') {
            document.getElementById('accountHolderName')?.focus();
            e.preventDefault();
          }
        }}
      >
        {!!data.party_id ? 'Update' : 'Submit'}
      </button>
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
