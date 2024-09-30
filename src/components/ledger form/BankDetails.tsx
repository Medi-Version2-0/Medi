import React, { useState } from 'react';
import FormikInputField from '../common/FormikInputField';
import CustomSelect from '../custom_select/CustomSelect';
import { Option } from '../../interface/global';
import { TabManager } from '../class/tabManager';

interface BankDetailsProps {
  formik?: any;
}

export const BankDetails: React.FC<BankDetailsProps> = ({ formik }) => {
  const tabManager = TabManager.getInstance()
  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const validValue = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = validValue;
    formik.setFieldValue(e.target.name, validValue);
  }

  return (
    <div className='grid grid-cols-2 gap-x-4 gap-y-2 m-2 px-2 text-xs leading-3 text-gray-600'>
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='Bank Name'
        id='bankName'
        name='bankName'
        isUpperCase={true}
        formik={formik}
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='A/C No.'
        id='accountNumber'
        name='accountNumber'
        onChange={handleChange}
        maxLength={18}
        formik={formik}
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='Branch'
        id='branchName'
        name='branchName'
        isUpperCase={true}
        formik={formik}
      />
      <CustomSelect
        isPopupOpen={false}
        label='A/C Type'
        id='accountType'
        labelClass='min-w-[90px]'
        value={
          formik.values.accountType === ''
            ? null
            : {
                label: formik.values.accountType,
                value: formik.values.accountType,
              }
        }
        onChange={handleFieldChange}
        options={[
          {
            value: 'Saving Account',
            label: 'Saving Account',
          },
          {
            value: 'Current Account',
            label: 'Current Account',
          },
        ]}
        isSearchable={false}
        placeholder='Select an option'
        disableArrow={false}
        hidePlaceholder={false}
        onBlur={() => {
          formik.setFieldTouched('accountType', true);
        }}
        className='!rounded-none'
        onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
          const dropdown = document.querySelector(
            '.custom-select__menu'
          );
          if (e.key === 'Enter') {
           if(!dropdown){
            e.preventDefault();
            e.stopPropagation()
            tabManager.focusManager()
           }
          }
        }}
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='IFSC'
        id='ifscCode'
        name='ifscCode'
        maxLength={11}
        isUpperCase={true}
        formik={formik}
        className=''
      />
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='A/C Holder Name'
        id='accountHolderName'
        isUpperCase={true}
        name='accountHolderName'
        formik={formik}
        className=''
      />
    </div>
  );
};
