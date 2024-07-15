import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormikProps, useFormik } from 'formik';
import Button from '../../components/common/button/Button';
// import { itemFormValidations } from './validation_schema';
// import BasicItemEdit from './BasicItemEdit';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { sendAPIRequest } from '../../helper/api';
import { useQueryClient } from '@tanstack/react-query';

export interface VoucherFormValues {
    voucherType: string;
    date: string;
    voucherNo: number;
    gstNature: string;
    account: string;
    narration: string;
    amount: number;
    openingBalance: number;
    openingBalanceType: string;
    discount: number;
    debtorCashBook: string;
    bank: string;
    chequeNumber: string;
    chequeDate: string;
}

export type VoucherFormInfoType = FormikProps<VoucherFormValues>;

const CreateVoucher = ({ setView , data }: any) => {
  const { organizationId } = useParams();
  const queryClient = useQueryClient();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const voucherFormInfo: VoucherFormInfoType = useFormik({
    initialValues: {
        voucherType: data?.voucherType || '',
        date: data?.date || '',
        voucherNo: data?.voucherNo || '',
        gstNature: data?.gstNature || '',
        account: data?.account || '',
        narration: data?.narration || '',
        amount: data?.amount || '',
        openingBalance: data?.openingBalance || '',
        openingBalanceType: data?.openingBalanceType || '',
        discount: data?.discount || '',
        debtorCashBook: data?.debtorCashBook || '',
        bank: data?.bank || '',
        chequeNumber: data?.chequeNumber || '',
        chequeDate: data?.chequeDate || '',
    },

    // validationSchema: itemFormValidations(),
    onSubmit: async (values) => {
      try {
        if (data.id) {
          await sendAPIRequest(`/${organizationId}/voucher/${data.id}`, {
            method: 'PUT',
            body: values,
          });
        } else {
          await sendAPIRequest(`/${organizationId}/voucher`, {
            method: 'POST',
            body: values,
          });
        }
        await queryClient.invalidateQueries({ queryKey: ['get-vouchers'] });

        setPopupState({
          isModalOpen: false,
          isAlertOpen: true,
          message: `Voucher ${data.id ? 'updated' : 'created'} successfully`,
        });
      } catch (error) {
        setPopupState({
          isModalOpen: false,
          isAlertOpen: true,
          message: `Failed to ${data.id ? 'update' : 'create'} voucher`,
        });
      }
    },
  });

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    setView('');
  };

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>{data.id ? 'Update Voucher' : 'Create Voucher'}</h1>
        <Button
          type='highlight'
          id='voucher_button'
          handleOnClick={() => {
            setView('');
          }}
        >
          Back
        </Button>
      </div>
      <form
        onSubmit={voucherFormInfo.handleSubmit}
        className='flex flex-col w-full'
      >
        <div className='flex flex-row px-4 mx-4 py-2 gap-2'>
          {/* <BasicItemEdit formik={itemFormInfo} /> */}
        </div>
        <div className='w-full px-8 py-2'>
          <Button
            type='fill'
            padding='px-4 py-2'
            id='submit_all'
            disable={!(voucherFormInfo.isValid && voucherFormInfo.dirty)}
            handleOnClick={voucherFormInfo.handleSubmit}
            handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
              }
            }}
          >
            {data.id ? 'Update' : 'Submit'}
          </Button>
        </div>
      </form>
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          onClose={handleAlertCloseModal}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
    </div>
  );
};

export default CreateVoucher;
