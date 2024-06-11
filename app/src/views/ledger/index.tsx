import React, { useEffect, useState, useRef } from 'react';
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

const ledgerValidationSchema = Yup.object().shape({
  partyName: Yup.string()
    .required('Party Name is required')
    .matches(/^\D+$/, 'Only Numbers not allowed')
    .max(100, 'Party name cannot exceed 100 characters'),
  stationName: Yup.string()
    .required('Station Name is required')
    .matches(/^\D+$/, 'Only Numbers not allowed')
    .max(100, 'Station name cannot exceed 100 characters'),
  openingBal: Yup.number()
    .required('Opening Balance is required')
    .positive('Opening Balance must be greater than 0'),
  openingBalType: Yup.string()
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
  const [tableData, setTableData] = useState<LedgerFormData | any>(null);
  const editing = useRef(false);
  const partyId = useRef('');
  const electronAPI = (window as any).electronAPI;
  const navigate = useNavigate();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const getLedgerData = () => {
    setTableData(electronAPI.getAllLedgerData('', 'partyName', '', '', ''));
  };

  useEffect(() => {
    getLedgerData();
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  const typeMapping = {
    DR: 'Debit',
    CR: 'Credit',
  };

  const extractKeys = (mappings: { [key: string]: string }) => {
    return Object.keys(mappings);
  };

  const types = extractKeys(typeMapping);
  const lookupValue = (mappings: { [key: string]: string }, key: string) => {
    return mappings[key];
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
    electronAPI.deleteLedger(partyId.current);
    getLedgerData();
  };

  const decimalFormatter = (params: ValueFormatterParams): any => {
    if (!params.value) return;
    return parseFloat(params.value).toFixed(2);
  };

  const handleDelete = (oldData: any) => {
    setPopupState({
      ...popupState,
      isModalOpen: true,
      message: 'Are you sure you want to delete the selected record ?',
    });
    partyId.current = oldData.party_id;
  };

  const handleUpdate = (oldData: any) => {
    return navigate(`/ledger`, { state: oldData });
  };

  const handleCellEditingStopped = async (e: any) => {
    if (e?.data?.isPredefinedParty === false) {
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

      if (field === 'partyName' || field === 'stationName') {
        newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
      }
      node.setDataValue(field, newValue);
      electronAPI.updateParty(data.party_id, { [field]: newValue });
      getLedgerData();
    } else {
      const { column, oldValue, node } = e;
      const field = column.colId;
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Predefined Ledgers are not editable',
      });
      node.setDataValue(field, oldValue);
    }
  };


  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'n':
      case 'N':
        if (event.ctrlKey) {
          return navigate(`/ledger`);
        }
        break;
      case 'd':
      case 'D':
        if (
          event.ctrlKey &&
          selectedRow &&
          selectedRow.isPredefinedParty === false
        ) {
          handleDelete(selectedRow);
        } else if (
          event.ctrlKey &&
          selectedRow &&
          selectedRow.isPredefinedParty === true
        ) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: 'Predefined Ledger should not be deleted',
          });
        }
        break;
      case 'e':
      case 'E':
        if (
          event.ctrlKey &&
          selectedRow &&
          selectedRow.isPredefinedParty === false
        ) {
          handleUpdate(selectedRow);
        } else if (
          event.ctrlKey &&
          selectedRow &&
          selectedRow.isPredefinedParty === true
        ) {
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

  const colDefs: any[] = [
    {
      headerName: 'Ledger Name',
      field: 'partyName',
      flex: 2,
      menuTabs: ['filterMenuTab'],
      filter: true,
      editable: (params: any) => !params.data.isPredefinedParty,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Station',
      field: 'stationName',
      flex: 1,
      filter: true,
      editable: (params: any) => !params.data.isPredefinedParty,
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Balance( ₹ )',
      field: 'openingBal',
      flex: 1,
      filter: true,
      editable: (params: any) => !params.data.isPredefinedParty,
      type: 'rightAligned',
      valueFormatter: decimalFormatter,
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',
      suppressMovable: true,
    },
    {
      headerName: 'Debit/Credit',
      field: 'openingBalType',
      filter: true,
      editable: (params: any) => !params.data.isPredefinedParty,
      cellEditor: 'agSelectCellEditor',
      flex: 1,
      cellEditorParams: {
        values: types,
      },
      valueFormatter: (params: ValueFormatterParams) =>
        lookupValue(typeMapping, params.value),
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
      cellRenderer: (params: { data: any }) => (
        <div className='table_edit_buttons'>
          <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => {
              if (params.data.isPredefinedParty === true) {
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
              if (params.data.isPredefinedParty === true) {
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
      <div className="flex justify-between mx-[1.6rem] my-8  bg-[#f3f3f3]  ">
        <h1 className="font-bold text-[#171A1FFF] m-0 ">Ledger Master</h1>
        <Button type='highlight' handleOnClick={() => navigate(`/ledger`)}>Add Party</Button>
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
        />
      )}
    </div>
  );
};