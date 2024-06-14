import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import { CreateStation } from './CreateStation';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { StationFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';

const initialValue = {
  station_id: '',
  station_name: '',
  cst_sale: '',
  station_state: '',
  station_pinCode: '',
};

export const Stations = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<StationFormData | any>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<StationFormData | any>(null);
  const [stateData, setStateData] = useState([]);
  const editing = useRef(false);
  const isDelete = useRef(false);

  const electronAPI = (window as any).electronAPI;

  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  useEffect(() => {
    getStates();
    getStations();
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  const getStates = () => {
    setStateData(electronAPI.getAllStates('', 'state_name', '', '', ''));
  };

  const getStations = () => {
    setTableData(electronAPI.getAllStations('', 'station_name', '', '', ''));
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

  const handleConfirmPopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
    if (formData.station_name) {
      formData.station_name =
        formData.station_name.charAt(0).toUpperCase() +
        formData.station_name.slice(1);
    }
    if (formData !== initialValue) {
      if (formData.station_id) {
        electronAPI.updateStation(formData.station_id, formData);
      } else {
        electronAPI.addStation(formData);
      }
      togglePopup(false);
      getStations();
    }
  };

  const handelFormSubmit = (values: StationFormData) => {
    const mode = values.station_id ? 'update' : 'create';
    const existingStation = tableData.find(
      (station: StationFormData) => {
        if (mode === 'create')
          return (station.station_name.toLowerCase() === values.station_name.toLowerCase())
        return ((station.station_name.toLowerCase() === values.station_name.toLowerCase()) && (station.station_id !== values.station_id))
      }
    );
    if (existingStation) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Station with this name already exists!',
      });
      return;
    }
    if (values.station_name) {
      values.station_name =
        values.station_name.charAt(0).toUpperCase() +
        values.station_name.slice(1);
    }
    if (values.station_state) {
      stateData.map((state: any) => {
        if (values.station_state === state.state_name) {
          values.state_code = Number(`${state.state_code}`);
          delete values.station_state;
        }
      });
    }
    if (values !== initialValue) {
      setPopupState({
        ...popupState,
        isModalOpen: true,
        message: `Are you sure you want to ${mode} this Station?`,
      });
      setFormData(values);
    }
  };

  const deleteAcc = (station_id: string) => {
    electronAPI.deleteStation(station_id);
    isDelete.current = false;
    togglePopup(false);
    getStations();
  };

  const handleDelete = (oldData: StationFormData) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
    setSelectedRow(null);
  };

  const handleUpdate = (oldData: StationFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const typeMapping = {
    yes: 'Yes',
    no: 'No',
  };

  const stateCodeMap: { [key: number]: string } = {};

  stateData?.forEach((state: any) => {
    stateCodeMap[state.state_code] = state.state_name;
  });

  const extractKeys = (mappings: {
    [x: number]: string;
    yes?: string;
    no?: string;
  }) => {
    return Object.keys(mappings);
  };

  const types = extractKeys(typeMapping);
  const states = extractKeys(stateCodeMap);

  const lookupValue = (
    mappings: {
      [x: string]: any;
      [x: number]: string;
      yes?: string;
      no?: string;
    },
    key: string | number
  ) => {
    return mappings[key];
  };

  const handleCellEditingStopped = (e: any) => {
    editing.current = false;
    const { data, column, oldValue, valueChanged, node } = e;
    let { newValue } = e;
    if (!valueChanged) return;
    let field = column.colId;
    switch (field) {
      case 'station_name':
        {
          const existingStation = tableData.find(
            (station: StationFormData) =>
              station.station_name.toLowerCase() === newValue.toLowerCase()
          );
          if (existingStation) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'Station with this name already exists!',
            });
            node.setDataValue(field, oldValue);
            return;
          }
          else if (!newValue || /^\d+$/.test(newValue) || newValue.length > 100) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: !newValue
                ? 'Station Name is required'
                : /^\d+$/.test(newValue)
                  ? 'Only Numbers not allowed'
                  : 'Station name cannot exceed 100 characters',
            });
            node.setDataValue(field, oldValue);
            return;
          }
          newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
        }
        break;
      case 'cst_sale':
        {
          if (newValue) newValue = newValue.toLowerCase();
          if (!['yes', 'no'].includes(newValue)) {
            return node.setDataValue(field, oldValue);
          }
        }
        break;
      case 'station_state':
        {
          field = 'state_code';
        }
        break;
      case 'station_pinCode':
        {
          const value = `${newValue}`;
          if (
            !value ||
            (!!value && value.length !== 6) ||
            (!!value && value[0] === '0')
          ) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: !newValue
                ? 'PIN code is required'
                : value.length !== 6
                  ? `Length of PIN code must be exactly 6 digits`
                  : `PIN code doesn't start from zero`,
            });
            node.setDataValue(field, oldValue);
            return;
          }
        }
        break;
      default:
        break;
    }
    electronAPI.updateStation(data.station_id, { [field]: newValue });
    getStations();
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
      headerName: 'Station Code',
      field: 'station_id',
      flex: 1,
      menuTabs: ['filterMenuTab'],
      filter: true,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Station Name',
      field: 'station_name',
      flex: 1,
      filter: true,
      editable: true,
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'IGST Sale',
      field: 'cst_sale',
      flex: 1,
      filter: true,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: types,
      },
      valueFormatter: (params: { value: string | number }) =>
        lookupValue(typeMapping, params.value),
      headerClass: 'custom-header custom_header_class',
      suppressMovable: true,
    },
    {
      headerName: 'Station State',
      field: 'station_state',
      flex: 1,
      filter: true,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: states,
        valueListMaxHeight: 120,
        valueListMaxWidth: 192,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string | number }) =>
        lookupValue(stateCodeMap, params.value),
      headerClass: 'custom-header custom_header_class',
      suppressMovable: true,
    },
    {
      headerName: 'Pin Code',
      field: 'station_pinCode',
      flex: 1,
      filter: true,
      editable: true,
      headerClass: 'custom-header custom_header_class',
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
      cellRenderer: (params: { data: StationFormData }) => (
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
        <div className='w-full '>
          <div className="flex w-full items-center justify-between px-8 py-1">
            <h1 className="font-bold">Stations</h1>
            <Button type='highlight' className='' handleOnClick={() => togglePopup(true)}>Add Station</Button>
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
          {open && (
            <CreateStation
              togglePopup={togglePopup}
              data={formData}
              handelFormSubmit={handelFormSubmit}
              isDelete={isDelete.current}
              deleteAcc={deleteAcc}
            />
          )}
        </div>
    </>
  );
};