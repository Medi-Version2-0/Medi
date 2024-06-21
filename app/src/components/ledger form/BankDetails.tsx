import React, { useState } from 'react';
import FormikInputField from '../common/FormikInputField';
import CustomSelect from '../custom_select/CustomSelect';
import { Option } from '../../interface/global';

interface BankDetailsProps {
  formik?: any;
}

export const BankDetails: React.FC<BankDetailsProps> = ({
  formik,
}) => {
  const [focused, setFocused] = useState('');
  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  return (
    <div className='grid grid-cols-2 gap-x-4 gap-y-2 m-2 px-2 text-xs leading-3 text-gray-600'>
      <FormikInputField
      isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='Bank Name'
        id='bankName'
        name='bankName'
        formik={formik}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('accountNumber')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('Bank_Details')?.focus();
          }
        }}
      />
      <FormikInputField
      isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='A/C No.'
        id='accountNumber'
        name='accountNumber'
        formik={formik}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('branchName')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('bankName')?.focus();
            e.preventDefault();
          }
        }}
      />
      <FormikInputField
      isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='Branch'
        id='branchName'
        name='branchName'
        formik={formik}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            setFocused('accountType');
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('accountNumber')?.focus();
          }
        }}
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
            label: 'Saving Account'
          },
          {
            value: 'Current Account',
            label: 'Current Account'
          },
        ]}
        isSearchable={false}
        placeholder='Select an option'
        disableArrow={false}
        hidePlaceholder={false}
        isFocused={focused === 'accountType'}
        onBlur={() => { setFocused(""); }}
        className='!rounded-none'
        onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
          if (e.key === 'Enter') {
            document.getElementById('ifscCode')?.focus();
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
        formik={formik}
        className=''
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('accountHolderName')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            setFocused('accountType');
          }
        }}
      />
      <FormikInputField
      isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='A/C Holder Name'
        id='accountHolderName'
        name='accountHolderName'
        formik={formik}
        className=''
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('submit_all')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('ifscCode')?.focus();
          }
        }}
      />
    </div>
  );
};
