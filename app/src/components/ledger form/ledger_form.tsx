import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
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
import { useLocation, useNavigate } from 'react-router-dom';
import Confirm_Alert_Popup from '../helpers/Confirm_Alert_Popup';

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
  const [bankDetailsValidationSchema, setBankDetailsValidationSchema] =
    useState(Yup.object().shape({}));
  const [hasErrors, setHasErrors] = useState(true);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    return navigate('/ledger_table');
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};

  const generalInfo = useFormik({
    initialValues: {
      partyName: data?.partyName ||'',
      accountGroup: data?.accountGroup ||'',
      account_code: data?.account_code ||'',
      isPredefinedParty: data?.isPredefinedParty ||true,
      station_id: data?.station_id ||'',
      stationName: data?.stationName ||'',
      mailTo: data?.mailTo ||'',
      address1: data?.address1 ||'',
      address2: data?.address2 ||'',
      address3: data?.address3 ||'',
      country: data?.country ||'',
      state: data?.state ||'',
      city: data?.city ||'',
      pinCode: data?.pinCode ||'',
      stateInout: data?.stateInout ||'',
      transport: data?.transport || '',
      creditPrivilege: data?.creditPrivilege || '',
      vatNumber: data?.vatNumber || '',
      excessRate: data?.excessRate || '',
      routeNo: data?.routeNo || '',
      party_cash_credit_invoice: data?.party_cash_credit_invoice || '',
      deductDiscount: data?.deductDiscount || '',
      stopNrx: data?.stopNrx || '',
      stopHi: data?.stopHi || '',
      notPrinpba: data?.notPrinpba || ''
    },
    validationSchema: generalInfovalidationSchema,
    onSubmit: (values) => {
      console.log('Form data', values);
    },
  });

  const balanceInfo = useFormik({
    initialValues: {
      openingBal:  data?.openingBal ||'',
      openingBalType:  data?.openingBalType ||'',
      creditDays:  data?.creditDays ||'',
      creditLimit: data?.creditLimit || ''
    },
    onSubmit: (values) => {
      console.log('balance info ', values);
    },
  });

  const contactsInfo = useFormik({
    initialValues: {
      phoneNumber:  data?.phoneNumber ||'',
    },
    validationSchema: contactInfoValidationSchema,
    onSubmit: (values) => {
      console.log('contact info data', values);
    },
  });

  const gstData = useFormik({
    initialValues: {
      gstIn:  data?.gstIn ||'',
      panCard:  data?.panCard ||'',
    },
    validationSchema: gstDataValidationSchema,
    onSubmit: (values) => {
      console.log('gstData data', values);
    },
  });

  const personalInfo = useFormik({
    initialValues: {
      firstName:  data?.firstName ||'',
      lastName:  data?.lastName ||'',
      emailId1:  data?.emailId1 ||'',
      emailId2:  data?.emailId2 ||'',
    },
    validationSchema: personalInfoValidationSchema,
    onSubmit: (values) => {
      console.log('personalInfo data', values);
    },
  });

  const licenceInfo = useFormik({
    initialValues: {
      drugLicenceNo1:  data?.drugLicenceNo1 ||'',
      // drugLicenceNo2: data?.drugLicenceNo2 ||'',
    },
    onSubmit: (values) => {
      console.log('licenceInfo data', values);
    },
  });

  const bankDetails = useFormik({
    initialValues: {
      accountHolderName:  data?.accountHolderName ||'',
      accountNumber:  data?.accountNumber ||'',
      bankName:  data?.bankName ||'',
      ifscCode:  data?.ifscCode ||'',
      accountType:  data?.accountType ||'',
      branchName:  data?.branchName ||'',
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
  const receiveValidationSchemaBankDetails = useCallback((schema: any) => {
    setBankDetailsValidationSchema(schema);
  }, []);

  const handleValueChange = (value: any) => {
    setValueFromGeneral(value);
    setGstDataValidationSchema(Yup.object().shape({}));
    setContactInfoValidationSchema(Yup.object().shape({}));
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
      ...generalInfo.values,
        ...balanceInfo.values,
        ...contactsInfo.values,
      ...gstData.values,...personalInfo.values,
        ...licenceInfo.values,
        ...bankDetails.values,
    };
    console.log(">>>>>all Data : ",allData);

    if(data.party_id){
      electronAPI.updateParty(data.party_id, allData);
    }
    else{
      electronAPI.addParty(allData);  
    }
  };

  useEffect(() => {
    const checkErrors = async () => {
      const generalInfoErrors = await generalInfo.validateForm();
      const balanceInfoErrors = await balanceInfo.validateForm();
      const contactsInfoErrors = await contactsInfo.validateForm();
      const gstDataErrors = await gstData.validateForm();
      const personalInfoErrors = await personalInfo.validateForm();
      const licenceInfoErrors = await licenceInfo.validateForm();
      const bankDetailsErrors = await bankDetails.validateForm();

      const allErrors = {
        ...generalInfoErrors,
        ...balanceInfoErrors,
        ...contactsInfoErrors,
        ...gstDataErrors,
        ...personalInfoErrors,
        ...licenceInfoErrors,
        ...bankDetailsErrors,
      };

      setHasErrors(Object.keys(allErrors).length > 0);
    };

    checkErrors();
  }, [
    generalInfo.values,
    generalInfo.isValid,
    balanceInfo.values,
    contactsInfo.values,
    contactsInfo.isValid,
    gstData.values,
    gstData.isValid,
    personalInfo.values,
    licenceInfo.values,
    bankDetails.values,
  ]);

  return (
    <>
        <div className='ledger_container'>
          <div id='ledger_main'>
            <h1 id='ledger_header'>{ !!data.party_id ? "Update Party" : "Create Party"}</h1>
            <button
              id='ledger_button'
              className='ledger_button'
              onClick={() => {
                return navigate(`/ledger_table`);
              }}
            >
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
                    id='GST/Tax Details'
                    onClick={() => handleClick('btn_1')}
                    onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                      if (e.key === 'ArrowDown' || e.key === 'Enter') {
                        handleClick('btn_1');
                        document.getElementById('ledgerType')?.focus();
                        e.preventDefault();
                      } else if (e.key === 'ArrowRight') {
                        document.getElementById('Licence_Info')?.focus();
                        e.preventDefault();
                      }
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        document.getElementById('phone3')?.focus();
                        e.preventDefault();
                      }
                    }}
                  >
                    GST/Tax Details
                  </button>
                </div>
                <div className='buttons'>
                  <button
                    className='btn btn_2'
                    id='Licence_Info'
                    onClick={() => handleClick('btn_2')}
                    onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                      if (e.key === 'ArrowDown' || e.key === 'Enter') {
                        handleClick('btn_2');
                        document.getElementById('drugLicenceNo1')?.focus();
                        e.preventDefault();
                      } else if (e.key === 'ArrowRight') {
                        document.getElementById('Contact_Info')?.focus();
                        e.preventDefault();
                      }
                      if (e.key === 'ArrowLeft') {
                        document.getElementById('GST/Tax Details')?.focus();
                        e.preventDefault();
                      }
                    }}
                  >
                    Licence Info
                  </button>
                </div>
                <div className='buttons'>
                  <button
                    className='btn btn_3'
                    id='Contact_Info'
                    onClick={() => handleClick('btn_3')}
                    onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                      if (e.key === 'ArrowDown' || e.key === 'Enter') {
                        handleClick('btn_3');
                        document.getElementById('firstName')?.focus();
                        e.preventDefault();
                      } else if (e.key === 'ArrowRight') {
                        document.getElementById('Bank_Details')?.focus();
                        e.preventDefault();
                      }
                      if (e.key === 'ArrowLeft') {
                        document.getElementById('Licence_Info')?.focus();
                        e.preventDefault();
                      }
                    }}
                  >
                    Contact Info
                  </button>
                </div>
                <div className='buttons'>
                  <button
                    className='btn btn_4'
                    id='Bank_Details'
                    onClick={() => handleClick('btn_4')}
                    onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                      if (e.key === 'ArrowDown' || e.key === 'Enter') {
                        handleClick('btn_4');
                        document.getElementById('bankName')?.focus();
                        e.preventDefault();
                      } else if (e.key === 'ArrowLeft') {
                        document.getElementById('Contact_Info')?.focus();
                        e.preventDefault();
                      }
                    }}
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
                  <LicenceInfo formik={licenceInfo} />
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
          <div>
            <button
              type='button'
              id='submit_all'
              onClick={() => {
                handleSubmit();
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: 'Ledger created successfully',
                });
              }}
              className='submit_button'
              disabled={hasErrors}
              onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                if (e.key === 'ArrowUp') {
                  document
                    .getElementById(
                      valueFromGeneral.toUpperCase() === 'SUNDRY CREDITORS' ||
                        valueFromGeneral.toUpperCase() === 'SUNDRY DEBTORS'
                        ? 'accountHolderName'
                        : 'openingBalType'
                    )
                    ?.focus();
                  e.preventDefault();
                }
              }}
            >
              {!!data.party_id ? "Update" : "Submit"}
            </button>
          </div>
          {(popupState.isModalOpen || popupState.isAlertOpen) && (
            <Confirm_Alert_Popup
              onClose={handleClosePopup}
              onConfirm={handleAlertCloseModal}
              message={popupState.message}
              isAlert={popupState.isAlertOpen}
            />
          )}
        </div>
    </>
  );
};
