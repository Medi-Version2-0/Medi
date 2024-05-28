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
    () => Yup.object({
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
          />
        </div>
      </div>
    </div>
  );
};