import { useFormik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

export const LicenceInfo = () => {

  const validationSchema = Yup.object({
    partyName: Yup.string()
      .max(100, 'Party Name must be 50 characters or less')
      .required('Party Name is required'),
  });

  const formik = useFormik({
    initialValues: {
      drugLicenceNo: '',
      expiryDate: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Form data', values);
    },
  });

  return (
    <div className='tax_details_page'>
      <div className='tax_ledger_inputs'>
        <div className='drugLic_input'>
          <label htmlFor='drugLicenceNo' className='label_name label_name_css'>
            Drug Lic. No.
          </label>
          <input
            type='text'
            id='drugLicenceNo'
            name='drugLicenceNo'
            onChange={formik.handleChange}
            value={formik.values.drugLicenceNo}
          />
        </div>
        <div className='drugLic_input'>
          <label htmlFor='expiryDate' className='label_name label_name_css'>
            Reg. Date
          </label>
          <input
            type='text'
            id='expiryDate'
            name='expiryDate'
            onChange={formik.handleChange}
            value={formik.values.expiryDate}
          />
        </div>
        <div className='add_drug_inputs'>
          <button className='drug_add_button'>+</button>
        </div>
      </div>
    </div>
  );
};
