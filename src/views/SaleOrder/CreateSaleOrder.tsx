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
import { createSaleOrderAllStation, createSaleOrderOneStation, saleOrderViewChain } from '../../constants/focusChain/saleOrderFocusChain';
import FormikInputField from '../../components/common/FormikInputField';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import { CreateSaleOrderTable } from './CreateSaleOrderTable';
import NumberInput from '../../components/common/numberInput/numberInput';
import { Popup } from '../../components/popup/Popup';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridOptions } from 'ag-grid-community';

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
  decimalFormatter: any;
}

export const CreateSaleOrder = ({ setView, viewData, getAndSetTableData, decimalFormatter }: createSaleOrderView) => {
  const { openTab } = useTabs();
  const [data, setData] = useState<any>(undefined);
  const tabManager = TabManager.getInstance()
  const [stationOptions, setStationOptions] = useState<Option[]>([]);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [pendingItemsPopup, setPendingItemsPopup] = useState<boolean>(false);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const currentTab = useRef<any>(document.querySelector(`div[tab-id=${tabManager.activeTabId}]`));

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
      if (viewData?.orderNo) {
        await sendAPIRequest(`/saleOrder/${viewData.orderNo}?type=orderNo`, { method: 'PUT', body: values });
      } else {
        await sendAPIRequest(`/saleOrder`, { method: 'POST', body: values });
      }
    },
  });

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

  function getSaleOrderFocusChain(){
    if(formik.values.oneStation){
      return [...createSaleOrderOneStation, ...(pendingItems.length ? ['viewSaleOrderPendingItemsBtn']: [])]
    }
    return [...createSaleOrderAllStation, ...(pendingItems.length ? ['viewSaleOrderPendingItemsBtn']: [])]
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  // useEffect(() => {
  //   const focusCol = formik.values.oneStation ? 'custom_select_stationId' : 'partyId';
  //   tabManager.updateFocusChainAndSetFocus(getSaleOrderFocusChain(), focusCol);
  // }, [ formik.values.oneStation])
  useEffect(() => {
    if (formik.values.oneStation === 'One Station') {
      tabManager.updateFocusChainAndSetFocus(getSaleOrderFocusChain(), 'custom_select_oneStation')
    }
    else {
      tabManager.updateFocusChainAndSetFocus(getSaleOrderFocusChain(), 'custom_select_oneStation')
    }

  }, [pendingItems.length ,formik.values.oneStation]);

  useEffect(() => {
    tabManager.updateFocusChainAndSetFocus(getSaleOrderFocusChain(), 'custom_select_oneStation')
  }, [])
  useEffect(() => { 
    async function fetchPendingItems(){
      try {
        const pendingItems = await sendAPIRequest(`/saleOrder/${formik.values.partyId}?type=partyId&view=true`);
        setPendingItems(pendingItems);
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          console.log('pendingItems not fetched in createSaleOrder');
        }
      }
    }
    if (formik.values.partyId){
      fetchPendingItems();
    }
  }, [formik.values.partyId])

  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

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
             tabManager.setTabLastFocusedElementId('date') 
          }
        }
      })
    }
    // lastElementRef.current = 'partyId'
  }


  async function handleSave(){
      await formik.handleSubmit();
      setView({ type: '', data: {} });
      await getAndSetTableData();
  }

  function togglePendingItemPopup(){
    setPendingItemsPopup((pre:boolean)=> !pre)
  }

  const colDefs: any[] = [
    {
      headerName: 'Order No',
      field: 'orderNo',
      type: 'numberColumn',
      editable: false
    },
    {
      headerName: 'Item Name',
      field: 'item.name',
      flex: 2,
      editable: false,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Date',
      field: 'date',
      editable: false,
      filter: 'agDateColumnFilter',
      valueFormatter: (params: any) => {
        const dateParts = params.value.split('/');
        const formattedDate = new Date(
          `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        );
        return formattedDate.toLocaleDateString('en-GB'); // Ensure the displayed format is DD/MM/YYYY
      },
      filterParams: {
        // Custom comparator for handling DD/MM/YYYY format in filtering
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          const dateParts = cellValue.split('/');
          const cellDate = new Date(
            `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
          );
          if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
            return 0;
          }
          return cellDate < filterLocalDateAtMidnight ? -1 : 1;
        },
        browserDatePicker: true, // Use the browser's default date picker
      },
    },    
    {
      headerName: 'Quantity',
      field: 'Qty',
      flex: 1,
      headerClass: 'custom-header',
      valueFormatter: decimalFormatter,
      cellStyle: {
        display: 'flex',
        justifyContent: 'end',
        alignItems: 'center',
      },
    },
  ];

  const defaultColDef: ColDef = {
    floatingFilter: true,
    editable: false,
    flex: 1,
    suppressMovable: true,
    filter: true,
    headerClass: 'custom-header',
  }

  const gridOptions: GridOptions<any> = {
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [20, 30, 40],
    defaultColDef,
  };

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
                    const dropdown = currentTab.current?.querySelector('.custom-select__menu');
                    if (!dropdown) {
                      e.preventDefault();
                      e.stopPropagation()
                      tabManager.focusManager()
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
                        const dropdown = currentTab.current?.querySelector('.custom-select__menu');
                        if (!dropdown) {
                          e.preventDefault();
                          e.stopPropagation()
                         tabManager.focusManager()
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
                    currentTab.current?.querySelector('#partyId')?.click()
                  }
                }}
                showErrorTooltip={formik.touched.partyId && !!formik.errors.partyId}
              />
            </div>
            {/* just to show on UI  */}
            <div className='w-[35%]'>
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
                labelClassName='!h-full !text-base !me-4 !min-w-[130px] text-nowrap !ps-0'
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
          </div>
        </div>

        <div className='my-4 mx-8'>
          <CreateSaleOrderTable selectedParty={selectedParty} formik={formik} dataItems={data?.items}/>
        </div>

        <div className='flex justify-between px-8 py-2'>
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
          {pendingItems.length !== 0 && <div className='flex items-center gap-8'>
            <Button
              type='fill'
              padding='px-4 py-2'
              btnType='button'
              handleOnClick={togglePendingItemPopup}
              id='viewSaleOrderPendingItemsBtn'
            >
              View Pending items
            </Button>
            <div className='flex gap-1 text-gray-700'>
              <span>Pending Items:</span>
              <span>{pendingItems.length}</span>
            </div>
          </div>}
        </div>
      </form>

      {pendingItemsPopup && <Popup 
        id='saleOrderPendingItems'
        heading='PendingItems'
        childClass='!min-w-[50%]'
        onClose={togglePendingItemPopup}
      >
        <div id='saleOrderPendingItemsGrid' className='ag-theme-quartz'>
          {
            <AgGridReact
              rowData={pendingItems}
              columnDefs={colDefs}
              gridOptions={gridOptions}
            />
          }
        </div>
      </Popup>}

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
