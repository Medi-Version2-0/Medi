import React, { useEffect, useRef, useState } from 'react';
import { FormikProps, Formik, Form, useFormik } from 'formik';
import Button from '../../components/common/button/Button';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { sendAPIRequest } from '../../helper/api';
import { useQueryClient } from '@tanstack/react-query';
import { CompanyFormData, Option, schemeSectionFormProps, schemeSectionProps } from '../../interface/global';
import onKeyDown from '../../utilities/formKeyDown';
import FormikInputField from '../../components/common/FormikInputField';
import CustomSelect from '../../components/custom_select/CustomSelect';
import titleCase from '../../utilities/titleCase';
import { CreateDeliveryChallanTable } from './createDeliveryChallanTable';
import { saleChallanFormValidations } from './validation_schema';
import { Popup } from '../../components/popup/Popup';
import { useSelector } from 'react-redux';
import { SelectList } from '../../components/common/selectList';
import { partyHeaders } from '../partywisePriceList/partywiseHeader';

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
                  showErrorTooltip={ !!(formik.touched.scheme1 && formik.errors.scheme1)}
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

  const [stationOptions, setStationOptions] = useState<Option[]>([]);
  const [partyOptions, setPartyOptions] = useState<Option[]>([]);
  const [dataFromTable, setDataFromTable] = useState<any[]>([]);
  const [challanTableData, setChallanTableData] = useState<any[]>([]);
  const [isNetRateSymbol, setIsNetRateSymbol] = useState<string>('');
  const [focused, setFocused] = useState('');
  const queryClient = useQueryClient();
  const {party: allParty} = useSelector((state:any)=> state.global)
  const [totalValue, setTotalValue] = useState({
    totalAmt: 0.0,
    totalQty: 0.0,
    totalDiscount: 0.0,
    totalGST: 0.0,
    totalCGST: 0.0,
    totalSGST: 0.0,
    isDefault :true
  });
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
    shouldBack: true
  });
  const [popupList, setPopupList] = useState<{isOpen:boolean, data:any}>({
    isOpen :false,
    data : {}
  })

  const formik: DeliveryChallanFormInfoType = useFormik({
    initialValues: {
      oneStation: data?.oneStation || 'One Station',
      stationId: data?.stationId || '',
      partyId: data?.partyId || '',
      runningBalance: data?.runningBalance || 0.0,
      runningBalanceType: data?.runningBalanceType || '',
      challanNumber: data?.challanNumber || '',
      personName: data?.personName || '',
      date: data?.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric'}), // dd//mm//yyyy
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
        if(isNetRateSymbol !== ''){
          values.netRateSymbol = isNetRateSymbol;
        }else{
          values.netRateSymbol = 'No';
        }
        values.total = (+totalValue.totalAmt)?.toFixed(2);
        values.qtyTotal = (+totalValue.totalQty)?.toFixed(2);
        values.totalDiscount = (+totalValue.totalDiscount)?.toFixed(2);
        values.totalCGST = (+totalValue.totalCGST)?.toFixed(2);
        values.totalSGST = (+totalValue.totalSGST)?.toFixed(2);
        values.totalGST = (+totalValue.totalGST)?.toFixed(2);
        const finalData = { ...values, challans: dataFromTable };

        if (data.id) {
          await sendAPIRequest(`/deliveryChallan/${data.id}`,{ method: 'PUT', body: finalData });
        } else {
          await sendAPIRequest(`/deliveryChallan`, { method: 'POST', body: finalData });
        }
        await queryClient.invalidateQueries({ queryKey: ['get-deliveryChallan'] });

        setPopupState({
          isModalOpen: false,
          isAlertOpen: true,
          message: `Delivery Challan ${data.id ? 'updated' : 'created'} successfully`,
          shouldBack:true
        });
      } catch (error) {
        setPopupState({
          isModalOpen: false,
          isAlertOpen: true,
          message: `Failed to ${data.id ? 'update' : 'create'} delivery challan`,
          shouldBack:false
        });
      }
    },
  });

  const fetchAllData = async () => {
    const stations = await sendAPIRequest<any[]>(`/station`);
    const partyList = await sendAPIRequest<any[]>(`/ledger`);

    setStationOptions(
      stations.map((station: any) => ({
        value: station.station_id,
        label: titleCase(station.station_name),
      }))
    );
    if (formik.values.oneStation === 'One Station') {
      const requiredParty = partyList.filter((party) => party.station_id === formik.values.stationId);
      setPartyOptions(
        requiredParty.map((party: any) => ({
          value: party.party_id,
          label: titleCase(party.partyName),
        }))
      );
    } else if (formik.values.oneStation === 'All Stations') {
      setPartyOptions(
        partyList.map((party: any) => ({
          value: party.party_id,
          label: titleCase(party.partyName),
        }))
      );
    }
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false , shouldBack:true});
    if(popupState.shouldBack){
      setView({ type: '', data: {} });
    }
  };

  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<CompanyFormData>,
    radioField?: any
  ) => {
    onKeyDown({
      e,
      formik: formik,
      radioField: radioField,
      focusedSetter: (field: string) => {
        setFocused(field);
      },
    });
  };

  useEffect(() => {
    fetchAllData();
  }, [formik.values.stationId, formik.values.oneStation]);



  useEffect(() => {
    setFocused('oneStation');
    if (data) {
      setChallanTableData(data.challans);
    }
  }, []);


  const handlePartyList = ()=>{
    const tableData = formik.values.oneStation  === 'All Stations' ? allParty : allParty.filter((x:any)=> x.station_id === formik.values.stationId) 
    if (tableData.length) {
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Select Party',
          headers: [...partyHeaders],
          tableData: tableData,
          handleSelect: (rowData: any) => { handleFieldChange({ label: rowData.partyName, value: rowData.party_id }, 'partyId') ,  document.getElementById('personName')?.focus();
        }
        }
    })
  }
  else {
    setFocused('')
    document.getElementById('personName')?.focus();
    setPopupState({ 
      isModalOpen: false,
      isAlertOpen: true,
      message: `No Party found`,
      shouldBack: false
    });
  }
  }

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>
          {data.id ? 'Update Challan' : 'Create Challan'}
        </h1>
        <Button
          type='highlight'
          id='challan_button'
          handleOnClick={() => {
            setView({ type: '', data: {} });
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
                labelClass='min-w-[140px] text-base text-gray-700'
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
                isFocused={focused === 'oneStation'}
                error={formik.errors.oneStation}
                onBlur={() => {
                  formik.setFieldTouched('oneStation', true);
                  setFocused('');
                }}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    const dropdown = document.querySelector('.custom-select__menu');
                    if (!dropdown) e.preventDefault();
                    if (formik.values.oneStation === 'One Station') setFocused('stationId');
                    else if (formik.values.oneStation === 'All Stations') setFocused('partyId');
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
                    labelClass='min-w-[140px] mr-[3em] text-gray-700'
                    isFocused={focused === 'stationId'}
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
                    disableArrow={true}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm'
                    isRequired={formik.values.oneStation === 'One Station' ? true : false}
                    error={formik.errors.stationId}
                    isTouched={formik.touched.stationId}
                    showErrorTooltip={true}
                    onBlur={() => {
                      formik.setFieldTouched('stationId', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      if (e.key === 'Enter' || e.key === 'Tab') {
                        const dropdown = document.querySelector('.custom-select__menu');
                        if (!dropdown) e.preventDefault();
                        setFocused('partyId');
                      }
                      if (e.shiftKey && e.key === 'Tab') setFocused('oneStation');
                    }}
                  />
                )}
            </div>
          </div>
          <div className='flex justify-between'>
            <div className='w-[30%]'>
              <CustomSelect
                isPopupOpen={false}
                label='Party Name'
                id='partyId'
                labelClass='min-w-[140px] text-gray-700'
                isFocused={focused === 'partyId'}
                onFocus={handlePartyList}
                value={
                  formik.values.partyId === ''
                    ? null
                    : {
                      label: partyOptions.find((e) => e.value === formik.values.partyId)?.label,
                      value: formik.values.partyId,
                    }
                }
                onChange={handleFieldChange}
                noOptionsMsg={
                  formik.values.oneStation === 'One Station'
                    ? formik.values.stationId === ''
                      ? 'Select station First'
                      : 'No party is associated with the selected station. select another station or first create the party'
                    : 'Create a party first'
                }
                options={partyOptions}
                isSearchable={true}
                disableArrow={true}
                hidePlaceholder={false}
                className='!h-6 rounded-sm'
                isRequired={true}
                error={formik.errors.partyId}
                isTouched={formik.touched.partyId}
                showErrorTooltip={true}
                onBlur={() => {
                  formik.setFieldTouched('partyId', true);
                  setFocused('');
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    const dropdown = document.querySelector('.custom-select__menu');
                    if (!dropdown) e.preventDefault();
                    document.getElementById('personName')?.focus();
                  }
                  if (e.shiftKey && e.key === 'Tab') {
                    if (formik.values.oneStation === 'One Station') setFocused('stationId');
                    else if (formik.values.oneStation === 'All Stations') setFocused('oneStation');
                  }
                }}
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
                  name='runningBalance'
                  formik={formik}
                  className='!mb-0'
                  inputClassName='disabled:text-gray-800'
                  labelClassName='min-w-[140px] text-base mr-[3em] text-gray-700'
                />
              </div>
              <div className='w-[20%]'>
                <FormikInputField
                  isDisabled={true}
                  isPopupOpen={false}
                  id='runningBalanceType'
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
                prevField='partyId'
                nextField='cell-0-0'
                labelClassName='min-w-[140px] text-base text-gray-700'
                isRequired={false}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                showErrorTooltip={formik.touched.personName && !!formik.errors.personName}
              />
            </div>
            <div className='w-[35%]'>
              <FormikInputField
                isDisabled={true}
                isPopupOpen={false}
                label='Challan Number'
                id='challanNumber'
                name='challanNumber'
                formik={formik}
                className='!mb-0'
                inputClassName='disabled:text-gray-800'
                labelClassName='min-w-[140px] mr-[3em] text-base text-gray-700'
                isRequired={false}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
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
                labelClassName='min-w-[140px] text-base text-gray-700'
                isRequired={false}
                inputClassName='disabled:text-gray-800'
              />
            </div>
          </div>
        </div>
        <div className='my-4 mx-8'>
          <CreateDeliveryChallanTable
            setDataFromTable={setDataFromTable}
            setTotalValue={setTotalValue}
            totalValue={totalValue}
            challanTableData={challanTableData}
            setIsNetRateSymbol={setIsNetRateSymbol}
            setChallanTableData={setChallanTableData}
          />
        </div>
        <div className='border-[1px] border-solid border-gray-400 my-4 p-4 mx-8'>
          <div className='flex gap-12 justify-between'>
            <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
              <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Discount Info</span>
              <span className='flex gap-2 text-base text-gray-900 p-2'>
                Total Discount :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalDiscount >=0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalDiscount)?.toFixed(2)) : (data?.totalDiscount || 0)}
                </span>
              </span>
            </div>            
            <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
              <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Tax Info</span>
              <span className='flex gap-2 text-base text-gray-900 mt-3 mx-2'>
                SGST :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalSGST >=0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalSGST)?.toFixed(2)) : (data?.totalSGST || 0)}
                </span>
              </span>
              <span className='flex gap-2 text-base text-gray-900 m-2'>
                CGST :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalCGST >=0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalCGST)?.toFixed(2)) : (data?.totalCGST || 0)}
                </span>
              </span>
              <span className='flex gap-2 text-base text-gray-900 m-2'>
                Total GST :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalGST >=0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalGST)?.toFixed(2)) : (data?.totalGST || 0)}
                </span>
              </span>
            </div>    
            <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
              <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Quantity Info</span>
              <span className='flex gap-2 text-base text-gray-900 m-2'>
                Total Quantity :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalQty >=0 && !totalValue.isDefault ?  parseFloat(Number(totalValue.totalQty)?.toFixed(2)) : (data?.qtyTotal || 0)}
                </span>
              </span>
            </div>  
            <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
              <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Total Info</span>
              <span className='flex gap-2 text-base text-gray-900 m-2'>
                Total :{' '}
                <span className='min-w-[50px] text-gray-700'>
                  {totalValue.totalAmt >=0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalAmt)?.toFixed(2)) : (data?.total || 0)}
                </span>
              </span>
            </div>          
          </div>
        </div>
        <div className='w-full px-8 py-2'>
          <Button
            type='fill'
            padding='px-4 py-2'
            id='submit_all'
            disable={!formik.isValid || !dataFromTable?.length}
            handleOnClick={() => formik.handleSubmit}
            handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'ArrowUp') e.preventDefault();
            }}
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
        />
      )}
      {popupList.isOpen &&  <SelectList
          heading={popupList.data.heading}
          closeList={()=> setPopupList({isOpen:false , data : {}})}
          headers={popupList.data.headers}
          tableData={popupList.data.tableData}
          handleSelect={(rowData)=> {popupList.data.handleSelect(rowData)}}
        />}
    </div>
  );
};

export default CreateDeliveryChallan;
