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
        phoneNumber:
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
      {(accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
        accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS') && (
        <div className='ledger_contacts_info'>
          <div className='contacts_prefix'>Contact Numbers</div>
          <form onSubmit={formik.handleSubmit} className='contact_inputs'>
            <div className='contact_ledger_inputs starlabel'>
              <label
                htmlFor='phoneNumber'
                className='contacts_label_name label_name_css'
              >
                Mobile 1
              </label>
              <span className='mobile_prefix'>+91</span>
              <input
                type='tel'
                // id='phoneNumber'
                id='phoneNumber'
                name='phoneNumber'
                maxLength={10}
                className='contacts_input_class'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.phoneNumber}
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
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <>
                  <FaExclamationCircle
                    data-tooltip-id='phoneNumberError'
                    className='error_icon'
                  />
                  <ReactTooltip
                    id='phoneNumberError'
                    place='bottom'
                    className='custom-tooltip'
                  >
                    {formik.errors.phoneNumber}
                  </ReactTooltip>
                </>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
};
