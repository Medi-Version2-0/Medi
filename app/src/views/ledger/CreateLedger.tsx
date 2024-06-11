import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { GeneralInfo } from '../../components/ledger form/GeneralInfo';
import { BalanceDetails } from '../../components/ledger form/BalanceDetails';
import { ContactNumbers } from '../../components/ledger form/ContactNumbers';
import { BankDetails } from '../../components/ledger form/BankDetails';
import { ContactDetails } from '../../components/ledger form/ContactDetails';
import { LicenceDetails } from '../../components/ledger form/LicenceDetails';
import { TaxDetails } from '../../components/ledger form/TaxDetails';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import { getLedgerFormValidationSchema } from './validation_schema';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const initialValue = {
  btn_1: false,
  btn_2: false,
  btn_3: false,
  btn_4: false,
};

export const CreateLedger = () => {
  const [showActiveElement, setShowActiveElement] = useState(initialValue);
  const electronAPI = (window as any).electronAPI;
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};
  const [valueFromGeneral, setValueFromGeneral] = useState(data?.accountGroup || '');
  const isSUNDRY = (valueFromGeneral === 'SUNDRY CREDITORS' || valueFromGeneral === 'SUNDRY DEBTORS');
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  useEffect(() => {
    ledgerFormInfo.validateForm();
  }, [valueFromGeneral]);

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
      openingBalType: data?.openingBalType || 'DR',
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
      drugLicenceNo2: data?.drugLicenceNo2 || '',

      // bank details
      accountHolderName: data?.accountHolderName || '',
      accountNumber: data?.accountNumber || '',
      bankName: data?.bankName || '',
      ifscCode: data?.ifscCode || '',
      accountType: data?.accountType || '',
      branchName: data?.branchName || '',
    },
    validationSchema: getLedgerFormValidationSchema(isSUNDRY),
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

  const handleValueChange = (value: any) => {
    if (value !== data.accountGroup) {
      setValueFromGeneral(value);
      const newValues: any = {};
      for (const key in ledgerFormInfo.initialValues) {
        if (key !== 'partyName') {
          newValues[key] = '';
        }
      }
      newValues.partyName = ledgerFormInfo.values.partyName;
      newValues.accountGroup = value;
      newValues.openingBalType = "DR";
      ledgerFormInfo.setValues(newValues);
    } else {
      const initialValues = {
        ...data,
        accountGroup: value
      };
      ledgerFormInfo.setValues(initialValues);
      setValueFromGeneral(value);
    }
    ledgerFormInfo.validateForm();
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

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    return navigate('/ledger_table');
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>
          {!!data.party_id ? 'Update Party' : 'Create Party'}
        </h1>
        <Button
          type='highlight'
          id='ledger_button'
          className='h-8'
          handleOnClick={() => {
            return navigate(`/ledger_table`);
          }}
        >
          Back
        </Button>
      </div>
      <form onSubmit={ledgerFormInfo.handleSubmit} className='flex flex-col w-full'>
        <div className='flex flex-row px-4 mx-4 py-2 gap-2'>
          <GeneralInfo
            onValueChange={handleValueChange}
            formik={ledgerFormInfo}
          />
          <div className='flex flex-col gap-6 w-[40%]'>
            <BalanceDetails
              accountInputValue={valueFromGeneral}
              formik={ledgerFormInfo}
            />
            <ContactNumbers
              accountInputValue={valueFromGeneral}
              formik={ledgerFormInfo}
            />
          </div>
        </div>
        {(valueFromGeneral === 'SUNDRY CREDITORS' ||
          valueFromGeneral === 'SUNDRY DEBTORS') && (
            <div className=' shadow-lg mx-4 px-4'>
              <div className='flex flex-row m-1'>
                <Button
                  type='fog'
                  id='GST/Tax Details'
                  className={`rounded-none !border-r-[1px] focus:font-black ${showActiveElement.btn_1 && 'border-b-blue-500 border-b-[2px]'} text-sm font-medium !py-1`}
                  handleOnClick={() => handleClick('btn_1')}
                  handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                    if (e.key === 'ArrowDown' || e.key === 'Enter') {
                      handleClick('btn_1');
                      document.getElementById('gstIn')?.focus();
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
                  className={`rounded-none !border-x-0 ${showActiveElement.btn_2 && 'border-b-blue-500 border-b-[2px]'} text-sm font-medium !py-1`}
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
                  Licence Details
                </Button>
                <Button
                  type='fog'
                  id='Contact_Info'
                  className={`rounded-none !border-x-[1px] ${showActiveElement.btn_3 && 'border-b-blue-500 border-b-[2px]'} text-sm font-medium !py-1`}
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
                  Contact Details
                </Button>
                <Button
                  type='fog'
                  id='Bank_Details'
                  className={` rounded-none !border-l-0 ${showActiveElement.btn_4 && 'border-b-blue-500 border-b-[2px]'} text-sm font-medium !py-1`}
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
                  <LicenceDetails formik={ledgerFormInfo} />
                )}
                {showActiveElement.btn_4 && (
                  <BankDetails formik={ledgerFormInfo} />
                )}
              </div>
            </div>
          )}
        <div className='w-full px-8 py-2'>
          <Button
            type='fill'
            btnType='submit'
            padding='px-4 py-2'
            id='submit_all'
            disable={!(ledgerFormInfo.isValid && ledgerFormInfo.dirty)}
            handleOnClick={() => {
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: 'Ledger created successfully',
              });
            }}
            className='h-8'
            handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'ArrowUp') {
                document.getElementById(isSUNDRY ? 'accountHolderName' : 'openingBalType')?.focus();
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
  );
};
