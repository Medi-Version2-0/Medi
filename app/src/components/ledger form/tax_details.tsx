import { useFormik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

export const TaxDetails = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedTdsOption, setSelectedTdsOption] = useState('');
  const [selectedPayeeCategoryOption, setSlectedPayeeCategoryOption] =
    useState('');

  const validationSchema = Yup.object({
    partyName: Yup.string()
      .max(100, 'Party Name must be 50 characters or less')
      .required('Party Name is required'),
  });

  const formik = useFormik({
    initialValues: {
      ledgerType: '',
      gstIn: '',
      registrationDate: '',
      panCard: '',
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
    if (e.target.id === 'ledgerType') {
      setSelectedOption(e.target.value);
    } else if (e.target.id === 'tdsApplicable') {
      setSelectedTdsOption(e.target.value);
    } else if (e.target.id === 'payeeCategory') {
      setSlectedPayeeCategoryOption(e.target.value);
    }
  };

  return (
    <div className='tax_details_page'>
      <div className='tax_ledger_inputs small_tax_ledger_inputs'>
        <label htmlFor='ledgerType' className='label_name label_name_css'>
          GST Applicable
        </label>
        <select
          id='ledgerType'
          name='ledgerType'
          value={selectedOption}
          onChange={handleInputChange}
          onBlur={formik.handleBlur}
        >
          <option value='Select'>Select an Option</option>
          <option value='Registered'>Registered</option>
          <option value='Composition'>Composition</option>
          <option value='Unregistered'>Unregistered</option>
        </select>
      </div>
      {(selectedOption === 'Registered' ||
        selectedOption === 'Composition') && (
        <div className='tax_ledger_inputs'>
          <div className='gstIn_input'>
            <label htmlFor='gstIn' className='label_name label_name_css'>
              GSTIN
            </label>
            <input
              type='text'
              id='gstIn'
              name='gstIn'
              onChange={formik.handleChange}
              value={formik.values.gstIn}
            />
          </div>
          <div className='gstIn_input'>
            <label
              htmlFor='registrationDate'
              className='label_name label_name_css'
            >
              Reg. Date
            </label>
            <input
              type='text'
              id='registrationDate'
              name='registrationDate'
              onChange={formik.handleChange}
              value={formik.values.registrationDate}
            />
          </div>
        </div>
      )}
      <div className='tax_ledger_inputs small_tax_ledger_inputs'>
        <label htmlFor='tdsApplicable' className='label_name label_name_css'>
          TDS Applicable
        </label>
        <select
          id='tdsApplicable'
          name='tdsApplicable'
          value={selectedTdsOption}
          onChange={handleInputChange}
          onBlur={formik.handleBlur}
        >
          <option value='Select'>Select an Option</option>
          <option value='Yes'>Yes</option>
          <option value='No'>No</option>
        </select>
      </div>
      {selectedTdsOption === 'Yes' && (
        <div className='tax_ledger_inputs small_tax_ledger_inputs'>
          <label htmlFor='payeeCategory' className='label_name label_name_css'>
            Payee Category
          </label>
          <select
            id='payeeCategory'
            name='payeeCategory'
            value={selectedPayeeCategoryOption}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
          >
            <option value='Select'>Select an Option</option>
            <option value='Individual'>Individual</option>
            <option value='Hindu Undivided Family (HUF)'>
              Hindu Undivided Family (HUF)
            </option>
            <option value='Firms'>Firms</option>
            <option value='Associations of Person (AOP)'>
              Associations of Person (AOP)
            </option>
            <option value='Associations of Person (AOP Trust)'>
              Associations of Person (AOP Trust)
            </option>
            <option value='Co-operative'>Co-operative</option>
            <option value='Company Public Interested'>
              Company Public Interested
            </option>
            <option value='Company Non-Public Interested'>
              Company Non-Public Interested
            </option>
            <option value='Company Privated'>Company Privated</option>
            <option value='Local Authority'>Local Authority</option>
          </select>
        </div>
      )}
      <div className='gstIn_input'>
        <label htmlFor='panCard' className='label_name label_name_css'>
          Pan No.
        </label>
        <input
          type='text'
          id='panCard'
          name='panCard'
          onChange={formik.handleChange}
          value={formik.values.panCard}
        />
      </div>
    </div>
  );
};
