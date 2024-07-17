import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { BillBookForm } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';
import { CreateBillBook } from './CreateBillBook';
import { IoSettingsOutline } from 'react-icons/io5';
import { ControlRoomSettings } from '../../components/common/controlRoom/ControlRoomSettings';
import { invoiceSettingFields } from '../../components/common/controlRoom/settings';
import { useControls } from '../../ControlRoomContext';

type SeriesOption = {
  id: number;
  name: string;
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
  { id: 1, name: 'Sale Challan' },
  { id: 2, name: 'Sale Bill' },
  { id: 3, name: 'Sale Order' },
  { id: 4, name: 'Purchase Order' },
  { id: 5, name: 'Breakage Expiry Receive' },
  { id: 6, name: 'Stock Issue' },
  { id: 7, name: 'Sale Return Credit Note' },
  { id: 8, name: 'Purchase Return Debit Note' },
  { id: 9, name: 'Breakage Expiry Receive Challan' },
  { id: 10, name: 'Sale Return Challan' },
  { id: 11, name: 'Purchase Return Challan' },
  { id: 12, name: 'Breakage Expiry Issue' },
  { id: 13, name: 'Breakage Expiry Issue Challan' },
];

export const BillBook = () => {
  const { organizationId } = useParams();
  const [open, setOpen] = useState<boolean>(false);
  const [settingToggleOpen, setSettingToggleOpen] = useState<boolean>(false);
  const [selectedSeries, setSelectedSeries] = useState<string>('1');
  const [formData, setFormData] = useState<BillBookForm | any>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<BillBookForm | any>(null);
  const editing = useRef(false);
  let currTable: any[] = [];
  const { controlRoomSettings } = useControls();

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

  const getBillBook = async () => {
    const data = await sendAPIRequest<{ data: BillBookForm }>(
      `/${organizationId}/billBook?seriesId=${selectedSeries}`
    );
    setTableData(data);
  };

  useEffect(() => {
    getBillBook();
  }, [selectedSeries]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

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
      if (formData.id) {
        await sendAPIRequest(`/${organizationId}/billBook/${formData.id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        await sendAPIRequest(`/${organizationId}/billBook`, {
          method: 'POST',
          body: formData,
        });
      }

      togglePopup(false);
      getBillBook();
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
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Bill with this name already exists!',
      });
      return;
    }

    if (values !== initialValue) {
      setPopupState({
        ...popupState,
        isModalOpen: true,
        message: `Are you sure you want to ${mode} this bill?`,
      });
      setFormData(values);
    }
  };

  const deleteAcc = async (id: string) => {
    isDelete.current = false;
    togglePopup(false);
    await sendAPIRequest(`/${organizationId}/billBook/${id}`, {
      method: 'DELETE',
    });
    getBillBook();
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

  const handleSeriesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeries(event.target.value);
  };

  const companyMapping = {
    'All Companies': 'All Companies',
    'One Company': 'One Company',
  };
  const billTypeMapping = {
    'Only Cash': 'Only Cash',
    'Only Credit': 'Only Credit',
    Both: 'Both',
  };
  const lockedMapping = {
    Yes: 'Yes',
    No: 'No',
  };

  const extractKey = (mappings: {
    [x: number]: string;
    [x: string]: string;
  }) => {
    return Object.keys(mappings);
  };

  const company = extractKey(companyMapping);
  const billType = extractKey(billTypeMapping);
  const locked = extractKey(lockedMapping);

  const lookupValue = (
    mappings: {
      [x: string]: any;
      [x: number]: string;
    },
    key: string | number
  ) => {
    return mappings[key];
  };

  const handleCellEditingStopped = async (e: any) => {
    currTable = [];
    editing.current = false;
    const { data, column, oldValue, valueChanged, node } = e;
    let { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;

    switch (field) {
      case 'billName':
        {
          if (!newValue || newValue.length > 100) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: !newValue
                ? 'Bill Name is required'
                : newValue.length > 100
                  ? 'Bill name cannot exceed 100 characters'
                  : '',
            });
            node.setDataValue(field, oldValue);
            return;
          }
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
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'Bill with this name already exists!',
            });
            node.setDataValue(field, oldValue);
            return;
          }
        }
        break;
      case 'billBookPrefix':
        if (!/^[A-Z]{2}$/.test(newValue)) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: 'Prefix must contain exactly two alphabet characters',
          });
          node.setDataValue(field, oldValue);
          return;
        }
        break;
      default:
        break;
    }

    await sendAPIRequest(`/${organizationId}/billBook/${data.id}`, {
      method: 'PUT',
      body: { [field]: newValue },
    });

    getBillBook();
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        togglePopup(false);
        break;
      case 'n':
      case 'N':
        if (event.ctrlKey) {
          togglePopup(true);
        }
        break;
      case 'd':
      case 'D':
        if (event.ctrlKey && selectedRow) {
          handleDelete(selectedRow);
        }
        break;
      case 'e':
      case 'E':
        if (event.ctrlKey && selectedRow) {
          handleUpdate(selectedRow);
        }
        break;
      default:
        break;
    }
  };

  const colDefs: any[] = [
    {
      headerName: 'Series Name',
      field: 'billName',
      filter: true,
      editable: true,
      sortable: true,
      flex: 1,
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Prefix',
      field: 'billBookPrefix',
      filter: true,
      editable: true,
      flex: 1,
      headerClass: 'custom-header',
      sortable: true,
      suppressMovable: true,
      valueParser: (params: { newValue: string }) => {
        return params.newValue.toUpperCase().slice(0, 2);
      },
    },
    {
      headerName: 'Company',
      field: 'company',
      filter: true,
      editable: true,
      sortable: true,
      flex: 1,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: company,
      },
      valueFormatter: (params: { value: string | number }) =>
        lookupValue(companyMapping, params.value),
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Cash/Credit',
      field: 'billType',
      filter: true,
      editable: true,
      sortable: true,
      flex: 1,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: billType,
      },
      valueFormatter: (params: { value: string | number }) =>
        lookupValue(billTypeMapping, params.value),
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Sequence of Bill',
      field: 'orderOfBill',
      filter: true,
      headerClass: 'custom-header-class custom-header',
      editable: true,
      sortable: true,
      suppressMovable: true,
      flex: 1,
    },
    {
      headerName: 'Lock Bill',
      field: 'locked',
      filter: true,
      editable: true,
      flex: 1,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: locked,
      },
      valueFormatter: (params: { value: string | number }) =>
        lookupValue(lockedMapping, params.value),
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      sortable: false,
      suppressMovable: true,
      flex: 1,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params: { data: BillBookForm }) => (
        <div className='table_edit_buttons'>
          <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => handleUpdate(params.data)}
          />

          <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => {
              handleDelete(params.data);
            }}
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
              <Button
                type='highlight'
                handleOnClick={() => {
                  toggleSettingPopup(true);
                }}
              >
                <IoSettingsOutline />
              </Button>
              <Button type='highlight' handleOnClick={() => togglePopup(true)}>
                Add Series
              </Button>
            </div>
          </div>

          <div className='seriesSelection flex px-8 py-1 my-2 items-center gap-10'>
            <label htmlFor='series-select' className=''>
              Select Series:
            </label>
            <select
              id='series-select'
              value={selectedSeries}
              onChange={handleSeriesChange}
              className='p-2 border border-gray-300 rounded min-w-52'
            >
              {seriesOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div id='account_table' className='ag-theme-quartz'>
            {
              <AgGridReact
                rowData={tableData}
                columnDefs={colDefs}
                defaultColDef={{
                  floatingFilter: true,
                }}
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
