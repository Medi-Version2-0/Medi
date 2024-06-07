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
    <div className='tax_details_page'>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>
          <FormikInputField
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
        </div>

        <div className='name_input'>
          <FormikInputField
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
        </div>
      </div>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>
          <FormikInputField
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
        </div>
        <div className='name_input'>
          <CustomSelect
            label='A/C Type'
            id='accountType'
            labelClass='label_name label_name_css'
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
              { value: 'Saving Account', label: 'Saving Account' },
              { value: 'Current Account', label: 'Current Account' },
            ]}
            isSearchable={false}
            placeholder='Select an option'
            disableArrow={false}
            hidePlaceholder={false}
            className='custom-select-field'
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
        </div>
      </div>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>
          <FormikInputField
            label='IFSC'
            id='ifscCode'
            name='ifscCode'
            maxLength={11}
            formik={formik}
            className='input_class'
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('accountHolderName')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('accountType')?.focus();
              }
            }}
          />
        </div>
        <div className='name_input'>
          <FormikInputField
            label='A/C Holder Name'
            id='accountHolderName'
            name='accountHolderName'
            formik={formik}
            className='input_class'
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
      </div>
    </div>
  );
};
