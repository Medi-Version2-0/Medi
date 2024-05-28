import React, { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaExclamationCircle } from 'react-icons/fa';

interface TaxInfoProps {
  formik?: any;
  receiveValidationSchemaGstData: (schema: Yup.ObjectSchema<any>) => void;
}

export const TaxDetails: React.FC<TaxInfoProps> = ({
  formik,
  receiveValidationSchemaGstData,
}) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedTdsOption, setSelectedTdsOption] = useState('');

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const validationSchema = useMemo(
    () =>
      Yup.object({
        gstIn: Yup.string()
          .required('GST number is required')
          .max(15, 'Not a valid GSTIN, Required 15 character')
          .matches(gstRegex, 'GST number is not valid')
          .required('GST number is required'),
      }),
    []
  );

  useEffect(() => {
    receiveValidationSchemaGstData(validationSchema);
  }, [validationSchema, receiveValidationSchemaGstData]);

  const handleInputChange = (e: { target: { value: any; id: any } }) => {
    const value = e.target.value;
    const id = e.target.id;
    if (id === 'ledgerType') {
      setSelectedOption(value);
    } else if (id === 'tdsApplicable') {
      setSelectedTdsOption(value);
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
            value={formik.values.ledgerType}
            onChange={(e) => {
              formik.handleChange(e);
              handleInputChange(e);
            }}
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
                  style={{ right: '150px' }}
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
            value={formik.values.tdsApplicable}
            onChange={(e) => {
              formik.handleChange(e);
              handleInputChange(e);
            }}
            onBlur={formik.handleBlur}
          >
            <option value='Select'>Select an Option</option>
            <option value='Yes'>Yes</option>
            <option value='No'>No</option>
          </select>
        </div>
        {selectedTdsOption === 'Yes' && (
          <div className='tax_ledger_inputs small_tax_ledger_inputs'>
            <label
              htmlFor='payeeCategory'
              className='label_name label_name_css'
            >
              Payee Category
            </label>
            <select
              id='payeeCategory'
              name='payeeCategory'
              value={formik.values.payeeCategory}
              onChange={(e) => {
                formik.handleChange(e);
                handleInputChange(e);
              }}
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