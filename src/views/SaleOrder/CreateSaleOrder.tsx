import { useFormik } from 'formik';
import Button from '../../components/common/button/Button';
import { TabManager } from '../../components/class/tabManager';
import CustomSelect from '../../components/custom_select/CustomSelect';
import { Option } from '../../interface/global';
import { useEffect, useRef, useState } from 'react';
import { sendAPIRequest } from '../../helper/api';
import titleCase from '../../utilities/titleCase';
import usePartyFooterData from '../../hooks/usePartyFooterData';
import { Ledger } from '../ledger';
import { useTabs } from '../../TabsContext';
import { saleOrderViewChain } from '../../constants/focusChain/saleOrderFocusChain';
import FormikInputField from '../../components/common/FormikInputField';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import { CreateSaleOrderTable } from './CreateSaleOrderTable';
import NumberInput from '../../components/common/numberInput/numberInput';

interface saleOrder {
  id?: number;
  orderNo: number;
  itemCode: number;
  Qty: number;
  bigQty: number;
  bigUnit: number;
  free: number;
  freeType: number;
  date: string;
  partyId: number;
  schemeBeaf: number;
  qtySupplie: number;
  freeSupplie: number;
}

interface createSaleOrderView {
  setView: any;
  viewData?: any;
  getAndSetTableData: any;
}

export const CreateSaleOrder = ({ setView, viewData, getAndSetTableData }: createSaleOrderView) => {
  const { openTab } = useTabs();
  const [data, setData] = useState<any>(undefined);
  const tabManager = TabManager.getInstance()
  const [stationOptions, setStationOptions] = useState<Option[]>([]);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  // const lastElementRef = useRef('');
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
  const { partyFooterData, partyHeaders } = usePartyFooterData();

  useEffect(()=>{
    async function fetchDataToUpdate(){
      const response = await sendAPIRequest<any[]>(`/saleOrder/${viewData?.orderNo}?type=orderNo`);
      setData(response);
    }
    if (viewData?.orderNo){
      fetchDataToUpdate();
    }
  }, [viewData])

  const fetchAllData = async () => {
    try {
      const stations = await sendAPIRequest<any[]>(`/station`);
      setStationOptions(
        stations.map((station: any) => ({
          value: station.station_id,
          label: titleCase(station.station_name),
        }))
      );
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Station not fetched in Delivery Challan');
      }
    }
  };

  useEffect(()=>{
    if(data){
      formik.setValues({
        oneStation: data.oneStation,
        stationId: data.stationId,
        partyId: data.partyId.party_id,
        date: data.date,
        orderNo: data.orderNo,
        items: data.items,
      });
    }
  },[data])

  useEffect(() => {
    fetchAllData();
    // if (data) {
    //   fetchPartyById(data.partyId)
    //   setChallanTableData(data.challans);
    // }
    // tabManager.updateFocusChainAndSetFocus(, 'custom_select_oneStation')

  }, []);

  const formik: any = useFormik({
    initialValues: {
      oneStation: false,
      stationId: null,
      partyId: null,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }), // dd//mm//yyyy
      orderNo: null,
      items: [],
    },
    onSubmit: async (values: any) => {
      console.log('form Submitted -->  ',values)

      if (viewData?.orderNo) {
        console.log('put')
        // await sendAPIRequest(`/deliveryChallan/${data.id}`, { method: 'PUT', body: finalData });
      } else {
        await sendAPIRequest(`/saleOrder`, { method: 'POST', body: values });
      }
    },
  });


  useEffect(() => { 
    
  }, [formik.values.partyId])


  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  // console.log('values fromik --> ', formik.values)

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false, shouldBack: true });
    if (popupState.shouldBack) {
      setView({ type: '', data: {} });
    }
  };

  const handlePartyList = () => {
    if (formik.values.oneStation && !formik.values.stationId) {
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
          newItem: () => tabManager.openTab('Ledger', <Ledger type='add' />, [], openTab),
          autoClose: true,
          apiRoute: '/ledger',
          ...(formik.values.oneStation && { extraQueryParams: { stationId: formik.values.stationId } }),
          searchFrom: 'partyName',
          handleSelect: (rowData: any) => {
             handleFieldChange({ label: rowData.partyName, value: rowData.party_id }, 'partyId'), 
             setSelectedParty(rowData); 
             tabManager.setTabLastFocusedElementId('personName') 
          }
        }
      })
    }
    // lastElementRef.current = 'partyId'
  }

  async function handleSave(){
      formik.handleSubmit();
      setView({ type: '', data: {} });
      await getAndSetTableData();
  }

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>
          {viewData?.orderNo ? 'Update Sale Order' : 'Create Sale Order'}
        </h1>
        <Button
          type='highlight'
          id='back'
          handleOnClick={() => {
            setView({ type: '', data: {} });
            tabManager.updateFocusChainAndSetFocus(saleOrderViewChain, 'add')
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
                value={ {
                  label: formik.values.oneStation ? 'One Station' : 'All Stations',
                  value: formik.values.oneStation,
                }}
                onChange={handleFieldChange}
                options={[
                  { value: true, label: 'One Station' },
                  { value: false, label: 'All Stations' },
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
                      if (formik.values.oneStation) {
                        document.getElementById('custom_select_stationId')?.focus()
                      }else{
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
              {formik.values.oneStation && (
                  <CustomSelect
                    isPopupOpen={false}
                    label='Station Name'
                    id='stationId'
                    labelClass='min-w-[140px] text-gray-700'
                    value={
                      formik.values.stationId ? {
                          label: stationOptions.find((e) => e.value === formik.values.stationId)?.label,
                          value: formik.values.stationId,
                        } : null
                    }
                    onChange={handleFieldChange}
                    options={stationOptions}
                    isSearchable={true}
                    disableArrow={false}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm'
                    isRequired={formik.values.oneStation}
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
                isRequired={false}
                value={
                  !formik.values.partyId ? null : selectedParty
                    ? selectedParty?.partyName : data.partyId.partyName
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
            {/* just to show on UI  */}
            <div className='w-[14%]'>
              <NumberInput
                label={`Bal.`}
                id='closingBalance'
                name='closingBalance'
                placeholder='0.00'
                isDisabled={true}
                value={selectedParty?.closingBalance || data?.partyId.closingBalance}
                onChange={() => {
                  // nothing to do
                }}
                className='items-center justify-between'
                labelClassName='!h-full !text-base !me-4 w-fit text-nowrap !ps-0'
                inputClassName='text-left !text-[10px] px-1 !h-[24px] disabled:bg-white !text-black'
                error={formik.touched.excessRate && formik.errors.excessRate}
              />
            </div>
          </div>

          <div className='flex justify-between'>
            <div className='w-[30%]'>
              <FormikInputField
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
              <span>Order No :</span>
              <span>{data?.orderNo || null}</span>
            </div>
            {/* <div className='flex gap-1 text-gray-700'>
              <span>Total Pending Amount:</span>
              <span>{pendingData.pendingChallansAmount}</span>
            </div> */}

          </div>

          {/* <div className='flex w-full justify-end'>
            <div className='flex gap-1 text-gray-700'>
              <span>Party Balance:</span>
              <span>{selectedParty?.closingBalance || 0} {selectedParty?.closingBalanceType}</span>
            </div>
          </div> */}
        </div>

        <div className='my-4 mx-8'>
          <CreateSaleOrderTable selectedParty={selectedParty} formik={formik} dataItems={data?.items}/>
        </div>

        {/* {formik.values.partyId && <div className="flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-[#009196FF] hover:bg-[#009196e3] font-medium text-white rounded-md border-none focus:border-yellow-500 focus-visible:border-yellow-500"
            onClick={pendingChallans}
          >
            Pending Challans
          </button>
        </div>} */}

        <div className='w-full px-8 py-2'>
          <Button
            type='fill'
            padding='px-4 py-2'
            id='save'
            disable={!formik.isValid || formik.isSubmitting}
            handleOnClick={handleSave}
            handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'ArrowUp') e.preventDefault();
            }}
          >
            {viewData?.orderNo ? 'Update' : 'Submit'}
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
