import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export const LicenceInfo = () => {
  const [licenceInfo, setLicenceInfo] = useState([
    { drugLicenceNo: '', expiryDate: '' },
  ]);
  const [addCount, setAddCount] = useState(0);

  const validationSchema = Yup.object({
    partyName: Yup.string()
      .max(100, 'Party Name must be 50 characters or less')
      .required('Party Name is required'),
  });

  const formik = useFormik({
    initialValues: {
      partyName: '',
      licenceInfo: licenceInfo,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Form data', values);
    },
  });

  const handleChange = (index: any, event: any) => {
    const newLicenceInfo: any = [...licenceInfo];
    newLicenceInfo[index][event.target.name] = event.target.value;
    setLicenceInfo(newLicenceInfo);
    formik.setFieldValue('licenceInfo', newLicenceInfo);
  };

  const addNewLicenceField = () => {
  const lastLicenceInfo = licenceInfo[licenceInfo.length - 1];
  const isEmpty = Object.values(lastLicenceInfo).some(value => value === '');
  
  if (addCount < 2 && !isEmpty) {
    setLicenceInfo([...licenceInfo, { drugLicenceNo: '', expiryDate: '' }]);
    setAddCount(addCount + 1);
  }

  };

  return (
      <div className='tax_details_page'>
        {licenceInfo.map((lic, index) => (
          <div className='tax_ledger_inputs' key={`tax_ledger_inputs${index}`} >
            <div className='drugLic_input' key={index}>
              <label
                htmlFor={`drugLicenceNo_${index}`}
                className='label_name label_name_css'
              >
                Drug Lic. No.
              </label>
              <input
                type='text'
                id={`drugLicenceNo_${index}`}
                name='drugLicenceNo'
                onChange={(e) => handleChange(index, e)}
                value={lic.drugLicenceNo.toUpperCase()}
              />
              <label
                htmlFor={`expiryDate_${index}`}
                className='label_name label_name_css expiry_date_space'
              >
                Reg. Date
              </label>
              <input
                type='date'
                id={`expiryDate_${index}`}
                name='expiryDate'
                onChange={(e) => handleChange(index, e)}
                value={lic.expiryDate}
              />
            </div>

            {index === licenceInfo.length - 1 && addCount < 2 && (
              <div className='add_drug_inputs'>
                <button
                  type='button'
                  className='drug_add_button'
                  onClick={addNewLicenceField}
                >
                  +
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
  );
};