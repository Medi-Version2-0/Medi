import { useFormik } from 'formik';
import React, { useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import * as Yup from 'yup';
import { Tooltip as ReactTooltip } from 'react-tooltip';

interface TaxDetailsProps {
  data?: any;
  onValueChange?: any;
  ref?: any;
  onSubmit?: any;
}

export const TaxDetails: React.FC<TaxDetailsProps> = ({ onValueChange }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedTdsOption, setSelectedTdsOption] = useState('');
  const [selectedPayeeCategoryOption, setSlectedPayeeCategoryOption] =
    useState('');

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  // const validateCheckDigit = (gst?: string): boolean => {
  //   if (!gst) {
  //     return false;
  //   } 
  //   const factors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  //   let total = 0;
  //   for (let i = 0; i < 14; i++) {
  //     const char = gst[i];
  //     let charValue: number;
  //     if (!char) {
  //       return false;
  //     }
  //     if (char.match(/[0-9]/)) {
  //       charValue = parseInt(char, 10);
  //     } else {
  //       charValue = char.charCodeAt(0) - 55;
  //     }
  //     total += charValue * factors[i];
  //   }
  //   const checkDigit = total % 36;
  //   const expectedCheckDigit =
  //     checkDigit < 10
  //       ? checkDigit.toString()
  //       : String.fromCharCode(checkDigit + 55);
  //   return gst[14] === expectedCheckDigit;
  // };

  const validationSchema = Yup.object({
    // partyName: Yup.string()
    //   .max(100, 'Party Name must be 50 characters or less')
    //   .required('Party Name is required'),
    gstIn: Yup.string()
      .required('GST number is required')
      .max(15, 'Not a valid GSTIN, Required 15 character')
      .matches(gstRegex, 'GST number is not valid')
      // .test(
      //   'check-digit',
      //   'GST number check digit is invalid',
      //   validateCheckDigit
      // )
      .required('GST number is required'),
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
      console.log('Tax Form data', values);
      onValueChange(values);
    },
  });

  const handleInputChange = (e: { target: { value: any; id: any } }) => {
    const value = e.target.value;
    const id = e.target.id;
    if (id === 'ledgerType') {
      setSelectedOption(value);
    } else if (id === 'tdsApplicable') {
      setSelectedTdsOption(value);
    } else if (id === 'payeeCategory') {
      setSlectedPayeeCategoryOption(value);
    }
    formik.setFieldValue(id, value);
  };

  return (
    <div className='tax_details_page'>
      <form onSubmit={formik.handleSubmit}>
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
              maxLength={15}
              onChange={formik.handleChange}
              value={formik.values.gstIn.toUpperCase()}
              onBlur={formik.handleBlur}
            />
            {formik.touched.gstIn && formik.errors.gstIn && (
              <>
                <FaExclamationCircle
                  data-tooltip-id='gstInError'
                  className='error_icon'
                  style={{ left: '280px' }}
                />
                <ReactTooltip
                  id='gstInError'
                  place='bottom'
                  className='custom-tooltip'
                >
                  {formik.errors.gstIn}
                </ReactTooltip>
              </>
            )}
          </div>
          <div className='gstIn_input'>
            <label
              htmlFor='registrationDate'
              className='label_name label_name_css'
            >
              Reg. Date
            </label>
            <input
              type='date'
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
          maxLength={15}
          onChange={formik.handleChange}
          value={formik.values.panCard.toUpperCase()}
        />
      </div>
      </form>
    </div>
  );
};