import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { CompanyFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { useNavigate } from 'react-router-dom';
import { ValueFormatterParams } from 'ag-grid-community';
import Button from '../../components/common/button/Button';
import * as Yup from 'yup';

const companyValidationSchema = Yup.object().shape({
  companyName: Yup.string()
    .required('Company Name is required')
    .matches(/^\D+$/, 'Only Numbers not allowed')
    .max(100, 'Company name cannot exceed 100 characters'),
  stationName: Yup.string(),
  openingBal: Yup.number()
    .required('Opening Balance is required')
    .positive('Opening Balance must be greater than 0'),
  openingBalType: Yup.string(),
});

const validateField = async (field: string, value: any) => {
  try {
    await companyValidationSchema.validateAt(field, { [field]: value });
    return null;
  } catch (error: any) {
    return error.message;
  }
};

export const Company = () => {
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<CompanyFormData | any>(null);
  const editing = useRef(false);
  const companyId = useRef('');
  const electronAPI = (window as any).electronAPI;
  const navigate = useNavigate();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const allStations = electronAPI.getAllStations(
    '',
    'station_name',
    '',
    '',
    ''
  );

  const getCompanyData = () => {
    const companyData = electronAPI.getAllCompany('', 'companyName', '');
    setTableData(companyData);
  };

  useEffect(() => {
    getCompanyData();
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  const typeMapping = {
    Dr: 'Debit',
    Cr: 'Credit',
  };

  const companyStationsMap: { [key: number]: string } = {};

  allStations?.forEach((data: any) => {
    companyStationsMap[data.station_id] = data.station_name;
  });

  const extractKeys = (mappings: { [key: string]: string }) => {
    return Object.values(mappings);
  };

  const extractKey = (mappings: { [key: string]: string }) => {
    return Object.keys(mappings);
  };

  const types = extractKey(typeMapping);
  const companyStations = extractKeys(companyStationsMap);

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
    electronAPI.deleteCompany(companyId.current);
    getCompanyData();
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
    companyId.current = oldData.company_id;
  };

  const handleUpdate = (oldData: any) => {
    return navigate(`/company`, { state: oldData });
  };

  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { column, oldValue, valueChanged, node } = e;
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

    if (field === 'companyName') {
      newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
    }
    node.setDataValue(field, newValue);
    getCompanyData();
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
          return navigate(`/company`);
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
      headerName: 'Company Name',
      field: 'companyName',
      flex: 2,
      menuTabs: ['filterMenuTab'],
      filter: true,
      editable: true,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Station',
      field: 'stationName',
      flex: 1,
      filter: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: companyStations,
        valueListMaxHeight: 120,
        valueListMaxWidth: 192,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string }) => {
        lookupValue(companyStationsMap, params.value);
      },
      editable: true,
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Balance( ₹ )',
      field: 'openingBal',
      flex: 1,
      filter: true,
      editable: true,
      type: 'rightAligned',
      valueFormatter: decimalFormatter,
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',
      suppressMovable: true,
    },
    {
      headerName: 'Debit/Credit',
      field: 'openingBalType',
      filter: true,
      editable: true,
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
            onClick={() => handleUpdate(params.data)}
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
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>Company Master</h1>
        <Button type='highlight' handleOnClick={() => navigate(`/company`)}>
          Add Company
        </Button>
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
            popupState.isAlertOpen ? handleAlertCloseModal : handleConfirmPopup
          }
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
    </div>
  );
};