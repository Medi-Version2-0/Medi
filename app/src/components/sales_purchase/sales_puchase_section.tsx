import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { TaxTypeSection } from './tax_type_section';
import { ExtraDetailsSection } from './extra_details_section';
import { Sp_Header_Section } from './sp_header_section';
import { SalesPurchaseProps } from '../../interface/global';
import Confirm_Alert_Popup from '../popup/Confirm_Alert_Popup';
import Button from '../common/button/Button';

export const Sales_Purchase_Section: React.FC<SalesPurchaseProps> = ({
  type,
  data
}) => {
  const navigate = useNavigate();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const electronAPI = (window as any).electronAPI;
  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    return navigate('/sales_purchase_table', {state: typeof data === 'string' ? data : data.salesPurchaseType})
  };
  const salesPurchaseValidationSchema = Yup.object({
    spType: Yup.string()
      .max(100, `${type} Type must be 100 characters or less`)
      .required(`${type} Type is required`),
  });

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
      if(data.sp_id){
        const allData = {
          ...sales_purchase_config.values,
        };
        electronAPI.updateSalesPurchase(data.sp_id, allData);
      }else{
        const allData = {
          ...sales_purchase_config.values,
          salesPurchaseType: data,
        };
        electronAPI.addSalesPurchase(allData);
      }
    },
  });

  useEffect(() => {
    sales_purchase_config.validateForm();
  }, [type]);

  return (  
    <>
      <div className='w-full'>
        <div className="flex justify-between items-center px-4 bg-[#f3f3f3]">
          <h1 className="font-medium text-[1.3rem] text-[#474747]">{!!data.sp_id ? 'Update' : 'Create'} {type} Master</h1>
          <Button
            type='highlight'
            id='sp_button'
            className='mx-0.5'
            handleOnClick={() => {
              return navigate(`/sales_purchase_table`, {state: type === 'Sales' ? 'Sales' : 'Purchase'});
            }}
          >
            Back
          </Button>
        </div>
        <form
          onSubmit={sales_purchase_config.handleSubmit}
          className='flex flex-col w-full p-4'
        >
          <Sp_Header_Section type={type} formik={sales_purchase_config} />
          <div className='flex sm:flex-col md:flex-row gap-4 w-full shadow-[5px_0px_8px_gray] mx-0 my-4 p-4'>
            <TaxTypeSection formik={sales_purchase_config} />
            <ExtraDetailsSection formik={sales_purchase_config} />
          </div>
          <div className='flex gap-4 w-full mx-0'>
            <Button
              type='highlight'
              id='submit_all'
              disable={
                !(sales_purchase_config.isValid && sales_purchase_config.dirty)
              }
              handleOnClick={() => {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: `${typeof data === 'string' ? data : data.salesPurchaseType} account ${!!data.sp_id ? 'updated' : 'submitted'} successfully`,
                });
              }}
              handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                if (e.key === 'ArrowUp') {
                  document.getElementById('accountHolderName')?.focus();
                  e.preventDefault();
                }
              }}
            >
              {!!data.sp_id ? 'Update' : 'Submit'}
            </Button>
          </div>
        </form>
        {popupState.isAlertOpen && (
          <Confirm_Alert_Popup
            onConfirm={handleAlertCloseModal}
            message={popupState.message}
            isAlert={popupState.isAlertOpen}
          />
        )}
      </div>
    </>
  );
};
