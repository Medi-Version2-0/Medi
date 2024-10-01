import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { BillBookForm } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import { CreateBillBook } from './CreateBillBook';
import { IoSettingsOutline } from 'react-icons/io5';
import { ControlRoomSettings } from '../../components/common/controlRoom/ControlRoomSettings';
import { invoiceSettingFields } from '../../components/common/controlRoom/settings';
import { useControls } from '../../ControlRoomContext';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { getAndSetBillBook } from '../../store/action/globalAction';
import { billBookValidationSchema } from './validation_schema';
import { useSelector } from 'react-redux'
import usePermission from '../../hooks/useRole';
import { ValueFormatterParams } from 'ag-grid-community';
import { lookupValue } from '../../helper/helper';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { useGetSetData } from '../../hooks/useGetSetData';
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
  const getAndSetBillBookHandler = useGetSetData(getAndSetBillBook);
  const { sendAPIRequest } = useApi();
  const { billBookSeries: billBookSeriesData } = useSelector((state: any) => state.global);
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

  const isDelete = useRef(false);

  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };

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
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    if (formData.billName) {
      formData.billName =
        formData.billName.charAt(0).toUpperCase() + formData.billName.slice(1);
    }
    formData.seriesId = selectedSeries;

    if (formData !== initialValue) {
      try {
        if (formData.id) {
          await sendAPIRequest(`/billBook/${formData.id}`, {
            method: 'PUT',
            body: formData,
          });
        } else {
          await sendAPIRequest(`/billBook`, {
            method: 'POST',
            body: formData,
          });
        }

        togglePopup(false);
        getAndSetBillBookHandler();
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          console.log('BillBook not created or updated');
        }
      }
    }
  };

  const handelFormSubmit = (values: BillBookForm) => {
    const mode = values.id ? 'update' : 'create';
    const existingBill = tableData.find((bill: BillBookForm) => {
      if (mode === 'create')
        return bill.billName.toLowerCase() === values.billName.toLowerCase();
      return (
        bill.billName.toLowerCase() === values.billName.toLowerCase() &&
        bill.id !== values.id
      );
    });
    if (existingBill) {
      settingPopupState(false, 'Bill with this name already exists!');
      return;
    }

    if (values !== initialValue) {
      settingPopupState(true, `Are you sure you want to ${mode} this bill?`);
      setFormData(values);
    }
  };

  const deleteAcc = async (id: string) => {
    isDelete.current = false;
    togglePopup(false);
    try {
      await sendAPIRequest(`/billBook/${id}`, {
        method: 'DELETE',
      });
      getAndSetBillBookHandler();
    } catch(error:any) {
      if (!error?.isErrorHandled) {
        settingPopupState(false, 'This bill book series is associated');
      }
    }
  };

  const handleDelete = (oldData: BillBookForm) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
    setSelectedRow(null);
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
    const { data, column, oldValue, valueChanged, node } = e;
    let { newValue } = e;
    if (newValue == oldValue) return;
    const field = column.colId;

    try {
      const billBookTableData = tableData.filter((e: any) => e.id !== data.id);
      await billBookValidationSchema(billBookTableData, selectedSeries, false).validateAt(field, { [field]: newValue });

      if (field === 'billName') {
        newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
        tableData.forEach((data: any) => {
          if (data.station_id !== e.data.station_id) {
            currTable.push(data);
          }
        });

        const existingBill = currTable.find(
          (bill: BillBookForm) =>
            bill.billName.toLowerCase() === newValue.toLowerCase()
        );

        if (existingBill) {
          settingPopupState(false, 'Bill with this name already exists!');
          node.setDataValue(field, oldValue);
          return;
        }
      }
    } catch (error: any) {
      settingPopupState(false, `${error.message}`);
      node.setDataValue(field, oldValue);
      return;
    }
    node.setDataValue(field, newValue);
    try {
      await sendAPIRequest(`/billBook/${data.id}`, {
        method: 'PUT',
        body: { [field]: newValue },
      });
      getAndSetBillBookHandler();
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('BillBook not updated');
      }
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
      togglePopup,
      selectedRow,
      undefined
    );
  };

  useHandleKeydown(handleKeyDown, [selectedRow, popupState])

  const defaultCols = {
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
    {
      headerName: 'Sequence of Bill',
      field: 'orderOfBill',
      headerClass: 'custom-header-class custom-header',
    },
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
          <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => {
              setSelectedRow(selectedRow !== null ? null : params.data);
              handleUpdate(params.data);
            }}
          />
          <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => handleDelete(params.data)}
          />
        </div>
      ),
    },
  ];

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
                  label: seriesOptions.find((s:any)=> s.value === selectedSeries)?.label,
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
                defaultColDef={defaultCols}
                onCellClicked={onCellClicked}
                onCellEditingStarted={cellEditingStarted}
                onCellEditingStopped={handleCellEditingStopped}
              />
            }
          </div>

          {(popupState.isModalOpen || popupState.isAlertOpen) && (
            <Confirm_Alert_Popup
              onClose={handleClosePopup}
              onConfirm={
                popupState.isAlertOpen
                  ? handleAlertCloseModal
                  : handleConfirmPopup
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
              handelFormSubmit={handelFormSubmit}
              isDelete={isDelete.current}
              deleteAcc={deleteAcc}
              className='absolute'
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
