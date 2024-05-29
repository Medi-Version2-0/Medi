import React, { useEffect, useMemo } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import * as Yup from 'yup';

interface personalInfoProps {
  formik?: any;
  receiveValidationSchemaPersonalInfo: (schema: Yup.ObjectSchema<any>) => void;
}

export const ContactDetails: React.FC<personalInfoProps> = ({
  formik,
  receiveValidationSchemaPersonalInfo,
}) => {
  const validationSchema = useMemo(
    () =>
      Yup.object({
        emailId1: Yup.string().email('Invalid email'),
        emailId2: Yup.string().email('Invalid email'),
        website_input: Yup.string().matches(
          /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
          'Enter correct url!'
        ),
      }),
    []
  );

  useEffect(() => {
    receiveValidationSchemaPersonalInfo(validationSchema);
  }, [validationSchema, receiveValidationSchemaPersonalInfo]);

  return (
    <div className='tax_details_page'>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>
          <label htmlFor='firstName' className='label_name label_name_css'>
            First Name
          </label>
          <input
            type='text'
            id='firstName'
            name='firstName'
            onChange={formik.handleChange}
            value={formik.values.firstName}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('lastName')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('Contact_Info')?.focus();
              }
            }}
          />
        </div>
        <div className='name_input'>
          <label htmlFor='lastName' className='label_name label_name_css'>
            Last Name
          </label>
          <input
            type='text'
            id='lastName'
            name='lastName'
            onChange={formik.handleChange}
            value={formik.values.lastName}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('gender')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('firstName')?.focus();
              }
            }}
          />
        </div>
      </div>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>
          <label htmlFor='gender' className='label_name label_name_css'>
            Gender
          </label>
          <select
            id='gender'
            name='gender'
            value={formik.values.gender}
            onChange={(e) => {
              formik.handleChange(e);
            }}
            onBlur={formik.handleBlur}
            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('maritalStatus')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('lastName')?.focus();
                e.preventDefault();
              }
            }}
          >
            <option value='Select'>Select an Option</option>
            <option value='Male'>Male</option>
            <option value='Female'>Female</option>
            <option value='Transgender'>Transgender</option>
          </select>
        </div>
        <div className='name_input'>
          <label htmlFor='maritalStatus' className='label_name label_name_css'>
            Marital Status
          </label>
          <select
            id='maritalStatus'
            name='maritalStatus'
            value={formik.values.maritalStatus}
            onChange={(e) => {
              formik.handleChange(e);
            }}
            onBlur={formik.handleBlur}
            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('designation')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('gender')?.focus();
                e.preventDefault();
              }
            }}
          >
            <option value='Select'>Select an Option</option>
            <option value='Married'>Married</option>
            <option value='Unmarried'>Unmarried</option>
            <option value='Divorcee'>Divorcee</option>
            <option value='Widower'>Widower</option>
          </select>
        </div>
      </div>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>
          <label htmlFor='designation' className='label_name label_name_css'>
            Designation
          </label>
          <input
            type='text'
            id='designation'
            name='designation'
            placeholder='Manager'
            onChange={formik.handleChange}
            value={formik.values.designation}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('website_input')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('maritalStatus')?.focus();
              }
            }}
          />
        </div>
        <div className='name_input'>
          <label htmlFor='website_input' className='label_name label_name_css'>
            Website
          </label>
          <input
            type='text'
            id='website_input'
            name='website_input'
            placeholder='www.example.com'
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.website_input}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('emailId1')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('designation')?.focus();
              }
            }}
          />
          {formik.touched.website_input && formik.errors.website_input && (
            <>
              <FaExclamationCircle
                data-tooltip-id='website_inputError'
                className='error_icon'
              />
              <ReactTooltip
                id='website_inputError'
                place='bottom'
                className='custom-tooltip'
              >
                {formik.errors.website_input}
              </ReactTooltip>
            </>
          )}
        </div>
      </div>
      <div className='tax_ledger_inputs'>
        <div className='name_input'>
          <label htmlFor='emailId1' className='label_name label_name_css'>
            Email ID
          </label>
          <input
            type='text'
            id='emailId1'
            name='emailId1'
            placeholder='abc@example.com'
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.emailId1}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('emailId2')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('website_input')?.focus();
              }
            }}
          />
          {formik.touched.emailId1 && formik.errors.emailId1 && (
            <>
              <FaExclamationCircle
                data-tooltip-id='emailId1Error'
                className='error_icon'
              />
              <ReactTooltip
                id='emailId1Error'
                place='bottom'
                className='custom-tooltip'
              >
                {formik.errors.emailId1}
              </ReactTooltip>
            </>
          )}
        </div>
        <div className='name_input'>
          <label htmlFor='emailId2' className='label_name label_name_css'>
            Email ID 2
          </label>
          <input
            type='text'
            id='emailId2'
            name='emailId2'
            placeholder='abc@example.com'
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.emailId2}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('Bank_Details')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('emailId1')?.focus();
              }
            }}
          />
          {formik.touched.emailId2 && formik.errors.emailId2 && (
            <>
              <FaExclamationCircle
                data-tooltip-id='emailId2Error'
                className='error_icon'
              />
              <ReactTooltip
                id='emailId2Error'
                place='bottom'
                className='custom-tooltip'
              >
                {formik.errors.emailId2}
              </ReactTooltip>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
