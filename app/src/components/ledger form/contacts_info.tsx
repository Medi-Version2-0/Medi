import { useFormik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

interface ContactsInfoProps {
  accountInputValue?: string;
}

export const ContactsInfo: React.FC<ContactsInfoProps> = ({
  accountInputValue,
}) => {
  const validationSchema = Yup.object({
    partyName: Yup.string()
      .max(100, 'Party Name must be 50 characters or less')
      .required('Party Name is required'),
  });

  const formik = useFormik({
    initialValues: {
      phone1: '',
      phone2: '',
      phone3: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Form data', values);
    },
  });

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
                pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}'
                className='contacts_input_class'
                onChange={formik.handleChange}
                value={formik.values.phone1}
              />
            </div>
            <div className='contact_ledger_inputs'>
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
                className='contacts_input_class'
                onChange={formik.handleChange}
                value={formik.values.phone2}
              />
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
                className='contacts_input_class'
                onChange={formik.handleChange}
                value={formik.values.phone3}
              />
              <button className='add_contact_btn'>+</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
