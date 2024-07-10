import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
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
import { sendAPIRequest } from '../../helper/api';
import titleCase from '../../utilities/titleCase';
import { Option } from '../../interface/global';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useQueryClient } from '@tanstack/react-query';

const initialState = {
  btn_1: false,
  btn_2: false,
  btn_3: false,
  btn_4: false,
};

export const CreateLedger = ({ setView }: any) => {
  const { companyId } = useParams();
  const [stationData, setStationData] = useState<any[]>([]);
  const [showActiveElement, setShowActiveElement] = useState(initialState);
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const [isSUNDRY, setIsSUNDRY] = useState(false);
  const queryClient = useQueryClient();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const { state: data = {} } = useLocation();

  const prevClass = useRef('');

  const fetchAllData = async () => {
    const groupDataList = await sendAPIRequest<any[]>('/group');
    const stationList =
      await sendAPIRequest<{ station_id: number; station_name: string }[]>(
        '/station'
      );
      setStationData(stationList);
    setGroupOptions(
      groupDataList.map((group) => ({
        value: group.group_code,
        label: titleCase(group.group_name),
      }))
    );
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const initialValues = useMemo(
    () => ({
      partyName: data?.partyName || '',
      accountGroup: data?.Group?.group_code || '',
      accountCode: data?.accountCode || '',
      isPredefinedParty: data?.isPredefinedParty ?? true,
      station_id: data?.station_id || '',
      stationName: data?.stationName || '',
      mailTo: data?.mailTo || '',
      address1: data?.address1 || '',
      address2: data?.address2 || '',
      address3: data?.address3 || '',
      country: data?.country || 'INDIA',
      state: data?.state || '',
      pinCode: data?.pinCode || '',
      stateInout: data?.stateInout || '',
      transport: data?.transport || '',
      creditPrivilege: data?.creditPrivilege || '',
      excessRate: data?.excessRate || '',
      routeNo: data?.routeNo || '',
      partyCashCreditInvoice: data?.partyCashCreditInvoice || '',
      deductDiscount: data?.deductDiscount || '',
      stopNrx: data?.stopNrx || '',
      stopHi: data?.stopHi || '',
      notPrinpba: data?.notPrinpba || '',
      openingBal: data?.openingBal || '0.00',
      openingBalType: data?.openingBalType || 'Dr',
      creditDays: data?.creditDays || '0',
      creditLimit: data?.creditLimit || '0',
      partyType: data?.partyType || '',
      phoneNumber: data?.phoneNumber || '',
      gstIn: data?.gstIn || '',
      panCard: data?.panCard || '',
      gstExpiry: data?.gstExpiry || '',
      firstName: data?.firstName || '',
      lastName: data?.lastName || '',
      emailId1: data?.emailId1 || '',
      emailId2: data?.emailId2 || '',
      drugLicenceNo1: data?.drugLicenceNo1 || '',
      drugLicenceNo2: data?.drugLicenceNo2 || '',
      licenceExpiry: data?.licenceExpiry || '',
      accountHolderName: data?.accountHolderName || '',
      accountNumber: data?.accountNumber || '',
      bankName: data?.bankName || '',
      ifscCode: data?.ifscCode || '',
      accountType: data?.accountType || '',
      branchName: data?.branchName || '',
    }),
    [data]
  );

  const ledgerFormInfo = useFormik({
    initialValues,
    validationSchema: getLedgerFormValidationSchema(isSUNDRY),
    onSubmit: async (values) => {
      const formattedOpeningBal = parseFloat(values.openingBal).toFixed(2);
      const matchingStation = stationData.find(
        (station) => values.station_id === station.station_id
      );
      const allData = {
        ...values,
        openingBal: formattedOpeningBal,
        accountCode: values.accountGroup,
        station_id: values.station_id || null,
        state: matchingStation ? matchingStation.state_code : ''
      };
      delete allData.accountGroup;
      delete allData.stationName;

      const apiPath = data?.party_id
        ? `/${companyId}/ledger/${data?.party_id}`
        : `/${companyId}/ledger`;

      const method = data?.party_id ? 'PUT' : 'POST';

      await sendAPIRequest(apiPath, { method, body: allData });
      await queryClient.invalidateQueries({ queryKey: ['get-ledger'] });
    },
  });

  const group = useMemo(
    () =>
      groupOptions.find((e) => ledgerFormInfo?.values?.accountGroup === e.value)
        ?.label || '',
    [groupOptions, ledgerFormInfo.values?.accountGroup]
  );

  useEffect(() => {
    setIsSUNDRY(
      ['SUNDRY CREDITORS', 'SUNDRY DEBTORS'].includes(group.toUpperCase())
    );
  }, [group]);

  const handleValueChange = (value: string) => {
    if (value !== data?.accountGroup) {
      const newValues: any = {};
      Object.keys(ledgerFormInfo.initialValues).forEach((key) => {
        if (key !== 'partyName') newValues[key] = '';
      });
      newValues.partyName = ledgerFormInfo.values.partyName;
      newValues.accountGroup = value;
      newValues.openingBal = '0.00';
      if (
        ['SUNDRY CREDITORS', 'SUNDRY DEBTORS'].includes(value.toUpperCase())
      ) {
        newValues.country = 'India';
      }
      newValues.openingBalType = 'Dr';
      ledgerFormInfo.setValues(newValues);
    } else {
      const initialValues = { ...data, accountGroup: value };
      ledgerFormInfo.setValues(initialValues);
    }
    ledgerFormInfo.validateForm();
  };

  const handleClick = (clickedClass: string) => {
    setShowActiveElement({ ...initialState, [prevClass.current]: false });
    document.querySelector('.active')?.classList.remove('active');
    document.querySelector(`.${clickedClass}`)?.classList.add('active');
    setShowActiveElement({ ...initialState, [clickedClass]: true });
    prevClass.current = clickedClass;
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    setView('');
  };

  useEffect(() => {
    handleClick('btn_1');
  }, []);

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>
          {data?.party_id ? 'Update Party' : 'Create Party'}
        </h1>
        <Button
          type='highlight'
          id='ledger_button'
          handleOnClick={() => setView('')}
        >
          Back
        </Button>
      </div>
      <form
        onSubmit={ledgerFormInfo.handleSubmit}
        className='flex flex-col w-full'
      >
        <div className='flex flex-row px-4 mx-4 py-2 gap-2'>
          <GeneralInfo
            onValueChange={handleValueChange}
            formik={ledgerFormInfo}
            selectedGroup={group}
          />
          <div className='flex flex-col gap-6 w-[40%]'>
            <BalanceDetails selectedGroupName={group} formik={ledgerFormInfo} />
            <ContactNumbers selectedGroupName={group} formik={ledgerFormInfo} />
          </div>
        </div>
        {isSUNDRY && (
          <div className='shadow-lg mx-8'>
            <div className='flex flex-row my-1'>
              {[
                'GST/Tax Details',
                'Licence Info',
                'Contact Info',
                'Bank Details',
              ].map((label, idx) => (
                <Button
                  key={label}
                  type='fog'
                  btnType='button'
                  id={label.replace(' ', '_')}
                  className={`rounded-none !border-r-[1px] focus:font-black ${!!showActiveElement.btn_1 && 'border-b-blue-500 border-b-[2px]'} text-sm font-medium !py-1`}
                  handleOnClick={() => handleClick(`btn_${idx + 1}`)}
                  handleOnKeyDown={(e) => {
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
                  {label}
                </Button>
              ))}
            </div>
            {showActiveElement.btn_1 && <TaxDetails formik={ledgerFormInfo} />}
            {showActiveElement.btn_2 && (
              <LicenceDetails formik={ledgerFormInfo} />
            )}
            {showActiveElement.btn_3 && (
              <ContactDetails formik={ledgerFormInfo} />
            )}
            {showActiveElement.btn_4 && <BankDetails formik={ledgerFormInfo} />}
          </div>
        )}
        <div className='w-full px-8 py-2'>
          <Button
            type='fill'
            padding='px-4 py-2'
            id='submit_all'
            disable={!ledgerFormInfo.isValid}
            handleOnClick={() => {
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: `Ledger ${!!data?.party_id ? 'updated' : 'created'} successfully`,
              });
            }}
            handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'ArrowUp') {
                document
                  .getElementById(
                    isSUNDRY ? 'accountHolderName' : 'openingBalType'
                  )
                  ?.focus();
                e.preventDefault();
              }
            }}
          >
            {data?.party_id ? 'Update Party' : 'Create Party'}
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
