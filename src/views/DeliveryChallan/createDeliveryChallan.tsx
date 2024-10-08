import React, { useEffect, useRef, useState } from 'react';
import { FormikProps, Formik, Form, useFormik } from 'formik';
import Button from '../../components/common/button/Button';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useQueryClient } from '@tanstack/react-query';
import { Option, schemeSectionFormProps, schemeSectionProps } from '../../interface/global';
import FormikInputField from '../../components/common/FormikInputField';
import CustomSelect from '../../components/custom_select/CustomSelect';
import titleCase from '../../utilities/titleCase';
import { CreateDeliveryChallanTable } from './createDeliveryChallanTable';
import { saleChallanFormValidations } from './validation_schema';
import { Popup } from '../../components/popup/Popup';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import { Ledger } from '../ledger';
import { useTabs } from '../../TabsContext';
import { pendingChallansList } from '../../constants/saleChallan';
import useApi from '../../hooks/useApi';
import usePartyFooterData from '../../hooks/usePartyFooterData';
import { TabManager } from '../../components/class/tabManager';
import { challanTableChain, createSaleChallanAllStation, createSaleChallanOneStation, saleChallanView } from '../../constants/focusChain/saleChallan';
import { useControls } from '../../ControlRoomContext';

export interface DeliveryChallanFormValues {
  oneStation: string;
  stationId: string;
  partyId: string;
  runningBalance: number;
  runningBalanceType: string;
  challanNumber: string;
  personName: string;
  date: string;
  qtyTotal: string;
  total: string;
  totalDiscount: string;
  totalGST: string;
  totalSGST: string;
  totalCGST: string;
}

export type DeliveryChallanFormInfoType = FormikProps<DeliveryChallanFormValues>;

export const SchemeSection = ({ togglePopup, heading, className, setOpenDataPopup, setSchemeValue }: schemeSectionProps) => {
  const formikRef = useRef<FormikProps<schemeSectionFormProps>>(null);
  
  useEffect(() => {
    const focusTarget = document.getElementById('scheme1');
    focusTarget?.focus();
  }, []);

  const handleSubmit = async (values: any) => {
    setSchemeValue({ scheme1: values.scheme1, scheme2: values.scheme2 });
    setOpenDataPopup(false)
    togglePopup(false);
  };
  return (
    <Popup heading={heading} childClass='!max-h-fit' className={className}>
      <Formik
        innerRef={formikRef}
        initialValues={{ scheme1: null, scheme2: null }}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='flex flex-col gap-3 items-center px-2'>
            <div className='flex gap-3 w-full justify-evenly'>
              <div className='w-[40%]'>
                <FormikInputField
                  type='number'
                  id='scheme1'
                  placeholder='0.00'
                  name='scheme1'
                  formik={formik as FormikProps<schemeSectionFormProps>}
                  className='!gap-0'
                  nextField='scheme2'
                  prevField='scheme1'
                  sideField='scheme1'
                  showErrorTooltip={!!(formik.touched.scheme1 && formik.errors.scheme1)}
                />
              </div>
              <div className=''> + </div>
              <div className='w-[40%]'>
                <FormikInputField
                  type='number'
                  id='scheme2'
                  name='scheme2'
                  placeholder='0.00'
                  formik={formik as FormikProps<schemeSectionFormProps>}
                  className='!gap-0'
                  nextField='submit_button'
                  prevField='scheme1'
                  sideField='scheme1'
                  showErrorTooltip={!!(formik.touched.scheme1 && formik.errors.scheme1)}
                />
              </div>
            </div>
            <div className='flex w-full justify-between m-2 px-[0.4em]'>
              <Button
                autoFocus={true}
                type='fog'
                id='cancel_button'
                handleOnClick={() => togglePopup(false)}
              >
                Cancel
              </Button>
              <Button
                id='submit_button'
                type='fill'
                autoFocus
                handleOnClick={formik.handleSubmit}
              >
                Save
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};

const CreateDeliveryChallan = ({ setView, data }: any) => {
  const { openTab } = useTabs()
  const [stationOptions, setStationOptions] = useState<Option[]>([]);
  const [selectedParty, setSelectedParty] = useState<any>()
  const [dataFromTable, setDataFromTable] = useState<any[]>([]);
  const [challanTableData, setChallanTableData] = useState<any[]>([]);
  const [isNetRateSymbol, setIsNetRateSymbol] = useState<string>('');
  const { sendAPIRequest } = useApi();
  const { controlRoomSettings } = useControls()
  const queryClient = useQueryClient();
  const lastElementRef = useRef('')
  const [pendingData, setPendingData] = useState({
    pendingChallansAmount: 0,
    totalPendingItems: 0
  })
  const tabManager = TabManager.getInstance();
  const initialId = tabManager.activeTabId

  const [totalValue, setTotalValue] = useState({
    totalAmt: 0.0,
    totalQty: 0.0,
    totalDiscount: 0.0,
    totalGST: 0.0,
    totalCGST: 0.0,
    totalSGST: 0.0,
    isDefault: true
  });
  const [popupState, setPopupState] = useState<any>({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
    shouldBack: true,
  });
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
    isOpen: false,
    data: {}
  })
  const { partyFooterData , partyHeaders} = usePartyFooterData();

  const formik: DeliveryChallanFormInfoType = useFormik({
    initialValues: {
      oneStation: data?.oneStation || 'One Station',
      stationId: data?.stationId || '',
      partyId: data?.partyId || '',
      runningBalance: data?.runningBalance || 0.0,
      runningBalanceType: data?.runningBalanceType || '',
      challanNumber: data?.challanNumber || '',
      personName: data?.personName || '',
      date: data?.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }), // dd//mm//yyyy
      qtyTotal: data?.qtyTotal || '',
      total: data?.total || '',
      totalDiscount: data?.totalDiscount || '',
      totalGST: data?.totalGST || '',
      totalCGST: data?.totalCGST || '',
      totalSGST: data?.totalSGST || '',
    },
    validationSchema: saleChallanFormValidations,
    onSubmit: async (values: any) => {
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (values[key] instanceof File) {
            formData.append('file', values[key]);
            formData.append(key, 'upload');
          } else {
            formData.append(key, values[key]);
          }
        });
        if (values.oneStation === 'All Stations') {
          values.stationId = null;
        }
        if (isNetRateSymbol !== '') {
          values.netRateSymbol = isNetRateSymbol;
        } else {
          values.netRateSymbol = 'No';
        }
        values.total = (+totalValue.totalAmt)?.toFixed(controlRoomSettings.decimalValueCount || 2);
        values.qtyTotal = (+totalValue.totalQty)
        values.totalDiscount = (+totalValue.totalDiscount)?.toFixed(controlRoomSettings.decimalValueCount || 2);
        values.totalCGST = (+totalValue.totalCGST)?.toFixed(controlRoomSettings.decimalValueCount || 2);
        values.totalSGST = (+totalValue.totalSGST)?.toFixed(controlRoomSettings.decimalValueCount || 2);
        values.totalGST = (+totalValue.totalGST)?.toFixed(controlRoomSettings.decimalValueCount || 2);
        const finalData = { ...values, challans: dataFromTable };

        if (data.id) {
          await sendAPIRequest(`/deliveryChallan/${data.id}`, { method: 'PUT', body: finalData });
        } else {
         const resp = await sendAPIRequest(`/deliveryChallan`, { method: 'POST', body: finalData });
         if(resp.nextChallanNumber){
           formik.setFieldValue('challanNumber', resp.nextChallanNumber)
           tabManager.setTabLastFocusedElementId('challanNumber')
          return setPopupState({
            isModalOpen: false,
            isAlertOpen: true,
            message: `${resp.message} Next Challan No. is ${resp.nextChallanNumber}`,
            shouldBack: false
          });
         }
        }
        await queryClient.invalidateQueries({ queryKey: ['get-deliveryChallan'] });

        setPopupState({
          isModalOpen: false,
          isAlertOpen: true,
          message: `Delivery Challan ${data.id ? 'updated' : 'created'} successfully`,
          shouldBack: true
        });
      } catch (error:any) {
        if (!error?.isErrorHandled) {
          setPopupState({
            isModalOpen: false,
            isAlertOpen: true,
            message: `Failed to ${data.id ? 'update' : 'create'} delivery challan. \n ${error.response?.data?.error?.message || ''}`,
            shouldBack: false
          });
        }
      }
    },
  });



  const fetchAllData = async () => {
    try {
      const stations = await sendAPIRequest<any[]>(`/station`);
      setStationOptions(
        stations.map((station: any) => ({
          value: station.station_id,
          label: titleCase(station.station_name),
        }))
      );
      if(!data?.challanNumber){
        const challanNumber = await sendAPIRequest<any[]>(`/deliveryChallan/challanNumber`)
        formik.setFieldValue('challanNumber', challanNumber)
      }
     
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Station not fetched in Delivery Challan');
      }
    }
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false, shouldBack: true });
    if (popupState.shouldBack) {
      setView({ type: '', data: {} });
    }
  };

  const handleFieldChange = (option: Option | null, id: string) => {
    if(id !== 'partyId'){
      formik.setFieldValue('partyId' , '')
      setSelectedParty(null)
    }
    formik.setFieldValue(id, option?.value);
  };


  useEffect(() => {
    if(formik.values.oneStation === 'oneStation'){
      tabManager.updateFocusChainAndSetFocus([...createSaleChallanOneStation ,...(data?.challanNumber ? [] : ['challanNumber']) ,...challanTableChain], 'custom_select_oneStation')
    }
    else {
          tabManager.updateFocusChainAndSetFocus([...createSaleChallanAllStation ,...(data?.challanNumber ? [] : ['challanNumber']) ,...challanTableChain], 'custom_select_oneStation')
    }

  }, [formik.values.oneStation]);
  

  useEffect(() => {
    fetchAllData();
    if (data) {
      fetchPartyById(data.partyId)
      setChallanTableData(data.challans);
    }
    tabManager.updateFocusChainAndSetFocus([...createSaleChallanOneStation ,...(data?.challanNumber ? [] : ['challanNumber']) ,...challanTableChain], 'custom_select_oneStation')

  }, []);

  const fetchPartyById = async (id: string) => {
    if (id) {
      try {
        const resp = await sendAPIRequest(`/ledger/${id}`)
        if (resp && typeof (resp) === 'object') {
          setSelectedParty(resp)
        }
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          console.log('Party not fetched in createDelivery challan');
        }
      }
    }
  }

  useEffect(() => {
    const fetchPendingData = async () => {
      if (formik.values.partyId) {
        try {
          const resp: any = await sendAPIRequest(`/deliveryChallan/${formik.values.partyId}`);
          setPendingData(resp);
        } catch (error) {
          console.error('Failed to fetch pending data:', error);
        }
      }
    };

    fetchPendingData();
  }, [formik.values.partyId]);


  const handlePartyList = () => {
    if (formik.values.oneStation !== 'All Stations' && !formik.values.stationId) {
      setPopupState({
        isModalOpen: false,
        isAlertOpen: true,
        message: `Select Station first`,
        shouldBack: false,
      });
    }
    else {
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Party',
          headers: [...partyHeaders],
          footers: partyFooterData,
          newItem: () => tabManager.openTab('Ledger', <Ledger type='add' /> , [] , openTab),
          autoClose: true,
          apiRoute: '/ledger',
          ...(formik.values.oneStation === 'One Station' && { extraQueryParams: { stationId: formik.values.stationId } }),
          searchFrom: 'partyName',
          handleSelect: (rowData: any) => { handleFieldChange({ label: rowData.partyName, value: rowData.party_id }, 'partyId'), setSelectedParty(rowData); tabManager.setTabLastFocusedElementId('personName') }
        }
      })
    }
    lastElementRef.current = 'partyId'
  }

  const pendingChallans = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (formik.values.partyId) {
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Pending Challan Items',
          headers: [...pendingChallansList],
          apiRoute: `/deliveryChallan/pending/${formik.values.partyId}`,
          handleSelect: () => { },
          autoClose: true,
        }
      })
    }
  }

  const hasMissingKeys = (): boolean => {
    if (!dataFromTable.length || !formik.isValid || formik.isSubmitting) return true;
    return dataFromTable?.some((columns) => {
      if (!columns) return true;
      const { itemId, batchNo, qty, rate, scheme, schemeType } = columns;
      if (!itemId || !batchNo || !qty || !rate) {
        return true;
      }
      return (scheme && !schemeType?.value) || (!scheme && schemeType?.value);
    });
  }


  useEffect(() => {
    const handleFocusChange = (event: CustomEvent) => {
      const { tabId, focusedElementId } = event.detail;
      if (initialId === tabId) {
        if (focusedElementId?.includes('partyId')) {
          if(lastElementRef.current !== 'partyId'){
            handlePartyList()
          }

        }
        else {
          lastElementRef.current = ''
        }
      }
    };

    window.addEventListener('tabFocusChange', handleFocusChange as EventListener);

    return () => {
        window.removeEventListener('tabFocusChange', handleFocusChange as EventListener);
    };
}, [formik.values.oneStation , formik.values.stationId]);


  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>
          {data.id ? 'Update Challan' : 'Create Challan'}
        </h1>
        <Button
          type='highlight'
          id='back'
          handleOnClick={() => {
            setView({ type: '', data: {} });
            setTimeout(() => {
              tabManager.updateFocusChainAndSetFocus(saleChallanView, 'add')
            }, 0);
          }}
        >
          Back
        </Button>
      </div>
      <form onSubmit={formik.handleSubmit}>
        <div className='flex flex-col p-3 mx-8 my-4 gap-2 border-[1px] border-solid border-gray-400'>
          <div className='flex justify-between'>
            <div className='w-[30%]'>
              <CustomSelect
                isPopupOpen={false}
                label='Station'
                isRequired={true}
                id='oneStation'
                name='oneStation'
                labelClass='min-w-[115px] text-base text-gray-700'
                value={
                  formik.values.oneStation === ''
                    ? null
                    : {
                      label: formik.values.oneStation,
                      value: formik.values.oneStation,
                    }
                }
                onChange={handleFieldChange}
                options={[
                  { value: 'One Station', label: 'One Station' },
                  { value: 'All Stations', label: 'All Stations' },
                ]}
                isSearchable={false}
                disableArrow={false}
                hidePlaceholder={false}
                className='!h-6 rounded-sm'
                isTouched={formik.touched.oneStation}
                error={formik.errors.oneStation}
                onBlur={() => {
                  formik.setFieldTouched('oneStation', true);
                }}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    const dropdown = document.querySelector('.custom-select__menu');
                    if (!dropdown) {
                      e.preventDefault();
                      e.stopPropagation()
                      if (formik.values.oneStation === 'One Station'){
                        document.getElementById('custom_select_stationId')?.focus()
                      }
                      else if (formik.values.oneStation === 'All Stations'){
                        tabManager.setLastFocusedElementId('partyId')
                        document.getElementById('partyId')?.focus()
                      }
                    }
                  }
                }}
                showErrorTooltip={true}
              />
            </div>
            <div className='w-[35%]'>
              {formik.values.oneStation &&
                formik.values.oneStation === 'One Station' && (
                  <CustomSelect
                    isPopupOpen={false}
                    label='Station Name'
                    id='stationId'
                    labelClass='min-w-[150px] mr-[1em] text-gray-700'
                    value={
                      formik.values.stationId === ''
                        ? null
                        : {
                          label: stationOptions.find((e) => e.value === formik.values.stationId)?.label,
                          value: formik.values.stationId,
                        }
                    }
                    onChange={handleFieldChange}
                    options={stationOptions}
                    isSearchable={true}
                    disableArrow={false}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm'
                    isRequired={formik.values.oneStation === 'One Station' ? true : false}
                    error={formik.errors.stationId}
                    isTouched={formik.touched.stationId}
                    showErrorTooltip={true}
                    onBlur={() => {
                      formik.setFieldTouched('stationId', true);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      if (e.key === 'Enter') {
                        const dropdown = document.querySelector('.custom-select__menu');
                        if (!dropdown) {
                          e.preventDefault();
                          e.stopPropagation()
                          document.getElementById('partyId')?.focus()
                        }
                      }
                    }}
                  />
                )}
            </div>
          </div>
          <div className='flex justify-between'>
            <div className='w-[30%]'>

              <FormikInputField
                isPopupOpen={false}
                label='Party Name'
                id='partyId'
                name='partyId'
                readOnly={true}
                formik={formik}
                className='!mb-0'
                labelClassName='min-w-[115px] text-base text-gray-700'
                isRequired={true}
                value={
                  formik.values.partyId === '' || !selectedParty
                    ? null : selectedParty?.partyName
                }
                onClick={handlePartyList}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation()
                      document.getElementById('partyId')?.click()
                    }
                }}
                showErrorTooltip={formik.touched.partyId && !!formik.errors.partyId}
              />
        
            </div>
            {/* Running balance is calculated and shown automatically so it must be disabled */}
            <div className='w-[35%] flex'>
              <div className='w-[80%]'>
                <FormikInputField
                  isDisabled={true}
                  isPopupOpen={false}
                  label='Balance'
                  id='runningBalance'
                  value={selectedParty?.closingBalance}
                  name='runningBalance'
                  formik={formik}
                  className='!mb-0'
                  inputClassName='disabled:text-gray-800 text-right'
                  labelClassName='min-w-[150px] text-base mr-[1em] text-gray-700'
                />
              </div>
              <div className='w-[20%]'>
                <FormikInputField
                  isDisabled={true}
                  isPopupOpen={false}
                  id='runningBalanceType'
                  value={selectedParty?.closingBalanceType}
                  name='runningBalanceType'
                  formik={formik}
                  className='!mb-0'
                  inputClassName='disabled:text-gray-800'
                />
              </div>
            </div>
          </div>
          <div className='flex justify-between'>
            <div className='w-[30%]'>
              <FormikInputField
                isPopupOpen={false}
                label='Person Name'
                id='personName'
                name='personName'
                formik={formik}
                className='!mb-0'
                // prevField='partyId'
                // nextField='cell-0-0'
                labelClassName='min-w-[115px] text-base text-gray-700'
                isRequired={false}
                showErrorTooltip={formik.touched.personName && !!formik.errors.personName}
              />
            </div>
            <div className='w-[35%]'>
              <FormikInputField
                isDisabled={data?.challanNumber}
                isPopupOpen={false}
                label='Challan Number'
                id='challanNumber'
                name='challanNumber'
                formik={formik}
                className='!mb-0'
                inputClassName='disabled:text-gray-800'
                labelClassName='min-w-[150px] mr-[1em] text-base text-gray-700'
                isRequired={true}
                showErrorTooltip={formik.touched.challanNumber && !!formik.errors.challanNumber}
              />
            </div>
          </div>
          <div className='flex justify-between'>
            <div className='w-[30%]'>
              <FormikInputField
                isDisabled={true}
                isPopupOpen={false}
                label='Date'
                id='date'
                name='date'
                formik={formik}
                className='!mb-0'
                labelClassName='min-w-[115px] text-base text-gray-700'
                isRequired={false}
                inputClassName='disabled:text-gray-800'
              />
            </div>
            <div className='flex gap-1 text-gray-700'>
              <span>Total Pending Items:</span>
              <span>{pendingData.totalPendingItems}</span>
            </div>
            <div className='flex gap-1 text-gray-700'>
              <span>Total Pending Amount:</span>
              <span>
                {pendingData.pendingChallansAmount
                  ? Number(pendingData.pendingChallansAmount).toFixed(controlRoomSettings.decimalValueCount || 2)
                  : pendingData.pendingChallansAmount}
              </span>
            </div>

          </div>
        </div>
        <div className='my-4 mx-8'>
          <CreateDeliveryChallanTable
            setDataFromTable={setDataFromTable}
            setTotalValue={setTotalValue}
            totalValue={totalValue}
            challanDate={formik.values.date}
            challanTableData={challanTableData}
            setIsNetRateSymbol={setIsNetRateSymbol}
            setChallanTableData={setChallanTableData}
            challanId={data?.id}
            selectedParty={selectedParty}
          />
        </div>

        {formik.values.partyId && <div className="flex justify-end">
          <Button
            type='fill'
            padding='px-4 py-2'
            id='pendingData'
            className="bg-[#009196FF] hover:bg-[#009196e3] font-medium text-white rounded-md border-none mx-8 focus:border-yellow-500 focus-visible:border-yellow-500"
            handleOnClick={pendingChallans}
          >
            Pending Challans
          </Button>
        </div>}
        <div className='border-[1px] border-solid border-gray-400 my-4 p-4 mx-8'>
          <div className='flex gap-12 justify-between'>
            <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
              <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Discount Info</span>
              <span className='flex gap-2 text-base text-gray-900 p-2'>
                Total Discount :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalDiscount >= 0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalDiscount)?.toFixed(controlRoomSettings.decimalValueCount || 2)) : (data?.totalDiscount || 0)}
                </span>
              </span>
            </div>
            <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
              <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Tax Info</span>
              <span className='flex gap-2 text-base text-gray-900 mt-3 mx-2'>
                SGST :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalSGST >= 0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalSGST)?.toFixed(controlRoomSettings.decimalValueCount || 2)) : (data?.totalSGST || 0)}
                </span>
              </span>
              <span className='flex gap-2 text-base text-gray-900 m-2'>
                CGST :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalCGST >= 0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalCGST)?.toFixed(controlRoomSettings.decimalValueCount || 2)) : (data?.totalCGST || 0)}
                </span>
              </span>
              <span className='flex gap-2 text-base text-gray-900 m-2'>
                Total GST :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalGST >= 0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalGST)?.toFixed(controlRoomSettings.decimalValueCount || 2)) : (data?.totalGST || 0)}
                </span>
              </span>
            </div>
            <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
              <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Quantity Info</span>
              <span className='flex gap-2 text-base text-gray-900 m-2'>
                Total Quantity :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalQty >= 0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalQty)?.toFixed(controlRoomSettings.decimalValueCount || 2)) : (data?.qtyTotal || 0)}
                </span>
              </span>
            </div>
            <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
              <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Total Info</span>
              <span className='flex gap-2 text-base text-gray-900 m-2'>
                Total :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalAmt >= 0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalAmt)?.toFixed(controlRoomSettings.decimalValueCount || 2)) : (data?.total || 0)}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className='w-full px-8 py-2'>
          <Button
            type='fill'
            padding='px-4 py-2'
            id='save'
            disable={hasMissingKeys()}
            handleOnClick={() => formik.handleSubmit}
          >
            {data.id ? 'Update' : 'Submit'}
          </Button>
        </div>
      </form>
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          onClose={handleAlertCloseModal}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
          id='alertViewChallan'
        />
      )}
      {/* {popupList.isOpen &&  <SelectList
          heading={popupList.data.heading}
          closeList={()=> setPopupList({isOpen:false , data : {}})}
          headers={popupList.data.headers}
          tableData={popupList.data.tableData}
          footers={partyFooterData}
          handleSelect={(rowData)=> {popupList.data.handleSelect(rowData)}}
        />} */}

      {popupList.isOpen && <SelectList
        tableData={[]}
        heading={popupList.data.heading}
        closeList={() => setPopupList({ isOpen: false, data: {} })}
        headers={popupList.data.headers}
        footers={popupList.data.footers}
        apiRoute={popupList.data.apiRoute}
        handleSelect={(rowData) => { popupList.data.handleSelect(rowData) }}
        handleNewItem={popupList.data?.newItem}
        searchFrom={popupList.data.searchFrom}
        autoClose={popupList.data.autoClose}
        onEsc={popupList.data.onEsc}
        extraQueryParams={popupList.data.extraQueryParams || {}}
      />}
    </div>
  );
};

export default CreateDeliveryChallan;