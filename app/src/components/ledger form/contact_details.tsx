import { useFormik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

export const ContactDetails = () => {
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedMaritalStatusOption, setSelectedMaritalStatusOption] = useState('');
  const validationSchema = Yup.object({
    partyName: Yup.string()
      .max(100, 'Party Name must be 50 characters or less')
      .required('Party Name is required'),
  });

  const formik = useFormik({
    initialValues: {
        firstName: '',
        lastName: '',
        designation:'',
        website_input:'',
        emailId1:'',
        emailId2:'',
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
      if (e.target.id === 'gender') {
        setSelectedGender(e.target.value);
      }   else if (e.target.id === 'maritalStatus') {
        setSelectedMaritalStatusOption(e.target.value);
      } 
    };

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
            value={selectedGender}
          onChange={handleInputChange}
          onBlur={formik.handleBlur}
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
            value={selectedMaritalStatusOption}
          onChange={handleInputChange}
          onBlur={formik.handleBlur}
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
            value={formik.values.website_input}
          />
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
            onChange={formik.handleChange}
            value={formik.values.emailId1}
          />
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
            onChange={formik.handleChange}
            value={formik.values.emailId2}
          />
        </div>
      </div>
    </div>
  );
};