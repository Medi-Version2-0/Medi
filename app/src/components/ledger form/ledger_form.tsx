import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import './ledger_form.css';
import { GeneralInfo } from './general_info';
import { BalanceInfo } from './balance_info';
import { useEffect, useRef, useState } from 'react';
import { ContactsInfo } from './contacts_info';
import { BankDetails } from './bank_details';
import { ContactDetails } from './contact_details';
import { LicenceInfo } from './licence_info';
import { TaxDetails } from './tax_details';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLocation, useNavigate } from 'react-router-dom';
import Confirm_Alert_Popup from '../popup/Confirm_Alert_Popup';
import Button from '../common/button/Button';

const initialValue = {
  btn_1: false,
  btn_2: false,
  btn_3: false,
  btn_4: false,
};

export const Ledger = () => {
  const [valueFromGeneral, setValueFromGeneral] = useState('');
  const [showActiveElement, setShowActiveElement] = useState(initialValue);
  // const [hasErrors, setHasErrors] = useState(true);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const isSUNDRY = (valueFromGeneral === 'SUNDRY CREDITORS' || valueFromGeneral === 'SUNDRY DEBTORS');
  const phoneRegex = /^[6-9][0-9]{9}$/;
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

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

  useEffect(() => {
    ledgerFormInfo.validateForm();
  }, [valueFromGeneral]);

  const ledgerFormValidationSchema = Yup.object({
    // general info VS
    partyName: Yup.string()
      .max(100, 'Party Name must be 100 characters or less')
      .required('Party Name is required'),
    accountGroup: Yup.string().required('Account group is required'),
    country: isSUNDRY
      ? Yup.string().required('Country is required')
      : Yup.string(),
    state: isSUNDRY
      ? Yup.string().required('State is required')
      : Yup.string(),
    stationName: isSUNDRY
      ? Yup.string().required('Station is required')
      : Yup.string(),
    mailTo: Yup.string().email('Invalid email'),
    pinCode: isSUNDRY
      ? Yup.string()
        .matches(/^[0-9]+$/, 'PIN code must be a number')
        .matches(/^[1-9]/, 'PIN code must not start with zero')
        .matches(/^[0-9]{6}$/, 'PIN code must be exactly 6 digits')
      : Yup.string(),

    // contacts info VS
    phoneNumber: isSUNDRY
      ? Yup.string()
        .matches(phoneRegex, 'Invalid phone number')
        .required('Phone number is required')
      : Yup.string(),

    // gst data VS
    gstIn: isSUNDRY
      ? Yup.string()
        .required('GST number is required')
        .max(15, 'Not a valid GSTIN, Required 15 character')
        .matches(gstRegex, 'GST number is not valid')
        .required('GST number is required')
      : Yup.string(),

    // personal info VS
    emailId1: Yup.string().email('Invalid email'),
    emailId2: Yup.string().email('Invalid email'),
    website_input: Yup.string().matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      'Enter correct url!'
    ),

    // bank details VS
    accountHolderName: Yup.string().max(
      100,
      'Account Holder Name must be 50 characters or less'
    ),
  });

  const ledgerFormInfo = useFormik({
    initialValues: {
      // general info
      partyName: data?.partyName || '',
      accountGroup: data?.accountGroup || '',
      account_code: data?.account_code || '',
      isPredefinedParty: data?.isPredefinedParty || true,
      station_id: data?.station_id || '',
      stationName: data?.stationName || '',
      mailTo: data?.mailTo || '',
      address1: data?.address1 || '',
      address2: data?.address2 || '',
      address3: data?.address3 || '',
      country: data?.country || '',
      state: data?.state || '',
      city: data?.city || '',
      pinCode: data?.pinCode || '',
      stateInout: data?.stateInout || '',
      transport: data?.transport || '',
      creditPrivilege: data?.creditPrivilege || '',
      vatNumber: data?.vatNumber || '',
      excessRate: data?.excessRate || '',
      routeNo: data?.routeNo || '',
      party_cash_credit_invoice: data?.party_cash_credit_invoice || '',
      deductDiscount: data?.deductDiscount || '',
      stopNrx: data?.stopNrx || '',
      stopHi: data?.stopHi || '',
      notPrinpba: data?.notPrinpba || '',

      // balance info
      openingBal: data?.openingBal || '0.00',
      openingBalType: data?.openingBalType || '',
      creditDays: data?.creditDays || '0',
      creditLimit: data?.creditLimit || '0',

      // contact info
      phoneNumber: data?.phoneNumber || '',

      // gst data
      gstIn: data?.gstIn || '',
      panCard: data?.panCard || '',

      // personal info
      firstName: data?.firstName || '',
      lastName: data?.lastName || '',
      emailId1: data?.emailId1 || '',
      emailId2: data?.emailId2 || '',

      // licence info
      drugLicenceNo1: data?.drugLicenceNo1 || '',

      // bank details
      accountHolderName: data?.accountHolderName || '',
      accountNumber: data?.accountNumber || '',
      bankName: data?.bankName || '',
      ifscCode: data?.ifscCode || '',
      accountType: data?.accountType || '',
      branchName: data?.branchName || '',
    },
    validationSchema: ledgerFormValidationSchema,
    onSubmit: (values) => {
      const allData = {
        ...values
      };
      if (data.party_id) {
        electronAPI.updateParty(data.party_id, allData);
      } else {
        electronAPI.addParty(allData);
      }
    },
  });

  const electronAPI = (window as any).electronAPI;

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

  return (
    <>
      <div className='w-full'>
        <div className='flex w-full items-center justify-between px-8 py-4  bg-[#f3f3f3]'>
          <h1 className='font-bold'>
            {!!data.party_id ? 'Update Party' : 'Create Party'}
          </h1>
          <Button
            type='highlight'
            id='ledger_button'
            handleOnClick={() => {
              return navigate(`/ledger_table`);
            }}
          >
            Back
          </Button>
        </div>
        <form onSubmit={ledgerFormInfo.handleSubmit} className='flex flex-col w-full'>
          <div className='flex flex-row p-4 m-4 shadow-xl gap-2'>
            <GeneralInfo
              onValueChange={handleValueChange}
              formik={ledgerFormInfo}
            />
            <div className='flex flex-col gap-6 w-[40%]'>
              <BalanceInfo
                accountInputValue={valueFromGeneral}
                formik={ledgerFormInfo}
              />
              <ContactsInfo
                accountInputValue={valueFromGeneral}
                formik={ledgerFormInfo}
              />
            </div>
          </div>
          {(valueFromGeneral === 'SUNDRY CREDITORS' ||
            valueFromGeneral === 'SUNDRY DEBTORS') && (
              <div className=' shadow-lg m-4 p-4'>
                <div className='flex flex-row'>
                  <Button
                    type='fog'
                    id='GST/Tax Details'
                    className='btn rounded-none !border-r-0 active'
                    handleOnClick={() => handleClick('btn_1')}
                    handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
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
                  </Button>
                  <Button
                    type='fog'
                    id='Licence_Info'
                    className='btn rounded-none !border-x-0'
                    handleOnClick={() => handleClick('btn_2')}
                    handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
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
                  </Button>
                  <Button
                    type='fog'
                    id='Contact_Info'
                    className='btn rounded-none !border-x-0'
                    handleOnClick={() => handleClick('btn_3')}
                    handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
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
                  </Button>
                  <Button
                    type='fog'
                    id='Bank_Details'
                    className='btn rounded-none !border-l-0'
                    handleOnClick={() => handleClick('btn_4')}
                    handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
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
                  </Button>
                </div>
                <div className=''>
                  {showActiveElement.btn_1 && (
                    <TaxDetails formik={ledgerFormInfo} />
                  )}
                  {showActiveElement.btn_3 && (
                    <ContactDetails formik={ledgerFormInfo} />
                  )}
                  {showActiveElement.btn_2 && (
                    <LicenceInfo formik={ledgerFormInfo} />
                  )}
                  {showActiveElement.btn_4 && (
                    <BankDetails formik={ledgerFormInfo} />
                  )}
                </div>
              </div>
            )}
          <div>
            <Button
              type='highlight'
              id='submit_all'
              btnType='submit'
              disable={!(ledgerFormInfo.isValid && ledgerFormInfo.dirty)}
              handleOnClick={() => {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: 'Ledger created successfully',
                });
              }}
              className='submit_button'
              handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
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
              {!!data.party_id ? 'Update' : 'Submit'}
            </Button>
          </div>
        </form>
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
