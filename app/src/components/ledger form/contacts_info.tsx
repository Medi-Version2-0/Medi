import { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaExclamationCircle } from 'react-icons/fa';
interface ContactsInfoProps {
  accountInputValue?: string;
  formik?: any;
  receiveValidationSchemaContactInfo: (schema: Yup.ObjectSchema<any>) => void;
}

export const ContactsInfo: React.FC<ContactsInfoProps> = ({
  accountInputValue,
  formik,
  receiveValidationSchemaContactInfo,
}) => {
  const phoneRegex = /^[6-9][0-9]{9}$/;
  const validationSchema = useMemo(
    () =>
      Yup.object({
        phone1: Yup.string().matches(phoneRegex, 'Invalid phone number'),
        phone2:
          accountInputValue === 'SUNDRY CREDITORS' ||
          accountInputValue === 'SUNDRY DEBTORS'
            ? Yup.string()
                .matches(phoneRegex, 'Invalid phone number')
                .required('Phone number is required')
            : Yup.string(),
        phone3: Yup.string().matches(phoneRegex, 'Invalid phone number'),
      }),
    [accountInputValue]
  );

  useEffect(() => {
    receiveValidationSchemaContactInfo(validationSchema);
  }, [validationSchema, receiveValidationSchemaContactInfo]);

  return (
    <>
      {(accountInputValue === 'SUNDRY CREDITORS' ||
        accountInputValue === 'SUNDRY DEBTORS') && (
        <div className='ledger_contacts_info'>
          <div className='contacts_prefix'>Contact Numbers</div>
          <form onSubmit={formik.handleSubmit} className='contact_inputs'>
            <div className='contact_ledger_inputs'>
              <label
                htmlFor='phone1'
                className='contacts_label_name label_name_css'
              >
                Phone No.(Office)
              </label>
              <span className='mobile_prefix'>+91</span>
              <input
                type='tel'
                id='phone1'
                name='phone1'
                maxLength={10}
                className='contacts_input_class'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.phone1}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'ArrowDown' || e.key === 'Enter') {
                    document.getElementById('phone2')?.focus();
                    e.preventDefault();
                  } else if (e.key === 'ArrowUp') {
                    document.getElementById('creditDays')?.focus();
                    e.preventDefault();
                  }
                }}
              />
              {formik.touched.phone1 && formik.errors.phone1 && (
                <>
                  <FaExclamationCircle
                    data-tooltip-id='phone1Error'
                    className='error_icon'
                  />
                  <ReactTooltip
                    id='phone1Error'
                    place='bottom'
                    className='custom-tooltip'
                  >
                    {formik.errors.phone1}
                  </ReactTooltip>
                </>
              )}
            </div>
            <div className='contact_ledger_inputs starlabel'>
              <label
                htmlFor='phone2'
                className='contacts_label_name label_name_css'
              >
                Mobile 1
              </label>
              <span className='mobile_prefix'>+91</span>
              <input
                type='tel'
                id='phone2'
                name='phone2'
                maxLength={10}
                className='contacts_input_class'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.phone2}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'ArrowDown' || e.key === 'Enter') {
                    document.getElementById('phone3')?.focus();
                    e.preventDefault();
                  } else if (e.key === 'ArrowUp') {
                    document.getElementById('phone1')?.focus();
                    e.preventDefault();
                  }
                }}
              />
              {formik.touched.phone2 && formik.errors.phone2 && (
                <>
                  <FaExclamationCircle
                    data-tooltip-id='phone2Error'
                    className='error_icon'
                  />
                  <ReactTooltip
                    id='phone2Error'
                    place='bottom'
                    className='custom-tooltip'
                  >
                    {formik.errors.phone2}
                  </ReactTooltip>
                </>
              )}
            </div>
            <div className='contact_ledger_inputs'>
              <label
                htmlFor='phone3'
                className='contacts_label_name label_name_css'
              >
                Whatsapp no.
              </label>
              <span className='mobile_prefix'>+91</span>
              <input
                type='tel'
                id='phone3'
                name='phone3'
                maxLength={10}
                className='contacts_input_class'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.phone3}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'ArrowDown' || e.key === 'Enter') {
                    document
                      .getElementById(
                        accountInputValue === 'SUNDRY CREDITORS' ||
                          accountInputValue === 'SUNDRY DEBTORS'
                          ? 'GST/Tax Details'
                          : ''
                      )
                      ?.focus();
                    e.preventDefault();
                  } else if (e.key === 'ArrowUp') {
                    document.getElementById('phone2')?.focus();
                    e.preventDefault();
                  }
                }}
              />
              {formik.touched.phone3 && formik.errors.phone3 && (
                <>
                  <FaExclamationCircle
                    data-tooltip-id='phone3Error'
                    className='error_icon'
                  />
                  <ReactTooltip
                    id='phone3Error'
                    place='bottom'
                    className='custom-tooltip'
                  >
                    {formik.errors.phone3}
                  </ReactTooltip>
                </>
              )}
              <button className='add_contact_btn'>+</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
