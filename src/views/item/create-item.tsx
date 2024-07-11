import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormikProps, useFormik } from 'formik';
import Button from '../../components/common/button/Button';
import { itemFormValidations } from './validation_schema';
import BasicItemEdit from './BasicItemEdit';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { sendAPIRequest } from '../../helper/api';
import { useQueryClient } from '@tanstack/react-query';

export interface ItemFormValues {
  name: string;
  packing: string;
  service: string;
  shortName: string;
  hsnCode: number;
  compId: string;
  itemGroupCode: string;
  discountPer: number;
  saleAccId: string;
  purAccId: string;
  scheduleDrug: string;
  itemDiscPer: number;
  minQty: number;
  maxQty: number;
  selected: string;
  reckNumber: string;
  dpcact: string;
  upload: string;
}

export type ItemFormInfoType = FormikProps<ItemFormValues>;

const CreateItem = ({ setView , data }: any) => {
  const { organizationId } = useParams();
  const queryClient = useQueryClient();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const itemFormInfo: ItemFormInfoType = useFormik({
    initialValues: {
      name: data?.name || '',
      packing: data?.packing || '',
      service: data?.service || '',
      shortName: data?.shortName || '',
      hsnCode: data?.hsnCode || '',
      compId: data?.compId || '',
      itemGroupCode: data?.itemGroupCode || '',
      discountPer: data?.discountPer || '',
      saleAccId: data?.saleAccId || '',
      purAccId: data?.purAccId || '',
      scheduleDrug: data?.scheduleDrug || '',
      itemDiscPer: data?.itemDiscPer || '',
      minQty: data?.minQty || '',
      maxQty: data?.maxQty || '',
      selected: data?.selected || '',
      reckNumber: data?.reckNumber || '',
      dpcact: data?.dpcact || '',
      upload: data?.upload || '',
    },

    validationSchema: itemFormValidations(),
    onSubmit: async (values) => {
      try {
        if (data.id) {
          await sendAPIRequest(`/${organizationId}/item/${data.id}`, {
            method: 'PUT',
            body: values,
          });
        } else {
          await sendAPIRequest(`/${organizationId}/item`, {
            method: 'POST',
            body: values,
          });
        }
        await queryClient.invalidateQueries({ queryKey: ['get-items'] });

        setPopupState({
          isModalOpen: false,
          isAlertOpen: true,
          message: `Item ${data.id ? 'updated' : 'created'} successfully`,
        });
      } catch (error) {
        setPopupState({
          isModalOpen: false,
          isAlertOpen: true,
          message: `Failed to ${data.id ? 'update' : 'create'} item`,
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
        <h1 className='font-bold'>{data.id ? 'Update Item' : 'Create Item'}</h1>
        <Button
          type='highlight'
          id='item_button'
          handleOnClick={() => {
            setView('');
          }}
        >
          Back
        </Button>
      </div>
      <form
        onSubmit={itemFormInfo.handleSubmit}
        className='flex flex-col w-full'
      >
        <div className='flex flex-row px-4 mx-4 py-2 gap-2'>
          <BasicItemEdit formik={itemFormInfo} />
        </div>
        <div className='w-full px-8 py-2'>
          <Button
            type='fill'
            padding='px-4 py-2'
            id='submit_all'
            disable={!(itemFormInfo.isValid && itemFormInfo.dirty)}
            handleOnClick={itemFormInfo.handleSubmit}
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

export default CreateItem;
