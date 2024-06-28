import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { LedgerFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { useNavigate } from 'react-router-dom';
import { ValueFormatterParams } from 'ag-grid-community';
import Button from '../../components/common/button/Button';
import * as Yup from 'yup';
import { sendAPIRequest } from '../../helper/api';

const ledgerValidationSchema = Yup.object().shape({
  partyName: Yup.string()
    .required('Party Name is required')
    .matches(/^\D+$/, 'Only Numbers not allowed')
    .max(100, 'Party name cannot exceed 100 characters'),
  stationName: Yup.string(),
  openingBal: Yup.number()
    .required('Opening Balance is required')
    .positive('Opening Balance must be greater than 0'),
  openingBalType: Yup.string(),
});

const validateField = async (field: string, value: any) => {
  try {
    await ledgerValidationSchema.validateAt(field, { [field]: value });
    return null;
  } catch (error: any) {
    return error.message;
  }
};

export const Ledger = () => {
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<LedgerFormData[]>([]);
  const editing = useRef(false);
  const partyId = useRef('');
  const navigate = useNavigate();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const fetchStations = useCallback(() => {
    return sendAPIRequest<any[]>('/station');
  }, []);

  const fetchLedgerData = useCallback(async () => {
    const data = await sendAPIRequest<any[]>('/ledger', {
      method: 'GET',
    });
    data.map((e) => (e.stationName = e.Station?.station_name || ''));
    setTableData(data);
  }, []);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'n':
        case 'N':
          if (event.ctrlKey) navigate(`/ledger`);
          break;
        case 'd':
        case 'D':
          if (event.ctrlKey && selectedRow && !selectedRow.isPredefinedLedger)
            handleDelete(selectedRow);
          else if (event.ctrlKey && selectedRow?.isPredefinedLedger) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'Predefined Ledger should not be deleted',
            });
          }
          break;
        case 'e':
        case 'E':
          if (event.ctrlKey && selectedRow && !selectedRow.isPredefinedLedger)
            handleUpdate(selectedRow);
          else if (event.ctrlKey && selectedRow?.isPredefinedLedger) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'Predefined Ledger are not editable',
            });
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRow, navigate, popupState]);

  const typeMapping = useMemo(() => ({ Dr: 'DR', Cr: 'CR' }), []);

  const ledgerStationsMap = useMemo(() => {
    const map: { [key: number]: string } = {};
    fetchStations().then((e) =>
      e.forEach((data: any) => {
        map[data.station_id] = data.station_name;
      })
    );
    return map;
  }, [fetchStations()]);

  const types = useMemo(() => Object.keys(typeMapping), [typeMapping]);
  const ledgerStations = useMemo(
    () => Object.values(ledgerStationsMap),
    [ledgerStationsMap]
  );

  const lookupValue = (
    mappings: { [key: string]: string; [key: number]: string },
    key: string
  ) => mappings[key];

  const handleAlertCloseModal = () =>
    setPopupState({ ...popupState, isAlertOpen: false });

  const handleClosePopup = () =>
    setPopupState({ ...popupState, isModalOpen: false });

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    await sendAPIRequest(`/ledger/${partyId.current}`, { method: 'DELETE' });
    fetchLedgerData();
  };

  const decimalFormatter = (params: ValueFormatterParams): any =>
    params.value ? parseFloat(params.value).toFixed(2) : '';

  const handleDelete = (oldData: any) => {
    setPopupState({
      ...popupState,
      isModalOpen: true,
      message: 'Are you sure you want to delete the selected record?',
    });
    partyId.current = oldData.party_id;
  };

  const handleUpdate = (oldData: any) =>
    navigate(`../ledger`, { state: oldData, replace: true });

  const handleCellEditingStopped = async (e: any) => {
    if (!e.data.isPredefinedLedger) {
      editing.current = false;
      const { column, oldValue, valueChanged, node, data } = e;
      let { newValue } = e;

      if (!valueChanged) return;

      const field = column.colId;
      const errorMessage = await validateField(field, newValue);
      if (errorMessage) {
        setPopupState({
          ...popupState,
          isAlertOpen: true,
          message: errorMessage,
        });
        node.setDataValue(field, oldValue);
        return;
      }

      if (field === 'partyName')
        newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
      node.setDataValue(field, newValue);
      await sendAPIRequest(`/ledger/${data.party_id}`, {
        method: 'PUT',
        body: { [field]: newValue },
      });
      fetchLedgerData();
    } else {
      const { column, oldValue, node } = e;
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Predefined Ledgers are not editable',
      });
      node.setDataValue(column.colId, oldValue);
    }
  };

  const onCellClicked = (params: { data: any }) =>
    setSelectedRow(selectedRow !== null ? null : params.data);

  const cellEditingStarted = () => (editing.current = true);

  const colDefs = [
    {
      headerName: 'Ledger Name',
      field: 'partyName',
      flex: 2,
      filter: 'agTextColumnFilter',
      editable: (params: any) => !params.data.isPredefinedLedger,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Station',
      field: 'stationName',
      flex: 1,
      filter: 'agTextColumnFilter',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ledgerStations },
      valueFormatter: (params: { value: string }) =>
        lookupValue(ledgerStationsMap, params.value),
      editable: (params: any) =>
        !params.data.isPredefinedGroup &&
        (params.data.accountGroup === 'SUNDRY CREDITORS' ||
          params.data.group_code === 'SUNDRY DEBTORS'),
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Balance( ₹ )',
      field: 'openingBal',
      flex: 1,
      filter: 'agNumberColumnFilter',
      editable: (params: any) => !params.data.isPredefinedLedger,
      type: 'rightAligned',
      valueFormatter: decimalFormatter,
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',
      suppressMovable: true,
    },
    {
      headerName: 'Debit/Credit',
      field: 'openingBalType',
      flex: 1,
      filter: 'agTextColumnFilter',
      editable: (params: any) => !params.data.isPredefinedLedger,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: types },
      valueFormatter: (params: ValueFormatterParams) =>
        lookupValue(typeMapping, params.value),
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      suppressMovable: true,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params: { data: any }) => (
        <div className='table_edit_buttons'>
          <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => {
              if (params.data.isPredefinedLedger) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: 'Predefined Ledger are not editable',
                });
              } else {
                handleUpdate(params.data);
              }
            }}
          />
          <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => {
              if (params.data.isPredefinedLedger) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: 'Predefined Ledger should not be deleted',
                });
              } else {
                handleDelete(params.data);
              }
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>Ledger Master</h1>
        <Button
          type='highlight'
          handleOnClick={() => navigate('../ledger', { replace: true })}
        >
          Add Ledger
        </Button>
      </div>
      <div id='account_table' className='ag-theme-quartz'>
        <AgGridReact
          rowData={tableData}
          columnDefs={colDefs}
          defaultColDef={{ floatingFilter: true }}
          onCellClicked={onCellClicked}
          onCellEditingStarted={cellEditingStarted}
          onCellEditingStopped={handleCellEditingStopped}
        />
      </div>
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          onClose={handleClosePopup}
          onConfirm={
            popupState.isAlertOpen ? handleAlertCloseModal : handleConfirmPopup
          }
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
    </div>
  );
};
