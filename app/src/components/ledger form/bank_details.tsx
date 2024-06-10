import React from 'react';
import FormikInputField from '../common/FormikInputField';
import CustomSelect from '../custom_select/CustomSelect';
import { Option } from '../../interface/global';

interface BankDetailsProps {
  formik?: any;
}

export const BankDetails: React.FC<BankDetailsProps> = ({
  formik,
}) => {
  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  return (
    <div className='grid grid-cols-2 gap-2 m-2'>
      <FormikInputField
        labelClassName='w-1/5'
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
        labelClassName='w-1/5'
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
        labelClassName='w-1/5'
        label='Branch'
        id='branchName'
        name='branchName'
        formik={formik}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('accountType')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('accountNumber')?.focus();
          }
        }}
      />
      <CustomSelect
        label='A/C Type'
        id='accountType'
        labelClass='font-bold text-gray-600 w-1/5 mr-2'
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
          { value: 'Saving Account', 
            label: 'Saving Account' },
          { value: 'Current Account',  
            label: 'Current Account' },
        ]}
        isSearchable={false}
        placeholder='Select an option'
        disableArrow={false}
        hidePlaceholder={false}
        className='!rounded-none'
        onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('ifscCode')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('branchName')?.focus();
            e.preventDefault();
          }
        }}
      />
      <FormikInputField
        labelClassName='w-1/5'
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
            document.getElementById('accountType')?.focus();
          }
        }}
      />
      <FormikInputField
        labelClassName='w-1/5'
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
