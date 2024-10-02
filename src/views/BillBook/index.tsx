import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { BillBookForm, BillBookFormData, popupOptions } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import { CreateBillBook } from './CreateBillBook';
import { IoSettingsOutline } from 'react-icons/io5';
import { ControlRoomSettings } from '../../components/common/controlRoom/ControlRoomSettings';
import { invoiceSettingFields } from '../../components/common/controlRoom/settings';
import { useControls } from '../../ControlRoomContext';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { billBookValidationSchema } from './validation_schema';
import usePermission from '../../hooks/useRole';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { lookupValue, stringValueParser } from '../../helper/helper';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import useApi from '../../hooks/useApi';
import CustomSelect from '../../components/custom_select/CustomSelect';
import { TabManager } from '../../components/class/tabManager';

type SeriesOption = {
  value: number;
  label: string;
};

const initialValue: BillBookForm = {
  seriesId: 1,
  billName: '',
  billBookPrefix: '',
  company: '',
  billType: '',
  orderOfBill: null,
  locked: '',
};

const seriesOptions: SeriesOption[] = [
  { value: 1, label: 'Sale Challan' },
  { value: 2, label: 'Sale Bill' },
  { value: 3, label: 'Sale Order' },
  { value: 4, label: 'Purchase Order' },
  { value: 5, label: 'Breakage Expiry Receive' },
  { value: 6, label: 'Stock Issue' },
  { value: 7, label: 'Sale Return Credit Note' },
  { value: 8, label: 'Purchase Return Debit Note' },
  { value: 9, label: 'Breakage Expiry Receive Challan' },
  { value: 10, label: 'Sale Return Challan' },
  { value: 11, label: 'Purchase Return Challan' },
  { value: 12, label: 'Breakage Expiry Issue' },
  { value: 13, label: 'Breakage Expiry Issue Challan' },
];

export const BillBook = () => {
  const { sendAPIRequest } = useApi();
  const [billBookSeriesData, setBillBookSeriesData] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [settingToggleOpen, setSettingToggleOpen] = useState<boolean>(false);
  const [selectedSeries, setSelectedSeries] = useState<string>('1');
  const [formData, setFormData] = useState<BillBookForm | any>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<BillBookForm | any>(null);
  const editing = useRef(false);
  let currTable: any[] = [];
  const { controlRoomSettings } = useControls();
  const tabManager = TabManager.getInstance()
  const { createAccess, updateAccess, deleteAccess } = usePermission('invoicebill')

  const initialValues = {
    stockNegative: controlRoomSettings.stockNegative || false,
    ifItemRepeatedInBill: controlRoomSettings.ifItemRepeatedInBill || false,
    stopCursorAtInvoice: controlRoomSettings.stopCursorAtInvoice || false,
    schemeColPercentRequired:
      controlRoomSettings.schemeColPercentRequired || true,
    showMFGCompanyWithItem: controlRoomSettings.showMFGCompanyWithItem || true,
    invoiceWithoutHavingStock:
      controlRoomSettings.invoiceWithoutHavingStock || false,
    saveEntryTimeOfInvoice: controlRoomSettings.saveEntryTimeOfInvoice || true,
    lossWarningOfInvoice: controlRoomSettings.lossWarningOfInvoice || true,
    numberOfCopiesInInvoice: controlRoomSettings.numberOfCopiesInInvoice || 1,
    cursorAtSave: controlRoomSettings.cursorAtSave || false,
    smsOfInvoice: controlRoomSettings.smsOfInvoice || false,
    shippingAddressRequired:
      controlRoomSettings.shippingAddressRequired || false,
  };
  const popUpInitialValues = useMemo<popupOptions>(() => {
    return {
      isModalOpen: false,
      isAlertOpen: false,
      message: '',
    }
  }, []);
  const isDelete = useRef(false);

  const [popupState, setPopupState] = useState(popUpInitialValues);

  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };

  async function getAndSetBillBookData() {
    try {
      const allBillBook = await sendAPIRequest('/billBook');
      setBillBookSeriesData(allBillBook);
    } catch (err) {
      console.error('BillBook data in billBook index not being fetched');
    }
  }
  useEffect(() => {
    getAndSetBillBookData();
  }, []);

  const getBillBook = async () => {
    const data = billBookSeriesData?.filter((data: any) => data.seriesId === +selectedSeries);
    setTableData(data);
  };

  useEffect(() => {
    getBillBook();
  }, [billBookSeriesData, selectedSeries]);

  const toggleSettingPopup = (isOpen: boolean) => {
    setSettingToggleOpen(isOpen);
  };

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialValue);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };
  const handleAlertCloseModal = () => {
    setPopupState(popUpInitialValues);
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async (values: BillBookForm) => {
    values.seriesId = +selectedSeries;
    if(!values.orderOfBill){
      values.orderOfBill = 0; // by default 0
    }
    if (values !== initialValue) {
      try {
        if (values.id) {
          await sendAPIRequest(`/billBook/${values.id}`, {
            method: 'PUT',
            body: values,
          });
        } else {
          await sendAPIRequest(`/billBook`, {
            method: 'POST',
            body: values,
          });
        }
        togglePopup(false);
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          if (error.response?.data.messages) {
            settingPopupState(false, error.response?.data.messages.map((e: any) => e.message).join('\n'));
            return;
          }
          settingPopupState(false, error.response.data.error.message) 
        }
      }finally{
        await getAndSetBillBookData(); // always show latest data to user weather there is error or not
      }
    }
  };

  const deleteAcc = async () => {
    isDelete.current = false;
    setPopupState({ ...popupState, isModalOpen: false });
    togglePopup(false);
    try {
      await sendAPIRequest(`/billBook/${selectedRow.id}`, {
        method: 'DELETE',
      });
    } catch(error:any) {
      if (!error?.isErrorHandled) {
        settingPopupState(false, 'This bill book series is associated');
      }
    }finally{
      await getAndSetBillBookData();
      setSelectedRow(null);
    }
  };

  function handleDeleteFromForm(){
    settingPopupState(true, 'Are you sure you want to delete the billbook')
  }

  const handleDelete = (oldData: BillBookForm) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
  };

  const handleUpdate = (oldData: BillBookForm) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const handleSeriesChange = (series: any) => {
    setSelectedSeries(series.value);
  };

  const companyMapping = useMemo(() => ({ 'All Companies': 'All Companies', 'One Company': 'One Company' }), []);
  const billTypeMapping = useMemo(() => ({ 'Only Cash': 'Only Cash', 'Only Credit': 'Only Credit', 'Both': 'Both' }), []);
  const lockedMapping = useMemo(() => ({ Yes: 'Yes', No: 'No' }), []);

  const handleCellEditingStopped = async (e: any) => {
    currTable = [];
    editing.current = false;
    const { data, column, newValue, oldValue, node } = e;
    if (newValue == oldValue) return;
    const field = column.colId;
    const payload = {
      [field]: newValue,
      seriesId:selectedSeries,
      id: data.id,
      billType: data.billType,
      company: data.company,
    }
    try {
      await billBookValidationSchema(false).validateAt(field, { [field]: newValue });
    } catch (error: any) {
      settingPopupState(false, `${error.message}`);
      node.setDataValue(field, oldValue);
      return;
    }
    node.setDataValue(field, newValue);
    try {
      await sendAPIRequest(`/billBook/${data.id}`, {
        method: 'PUT',
        body: payload,
      });
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        if (error.response?.data.messages) {
          settingPopupState(false, error.response?.data.messages.map((e: any) => e.message).join('\n'));
          return;
        }
        settingPopupState(false, error.response.data.error.message);
      }
    }finally{
      await getAndSetBillBookData();
    }
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    handleKeyDownCommon(
      event,
      () => handleDelete(selectedRow),
      () => handleUpdate(selectedRow),
      undefined,
      selectedRow,
      undefined
    );
  };

  useHandleKeydown(handleKeyDown, [selectedRow, popupState])

  const defaultColDef: ColDef = {
    floatingFilter: true,
    flex: 1,
    filter: true,
    suppressMovable: true,
    headerClass: 'custom-header',
    editable: updateAccess,
  }

  const colDefs: any[] = [
    {
      headerName: 'Series Name',
      field: 'billName',
      valueParser: stringValueParser,
    },
    {
      headerName: 'Prefix',
      field: 'billBookPrefix',
      valueParser: (params: { newValue: string }) => {
        return params.newValue.toUpperCase().slice(0, 2);
      },
    },
    {
      headerName: 'Company',
      field: 'company',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: Object.values(companyMapping) },
      valueFormatter: (params: ValueFormatterParams) => lookupValue(companyMapping, params.value),
    },
    {
      headerName: 'Cash/Credit',
      field: 'billType',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: Object.values(billTypeMapping) },
      valueFormatter: (params: ValueFormatterParams) => lookupValue(billTypeMapping, params.value),
    },
    // sequence number will be not shown in the grid it is just tell the sorting of series
    // { 
    //   headerName: 'Sequence of Bill',
    //   field: 'orderOfBill',
    //   headerClass: 'custom-header-class custom-header',
    // },
    {
      headerName: 'Lock Bill',
      field: 'locked',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: Object.values(lockedMapping) },
      valueFormatter: (params: ValueFormatterParams) => lookupValue(lockedMapping, params.value),
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      editable: false,
      sortable: false,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params: { data: BillBookForm }) => (
        <div className='table_edit_buttons'>
          {updateAccess && <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => {
              setSelectedRow(params.data);
              handleUpdate(params.data);
            }}
          />}
          {deleteAccess && <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => handleDelete(params.data)}
          />}
        </div>
      ),
    },
  ];

  const gridOptions: GridOptions<any> = {
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [20, 30, 40],
    defaultColDef,
  };

  return (
    <>
      <div>
        <div className='w-full'>
          <div className='flex w-full items-center justify-between px-8 py-1'>
            <h1 className='font-bold'>Bill Book Setup</h1>
            <div className='flex gap-5'>
              <Button type='highlight' id='billBookSetupSettings' handleOnClick={() => toggleSettingPopup(true)}>
                <IoSettingsOutline />
              </Button>
              {createAccess && <Button type='highlight' id='add' handleOnClick={() => togglePopup(true)}>
                Add Series
              </Button>}
            </div>
          </div>

          <div className='seriesSelection !w-1/3 px-8 py-1 my-2'>
            <CustomSelect
              isPopupOpen={false}
              label='Select Series :'
              labelClass='whitespace-nowrap text-base font-medium'
              value={
                {
                  label: seriesOptions.find((s:any)=> s.value === +selectedSeries)?.label,
                  value: selectedSeries,
                }
              }
              id='series_select'
              onChange={handleSeriesChange}
              options={seriesOptions}
              isSearchable={false}
              disableArrow={false}
              containerClass='gap-4 !w-114% !justify-between relative mb-2 h-8 !text-[12px]'
              className='!rounded-[2px] !h-8 items-center  w-full width: fit-content !important text-wrap: nowrap'
              onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                const dropdown = document.querySelector('.custom-select__menu');
                if (e.key === 'Enter') {
                  if (!dropdown) {
                    e.preventDefault();
                    e.stopPropagation();
                    tabManager.focusManager()
                  }
                }
              }}
            />
          </div>
          <div id='account_table' className='ag-theme-quartz'>
            {
              <AgGridReact
                rowData={tableData}
                columnDefs={colDefs}
                gridOptions={gridOptions}
                onCellClicked={onCellClicked}
                onCellEditingStarted={cellEditingStarted}
                onCellEditingStopped={handleCellEditingStopped}
              />
            }
          </div>

          {(popupState.isModalOpen || popupState.isAlertOpen) && (
            <Confirm_Alert_Popup
              id='billBookAlert'
              onClose={handleClosePopup}
              onConfirm={
                popupState.isAlertOpen
                  ? handleAlertCloseModal
                  : deleteAcc
              }
              message={popupState.message}
              isAlert={popupState.isAlertOpen}
              className='absolute'
            />
          )}
          {open && (
            <CreateBillBook
              togglePopup={togglePopup}
              data={formData}
              handleConfirmPopup={handleConfirmPopup}
              isDelete={isDelete.current}
              className='absolute'
              handleDeleteFromForm={handleDeleteFromForm}
              selectedSeries={selectedSeries}
              billBookData={tableData}
            />
          )}
          {settingToggleOpen && (
            <ControlRoomSettings
              togglePopup={toggleSettingPopup}
              heading={'Invoice Settings'}
              fields={invoiceSettingFields}
              initialValues={initialValues}
            />
          )}
        </div>
      </div>
    </>
  );
};
