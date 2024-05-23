import { useFormik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

export const BankDetails = () => {
    const [selectedAccountType, setSelectedAccountType] = useState('');

  const validationSchema = Yup.object({
    partyName: Yup.string()
      .max(100, 'Party Name must be 50 characters or less')
      .required('Party Name is required'),
  });

  const formik = useFormik({
    initialValues: {
        bankName: '',
        accountNumber: '',
        branchName:'',
        ifscCode:'',
        accountHolderName:'',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Form data', values);
    },
  });

    const handleInputChange = (e: { target: { value: any; id: any } }) => {
      const value = e.target.value;
      const id = e.target.id;
      console.log('value: ', e, id, value);
      if (e.target.id === 'accountType') {
        setSelectedAccountType(e.target.value);
      }  
    };

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
            type='text'
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
            value={formik.values.branchName}
          />
        </div>
        <div className='name_input'>
          <label htmlFor='accountType' className='label_name label_name_css'>
          A/C Type
          </label>
          <select
            id='accountType'
            name='accountType'
            value={selectedAccountType}
          onChange={handleInputChange}
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
            onChange={formik.handleChange}
            value={formik.values.ifscCode}
          />
        </div>
        <div className='name_input'>
          <label htmlFor='accountHolderName' className='label_name label_name_css'>
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
