import React, { useEffect, useMemo } from 'react';
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

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const validationSchema = useMemo(
    () =>
      Yup.object({
        gstIn: Yup.string()
          .required('GST number is required')
          .max(15, 'Not a valid GSTIN, Required 15 character')
          .matches(gstRegex, 'GST number is not valid')
          .required('GST number is required')
      }),
    []
  );

  useEffect(() => {
    receiveValidationSchemaGstData(validationSchema);
  }, [validationSchema, receiveValidationSchemaGstData]);

  return (
    <div className='tax_details_page'>
      <form onSubmit={formik.handleSubmit}>          
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
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'ArrowDown' || e.key === 'Enter') {
                    document.getElementById('registrationDate')?.focus();
                    e.preventDefault();
                  } else if (e.key === 'ArrowUp') {
                    document.getElementById('ledgerType')?.focus();
                    e.preventDefault();
                  }
                }}
              />
              {formik.touched.gstIn && formik.errors.gstIn && (
                <>
                  <FaExclamationCircle
                    data-tooltip-id='gstInError'
                    className='error_icon'
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
          </div>
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
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('Licence_Info')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document
                  .getElementById('gstIn')
                  ?.focus();
                e.preventDefault();
              }
            }}
          />
        </div>
      </form>
    </div>
  );
};
