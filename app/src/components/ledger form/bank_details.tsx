import React, { useEffect, useMemo } from 'react';
import * as Yup from 'yup';

interface BankDetailsProps {
  formik?: any;
  receiveValidationSchemaBankDetails: (schema: Yup.ObjectSchema<any>) => void;
}

export const BankDetails: React.FC<BankDetailsProps> = ({
  formik,
  receiveValidationSchemaBankDetails,
}) => {
  const validationSchema = useMemo(
    () =>
      Yup.object({
        accountHolderName: Yup.string()
          .max(100, 'Account Holder Name must be 50 characters or less')
          .required('Account Holder Name is required'),
      }),
    []
  );

  useEffect(() => {
    receiveValidationSchemaBankDetails(validationSchema);
  }, [validationSchema, receiveValidationSchemaBankDetails]);

  return (
    <div className='tax_details_page'>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>
          <label htmlFor='bankName' className='label_name label_name_css'>
            Bank Name
          </label>
          <input
            type='text'
            id='bankName'
            name='bankName'
            onChange={formik.handleChange}
            value={formik.values.bankName}
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
          <label htmlFor='accountNumber' className='label_name label_name_css'>
            A/C No.
          </label>
          <input
            type='number'
            id='accountNumber'
            name='accountNumber'
            onChange={formik.handleChange}
            value={formik.values.accountNumber}
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
          <label htmlFor='branchName' className='label_name label_name_css'>
            Branch
          </label>
          <input
            type='text'
            id='branchName'
            name='branchName'
            onChange={formik.handleChange}
            value={formik.values.branchName.toUpperCase()}
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
          <label htmlFor='accountType' className='label_name label_name_css'>
            A/C Type
          </label>
          <select
            id='accountType'
            name='accountType'
            value={formik.values.accountType}
            onChange={(e) => {
              formik.handleChange(e);
            }}
            onBlur={formik.handleBlur}
            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('ifscCode')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('branchName')?.focus();
                e.preventDefault();
              }
            }}
          >
            <option value='Select'>Select an Option</option>
            <option value='Saving Account'>Saving Account</option>
            <option value='Current Account'>Current Account</option>
          </select>
        </div>
      </div>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>
          <label htmlFor='ifscCode' className='label_name label_name_css'>
            IFSC
          </label>
          <input
            type='text'
            id='ifscCode'
            name='ifscCode'
            maxLength={11}
            onChange={formik.handleChange}
            value={formik.values.ifscCode.toUpperCase()}
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
          <label
            htmlFor='accountHolderName'
            className='label_name label_name_css'
          >
            A/C Holder Name
          </label>
          <input
            type='text'
            id='accountHolderName'
            name='accountHolderName'
            onChange={formik.handleChange}
            value={formik.values.accountHolderName}
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
