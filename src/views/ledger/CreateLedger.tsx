import { useEffect, useMemo, useRef, useState } from 'react';
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
import titleCase from '../../utilities/titleCase';
import { Option, GroupFormData, StationFormData } from '../../interface/global';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import useApi from '../../hooks/useApi';
import { FssaiNumber } from '../../components/ledger form/FssaiNumber.';
import { useControls } from '../../ControlRoomContext';
import { TabManager } from '../../components/class/tabManager';
import { BalanceChain, BalanceChainIsSUNDRY, bankChain, contactChain, FassiChain, GeneralInfoChainIsSUNDRY, GernalInfoChain, GstChain, ledgerViewChain, Licence2Chain, LicenceChain, NrxH1ItemChain, TaxChain } from '../../constants/focusChain/ledgerFocusChain';
import { NRXAndH1 } from '../../components/ledger form/StopNRX_H1';

const initialState = {
  btn_1: false,
  btn_2: false,
  btn_3: false,
  btn_4: false,
  btn_5: false,  
};

export const CreateLedger = ({ setView, data, getAndSetParties, stations }: any) => {
  const { sendAPIRequest } = useApi();
  const [groups, setGroups] = useState<any[]>([]);
  const [showActiveElement, setShowActiveElement] = useState(initialState);
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const [isSUNDRY, setIsSUNDRY] = useState(false);
  const tabManager = TabManager.getInstance()
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
    success:false,
  });
  const prevClass = useRef('');
  const { controlRoomSettings } = useControls();

  useEffect(() => {
    tabManager.updateFocusChainAndSetFocus([...GernalInfoChain, ...BalanceChain, ...NrxH1ItemChain, 'save'] , 'partyName')
    async function getAndSetGroups(){
      try{
        const allGroups = await sendAPIRequest('/group');
        setGroups(allGroups);
      }catch(error){
        console.log("Error in Fetching groups in CreateLedger");
      }
    }

    getAndSetGroups();
  }, [])

  useEffect(()=>{
    setGroupOptions(
      groups.map((group: GroupFormData) => ({
        value: group.group_code,
        label: titleCase(group.group_name),
      }))
    );
  }, [groups])

  const initialValues = useMemo(
    () => ({
      partyName: data?.partyName || '',
      accountGroup: data?.Group?.group_code || '',
      accountCode: data?.accountCode || '',
      isPredefinedLedger: data?.isPredefinedLedger ?? true,
      station_id: data?.station_id || '',
      stationName: data?.stationName || '',
      mailTo: data?.mailTo || '',
      address1: data?.address1 || '',
      address2: data?.address2 || '',
      address3: data?.address3 || '',
      country: data?.country || 'INDIA',
      state: data?.state || '',
      pinCode: data?.pinCode || '',
      stateInout: data?.stateInout || 'Within State',
      salesPriceList: data?.salesPriceList || '',
      transport: data?.transport || '',
      creditPrivilege: data?.creditPrivilege || '',
      excessRate: data?.excessRate || '',
      routeNo: data?.routeNo || '',
      partyCashCreditInvoice: data?.partyCashCreditInvoice || '',
      deductDiscount: data?.deductDiscount || '',
      stopNrx: data?.stopNrx || false,
      stopH1: data?.stopH1 || false,
      notPrinpba: data?.notPrinpba || '',
      openingBal: data?.openingBal || '',
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
      fssaiNumber: data?.fssaiNumber || '',
    }),
    [data]
  );

  const ledgerFormInfo = useFormik({
    initialValues,
    validationSchema: getLedgerFormValidationSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      const formattedOpeningBal = values.openingBal ? parseFloat(values.openingBal).toFixed(2) : null;
      const matchingStation = stations.find(
        (station:StationFormData) => values.station_id === station.station_id
      );
      const allData = {
        ...values,
        openingBal: formattedOpeningBal,
        accountCode: values.accountGroup,
        station_id: values.station_id || null,
        state: matchingStation ? String(matchingStation.state_code) : '', // typeCasting of state to string
      };
      delete allData.accountGroup;
      delete allData.stationName;
      // filtering fields from allData that are not empty string
      const filteredData = Object.fromEntries(
        Object.entries(allData).filter(([key, value]) => value !== '')
      );
      const apiPath = data?.party_id
        ? `/ledger/${data?.party_id}`
        : `/ledger`;

      const method = data?.party_id ? 'PUT' : 'POST';
      try{
        await sendAPIRequest(apiPath, { method, body: filteredData });
        setPopupState({
          ...popupState,
          isAlertOpen: true,
          message: `Ledger ${!!data?.party_id ? 'updated' : 'created'} successfully`,
          success: true,
        });
        getAndSetParties();
      }catch(err:any){
        if (err.response?.data.messages)  setPopupState({ ...popupState, isAlertOpen: true, message: err.response?.data.messages.map((e:any)=>e.message).join('\n')  });
        else  setPopupState({...popupState, isAlertOpen: true, message: err.response?.data.error.message });
        document.getElementById('partyName')?.focus();
        if (method === 'PUT') console.log('Party not Updated');
        if (method === 'POST') console.log('Party not Created');
      }
    },
  });


  useEffect(() => {
    if(isSUNDRY){
      handleTaxChain('GST_Tax_Details' , 'custom_select_accountGroup')
    }
    else {
      tabManager.updateFocusChainAndSetFocus([...GernalInfoChain, ...BalanceChain, ...NrxH1ItemChain, 'save'] , 'custom_select_accountGroup')
    }
   }, [isSUNDRY])

  const group = useMemo(
    () =>
      groupOptions.find((e) => ledgerFormInfo?.values?.accountGroup === e.value)
        ?.label || '',
    [groupOptions, ledgerFormInfo.values?.accountGroup]
  );

  useEffect(() => {
    setIsSUNDRY(
      [
        'SUNDRY CREDITORS',
        'SUNDRY DEBTORS',
        'GENERAL GROUP',
        'DISTRIBUTORS, C & F',
      ].includes(group.toUpperCase())
    );
  }, [group]);

  const handleValueChange = (value: string) => {
    const selectedGroupDetails =  groups.find(group => group.group_name === value.toUpperCase());
    if (value !== data?.accountGroup) {
      const newValues: any = {};
      Object.keys(ledgerFormInfo.initialValues).forEach((key) => {
        if (key !== 'partyName') newValues[key] = '';
      });
      newValues.stateInout = initialValues.stateInout;
      newValues.partyName = ledgerFormInfo.values.partyName;
      newValues.accountGroup = value;
      if (
        [
          'SUNDRY CREDITORS',
          'SUNDRY DEBTORS',
          'GENERAL GROUP',
          'DISTRIBUTORS, C & F',
        ].includes(value.toUpperCase())
      ) {
        newValues.country = 'India';
      }
      newValues.openingBal = '';
      newValues.openingBalType = 'Dr';
      newValues.partyType = selectedGroupDetails.type;
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
    if(popupState.success) setView({ type: '', data: {} });
  };

  useEffect(() => {
      handleClick('btn_1');
  }, []);

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const getInitialFocusFieldName = (label: any) => {
    switch(label) {
      case 'GST/Tax Details':
        return "gstIn"
      case 'Licence Info':
        return "drugLicenceNo1"
      case 'Contact Info':
        return 'firstName'
      case 'Bank Details':
        return 'bankName'
      case 'FSSAI Number':
        return 'fssaiNumber'
      default:
        return label
    }
  }

  const handleTaxChain = async (id: string ,label :string) => {
    let updatedTaxChain = [...TaxChain ,...controlRoomSettings.fssaiNumber ? ['FSSAI_Number'] : []];
    const idMapping: Record<string, string[]> = {
      'GST_Tax_Details': GstChain,
      'Licence_Info': LicenceChain,
      'Contact_Info': contactChain,
      'Bank_Details' : bankChain,
      ...controlRoomSettings.fssaiNumber ? {'FSSAI_Number': FassiChain} : {}

    };
    const index = updatedTaxChain.indexOf(id);
        if (index !== -1 && idMapping[id]) {
      updatedTaxChain = [
        ...updatedTaxChain.slice(0, index + 1),
        ...idMapping[id],                      
        ...updatedTaxChain.slice(index + 1)    
      ];
    }
    if(isSUNDRY){
      tabManager.updateFocusChainAndSetFocus([...GeneralInfoChainIsSUNDRY, ...controlRoomSettings.multiPriceList ? ['custom_select_salesPriceList', 'excessRate'] : ['excessRate'], ...BalanceChainIsSUNDRY, ...NrxH1ItemChain ,...updatedTaxChain , 'save'] , getInitialFocusFieldName(label))
    }
  };
  
  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>
          {data?.party_id ? 'Update Party' : 'Create Party'}
        </h1>
        <Button
          type='highlight'
          id='back'
          handleOnClick={() => {
            setView({ type: '', data: {} });
            tabManager.updateFocusChainAndSetFocus(ledgerViewChain, 'add')
          }}
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
            groupOptions={groupOptions}
            stationData={stations}
          />
          <div className='flex flex-col gap-6 w-[40%]'>
            <BalanceDetails selectedGroupName={group} formik={ledgerFormInfo} />
            <ContactNumbers selectedGroupName={group} formik={ledgerFormInfo} />
            <NRXAndH1 formik={ledgerFormInfo} />
          </div>
        </div>
        {
          isSUNDRY && (
            <div className='shadow-lg mx-8'>
              <div className='flex flex-row my-1'>
                {[
                  'GST/Tax Details',
                  'Licence Info',
                  'Contact Info',
                  'Bank Details',
                  ...controlRoomSettings.fssaiNumber ? ['FSSAI Number'] : []
                ].map((label, idx) => (
                  <Button
                    key={label}
                    type='fog'
                    btnType='button'
                    id={label.replace(/[\s/]/g, '_')}
                    className={`rounded-none !border-r-[1px] focus:font-black ${!!showActiveElement.btn_1 && 'border-b-blue-500 border-b-[2px]'} text-sm font-medium !py-1`}
                    handleOnClick={() => {handleClick(`btn_${idx + 1}`) ; setTimeout(() => {
                      handleTaxChain(label.replace(/[\s/]/g, '_') , label)
                    }, 0);}}
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
              {controlRoomSettings.fssaiNumber && showActiveElement.btn_5 && <FssaiNumber formik={ledgerFormInfo} />}
            </div>
          )
        }
        <div className='w-full px-8 py-2'>
          <Button
            type='fill'
            padding='px-4 py-2'
            id='save'
            disable={!ledgerFormInfo.isValid || ledgerFormInfo.isSubmitting}              
          >
            {ledgerFormInfo.isSubmitting ? 'Submitting' : data?.party_id ? 'Update Party' : 'Create Party'}
          </Button>
          {/* will show why button is disable  */}
          {/* <p className='text-red-500 text-[14px] mt-1'>{!ledgerFormInfo.isValid && Object.values(ledgerFormInfo.errors)[0].toString()}</p> */}  
        </div>
      </form>
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          id='createLedgerAlert'
          onClose={handleClosePopup}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
    </div>
  );
};
