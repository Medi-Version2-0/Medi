import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import Sidebar from '../sidebar/sidebar';
import './ledger_form.css';
import { GeneralInfo } from './general_info';
import { BalanceInfo } from './balance_info';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ContactsInfo } from './contacts_info';
import { BankDetails } from './bank_details';
import { ContactDetails } from './contact_details';
import { LicenceInfo } from './licence_info';
import { TaxDetails } from './tax_details';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const initialValue = {
  btn_1: false,
  btn_2: false,
  btn_3: false,
  btn_4: false,
};

export const Ledger = () => {
  const [valueFromGeneral, setValueFromGeneral] = useState('');
  const [showActiveElement, setShowActiveElement] = useState(initialValue);
  const [generalInfovalidationSchema, setGeneralInfovalidationSchema] =
    useState(Yup.object().shape({}));
  const [contactInfoValidationSchema, setContactInfoValidationSchema] =
    useState(Yup.object().shape({}));
  const [gstDataValidationSchema, setGstDataValidationSchema] = useState(
    Yup.object().shape({})
  );
  const [personalInfoValidationSchema, setPersonalInfoValidationSchema] =
    useState(Yup.object().shape({}));
  const [licenceInfoValidationSchema, setLicenceInfoValidationSchema] =
    useState(Yup.object().shape({}));
  const [bankDetailsValidationSchema, setBankDetailsValidationSchema] =
    useState(Yup.object().shape({}));

  const generalInfo = useFormik({
    initialValues: {
      partyName: '',
      accountGroup: '',
      account_code:'',
      station_id:'',
      stationName: '',
      mailTo: '',
      address: '',
      country: '',
      state: '',
      city: '',
      pinCode: '',
      parentLedger: '',
      taxType: '',
      fixedAssets: '',
      hsnCode: '',
      taxPercentageType: '',
      itcAvail: '',
      itcAvail2: '',
    },
    validationSchema: generalInfovalidationSchema,
    onSubmit: (values) => {
      console.log('Form data', values);
    },
  });

  const balanceInfo = useFormik({
    initialValues: {
      party_id:'',
      balancingMethod: '',
      openingBal: '',
      openingBalType: '',
      creditDays: '',
    },
    onSubmit: (values) => {
      console.log('balance info ', values);
    },
  });

  const contactsInfo = useFormik({
    initialValues: {
      phone1: '',
      phone2: '',
      phone3: '',
    },
    validationSchema: contactInfoValidationSchema,
    onSubmit: (values) => {
      console.log('contact info data', values);
    },
  });

  const gstData = useFormik({
    initialValues: {
      ledgerType: '',
      gstIn: '',
      registrationDate: '',
      tdsApplicable: '',
      payeeCategory: '',
      panCard: '',
    },
    validationSchema: gstDataValidationSchema,
    onSubmit: (values) => {
      console.log('gstData data', values);
    },
  });

  const personalInfo = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      designation: '',
      website_input: '',
      emailId1: '',
      emailId2: '',
      gender:'',
      maritalStatus:'',
    },
    validationSchema: personalInfoValidationSchema,
    onSubmit: (values) => {
      console.log('personalInfo data', values);
    },
  });

  const licenceInfo = useFormik({
    initialValues: {
      drugLicenceNo: '',
      expiryDate: '',
    },
    validationSchema: licenceInfoValidationSchema,
    onSubmit: (values) => {
      console.log('licenceInfo data', values);
    },
  });

  const bankDetails = useFormik({
    initialValues: {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      accountType: '',
      branchName: '',
    },
    validationSchema: bankDetailsValidationSchema,
    onSubmit: (values) => {
      console.log('bankDetails data', values);
    },
  });

  const electronAPI = (window as any).electronAPI;

  const receiveValidationSchemaGeneralInfo = useCallback((schema: any) => {
    setGeneralInfovalidationSchema(schema);
  }, []);
  const receiveValidationSchemaContactInfo = useCallback((schema: any) => {
    setContactInfoValidationSchema(schema);
  }, []);
  const receiveValidationSchemaGstData = useCallback((schema: any) => {
    setGstDataValidationSchema(schema);
  }, []);
  const receiveValidationSchemaPersonalInfo = useCallback((schema: any) => {
    setPersonalInfoValidationSchema(schema);
  }, []);
  const receiveValidationSchemaLicenceInfo = useCallback((schema: any) => {
    setLicenceInfoValidationSchema(schema);
  }, []);
  const receiveValidationSchemaBankDetails = useCallback((schema: any) => {
    setBankDetailsValidationSchema(schema);
  }, []);

  const handleValueChange = (value: any) => {
    setValueFromGeneral(value);
  };

  const prevClass = useRef('');

  const handleClick = (clickedClass: any) => {
    setShowActiveElement({ ...initialValue, [prevClass.current]: false });

    const currentActiveBtns = document.getElementsByClassName('active');
    if (currentActiveBtns.length > 0) {
      currentActiveBtns[0].classList.remove('active');
    }
    const clickedElements = document.getElementsByClassName(clickedClass);
    if (clickedElements.length > 0) {
      clickedElements[0].classList.add('active');
    }
    setShowActiveElement({ ...initialValue, [clickedClass]: true });
    prevClass.current = clickedClass;
  };

  const handleSubmit = () => {
    generalInfo.handleSubmit();
    balanceInfo.handleSubmit();
    contactsInfo.handleSubmit();
    gstData.handleSubmit();
    personalInfo.handleSubmit();
    licenceInfo.handleSubmit();
    bankDetails.handleSubmit();

    const allData = {
      general_info: generalInfo.values,
      balance_contact_info: {
        balance_info: balanceInfo.values,
        contacts_info: contactsInfo.values,
      },
      tax_personal_details: {
        gst_data: gstData.values,
        personal_info: personalInfo.values,
        licence_info: licenceInfo.values,
        bank_details: bankDetails.values,
      },
    };
    console.log('all data, ', allData);
    electronAPI.addParty(allData);
  };

  return (
    <>
      <div className='ledger_content'>
        <div className='ledger_sidebar'>
          <Sidebar isGroup={true} isSubGroup={false} />
        </div>
        <div className='ledger_container'>
          <div id='ledger_main'>
            <h1 id='ledger_header'>Create Party</h1>
            <button id='ledger_button' className='ledger_button'>
              Back
            </button>
          </div>

          <div className='middle_form'>
            <GeneralInfo
              onValueChange={handleValueChange}
              formik={generalInfo}
              receiveValidationSchemaGeneralInfo={
                receiveValidationSchemaGeneralInfo
              }
            />
            <div className='ledger_general_details'>
              <BalanceInfo
                accountInputValue={valueFromGeneral}
                formik={balanceInfo}
              />
              <ContactsInfo
                accountInputValue={valueFromGeneral}
                formik={contactsInfo}
                receiveValidationSchemaContactInfo={
                  receiveValidationSchemaContactInfo
                }
              />
            </div>
          </div>

          {(valueFromGeneral === 'SUNDRY CREDITORS' ||
            valueFromGeneral === 'SUNDRY DEBTORS') && (
            <div className='middle_form_2'>
              <div className='middle_form_2_buttons'>
                <div className='buttons'>
                  <button
                    className='btn btn_1 active'
                    onClick={() => handleClick('btn_1')}
                  >
                    GST/Tax Details
                  </button>
                </div>
                <div className='buttons'>
                  <button
                    className='btn btn_2'
                    onClick={() => handleClick('btn_2')}
                  >
                    Licence Info
                  </button>
                </div>
                <div className='buttons'>
                  <button
                    className='btn btn_3'
                    onClick={() => handleClick('btn_3')}
                  >
                    Contact Info
                  </button>
                </div>
                <div className='buttons'>
                  <button
                    className='btn btn_4'
                    onClick={() => handleClick('btn_4')}
                  >
                    Bank Details
                  </button>
                </div>
              </div>
              <div className='middle_form_2_content'>
                {showActiveElement.btn_1 && (
                  <TaxDetails
                    formik={gstData}
                    receiveValidationSchemaGstData={
                      receiveValidationSchemaGstData
                    }
                  />
                )}
                {showActiveElement.btn_3 && (
                  <ContactDetails
                    formik={personalInfo}
                    receiveValidationSchemaPersonalInfo={
                      receiveValidationSchemaPersonalInfo
                    }
                  />
                )}
                {showActiveElement.btn_2 && (
                  <LicenceInfo
                    formik={licenceInfo}
                    receiveValidationSchemaLicenceInfo={
                      receiveValidationSchemaLicenceInfo
                    }
                  />
                )}
                {showActiveElement.btn_4 && (
                  <BankDetails
                    formik={bankDetails}
                    receiveValidationSchemaBankDetails={
                      receiveValidationSchemaBankDetails
                    }
                  />
                )}
              </div>
            </div>
          )}
          <div className='submit_button'>
            <button type='button' onClick={handleSubmit}>
              Submit All
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
