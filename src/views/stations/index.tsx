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
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { stationValidationSchema } from './validation_schema';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import usePermission from '../../hooks/useRole';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { extractKeys, lookupValue, removeNullUndefinedEmptyString } from '../../helper/helper';
import useApi from '../../hooks/useApi';
import { ColDef, GridOptions } from 'ag-grid-community';
import { createStationFieldsChain, deleteStationChain } from '../../constants/focusChain/stationFocusChain';

export const Stations = () => {
  const initialValue = { station_id: '', station_name: '', state_code: '', station_pinCode: '' };
  const [open, setOpen] = useState<boolean>(false);
  const [stateData, setStateData] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<StationFormData | any>(null);
  const [formData, setFormData] = useState<StationFormData | any>(initialValue);
  const [popupState, setPopupState] = useState({ isModalOpen: false, isAlertOpen: false, message: '' });
  const { createAccess, updateAccess, deleteAccess } = usePermission('station')
  const editing = useRef(false);
  const gridRef = useRef<any>(null);
  const isDelete = useRef(false);
  const { sendAPIRequest } = useApi();

  useEffect(() => {
    fetchData()
  }, []);

  const fetchData = async () => {
    const stations = await sendAPIRequest<StationFormData[]>('/station');
    const states = await sendAPIRequest<any[]>('/state');
    const updatedStations = stations.map((station: any) => ({ ...station, igst_sale: station.igst_sale === true ? 'Yes' : 'No' }));
    setTableData([...(createAccess ? [initialValue] : []), ...updatedStations]);
    setStateData(states);
  }

  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({ ...popupState, [isModal ? 'isModalOpen' : 'isAlertOpen']: true, message: message });
  };

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialValue);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false, isModalOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async (data?: any) => {
    setPopupState({ ...popupState, isModalOpen: false });
    try {
      data = removeNullUndefinedEmptyString(data);
      if (data !== initialValue) {
        if (data.station_id) {
          await sendAPIRequest(`/station/${formData.station_id}`, { method: 'PUT', body: data });
        } else {
          await sendAPIRequest(`/station`, { method: 'POST', body: data });
        }         
        togglePopup(false);
      }
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        const errorMessage = error?.response?.data?.error?.message || 'Error in creating stations. Please try again'
        settingPopupState(false, `${errorMessage}`);
        console.log('Station not created or updated',error)
      }
    }
    await fetchData();
  };

  function handleDeleteFromForm() {
    settingPopupState(true, 'Are you sure you want to delete');
  }

  const deleteAcc = async (station_id?: string) => {
    isDelete.current = false;
    togglePopup(false);
    try {
      await sendAPIRequest(`/station/${selectedRow.station_id}`, { method: 'DELETE' });
      // handleAlertCloseModal();
      setPopupState({ ...popupState, isAlertOpen: false, isModalOpen: false });
      fetchData();
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        if(error?.response?.data) settingPopupState(false,error.response.data.error.message);
      }
    }
    finally{
      setSelectedRow(null);
    }
  };

  const handleDelete = (oldData: StationFormData) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
  };

  const handleUpdate = (oldData: StationFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const stateCodeMap: { [key: number]: string } = {};
  stateData?.forEach((state: any) => stateCodeMap[state.state_code] = state.state_name);
  const states = extractKeys(stateCodeMap);

  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { data, column, oldValue, valueChanged, node } = e;
    let { newValue } = e;
    if (!valueChanged && node.rowIndex !== 0) return;
    const field = column.colId;
    if (field === 'station_name' && !!newValue) {
      newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
      const dataToCompare = tableData.filter((d: any) => data.station_id !== d.station_id);
      const existingStation = dataToCompare?.find((station: StationFormData) => station.station_name.toLowerCase() === newValue.toLowerCase());
      if (existingStation) {
        settingPopupState(false, 'Station with this name already exists!');
        node.setDataValue(field, oldValue);
        return;
      }
    }
    if (node.rowIndex === 0 && createAccess) {
      try {
        await stationValidationSchema.validateAt(field, { [field]: newValue });
        if (data.state_code && data.station_name && data.station_pinCode) {
          handleConfirmPopup(data)
          return;
        }
      } catch (error: any) {
        settingPopupState(false, error.message)
        node.setDataValue(field, oldValue);
        return;
      }
    } else {
      try {
        if (!data.state_code || !data.station_name || !data.station_pinCode) {
          data[field] = oldValue;
          settingPopupState(false, 'Station name, Station state or Pin code cannot be left empty.');
          return;
        }
        const isValid = await stationValidationSchema.validateAt(field, { [field]: newValue });
        if (isValid) {
          await sendAPIRequest(`/station/${data.station_id}`, {
            method: 'PUT',
            body: { 
              [field]: newValue,
              state_code: data.state_code,
            },
          });
        }
        fetchData();
      } catch (error: any) {
        data[field] = oldValue;
        settingPopupState(false, error.message)
        return;
      }
    }
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };
  
  const cellEditingStarted = () => {
    editing.current = true;
  };
  
  const handleKeyDown = (event: KeyboardEvent) => {
    handleKeyDownCommon(event, handleDelete, handleUpdate, togglePopup, selectedRow, undefined);
  };

  useHandleKeydown(handleKeyDown, [selectedRow])

  const columnDefs: ColDef[] = [
    { headerName: 'Station Name', field: 'station_name' },
    {
      headerName: 'Station State',
      field: 'state_code',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => {
        return { values: states, valueListMaxHeight: 120, valueListMaxWidth: 230, valueListGap: 8, value: params.data.state_code }
      },
      valueFormatter: (params: { value: string | number }) => lookupValue(stateCodeMap, params.value),
      valueGetter: (params: { data: any }) => lookupValue(stateCodeMap, params.data.state_code),
      filterValueGetter: (params: { data: any }) => lookupValue(stateCodeMap, params.data.state_code),
      headerClass: 'custom-header custom_header_class',
    },
    { headerName: 'Pin Code', field: 'station_pinCode', headerClass: 'custom-header custom_header_class', cellEditorParams: { values: [], maxLength: 6 } },
    { headerName: 'IGST Sale', field: 'igst_sale', editable: false },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      sortable: false,
      editable: false,
      floatingFilter: false,
      filter: false,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      cellRenderer: (params: { data: StationFormData, node: any }) => (
        <div className='table_edit_buttons'>
          {params.node.rowIndex !== 0 && (
            <>
              <FaEdit style={{ cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => handleUpdate(params.data)} />
              <MdDeleteForever style={{ cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => handleDelete(params.data)} />
            </>
          )}
        </div>
      ),
    },
  ];

  const gridOptions: GridOptions<any> = {
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [20, 30, 40],
    defaultColDef: {
      editable: (params: any) => params.node.rowIndex === 0 ? createAccess : updateAccess,
      flex: 1,
      filter: true,
      floatingFilter: true,
      headerClass: 'custom-header',
      suppressMovable: true,
      cellRenderer: (params: any) => (
        <PlaceholderCellRenderer
          value={params.value}
          rowIndex={params.node.rowIndex}
          column={params.colDef}
          startEditingCell={(editParams: any) => gridRef.current?.api?.startEditingCell(editParams)}
          placeholderText={params.colDef.headerName}
        />
      ),
    },
  };

  return (
    <>
      <div className='w-full relative'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Stations</h1>
          {createAccess && <Button type='highlight' id='add' handleOnClick={() => {
            setFormData(initialValue);
            togglePopup(true)
          }}>
            Add Station
          </Button>}
        </div>
        <div id='account_table' className='ag-theme-quartz'>
          <AgGridReact rowData={tableData} columnDefs={columnDefs} gridOptions={gridOptions} onCellClicked={onCellClicked} onCellEditingStarted={cellEditingStarted} onCellEditingStopped={handleCellEditingStopped}/>
        </div>
        {(popupState.isModalOpen || popupState.isAlertOpen) && (<Confirm_Alert_Popup id='viewStationAlert' onClose={handleClosePopup} onConfirm={popupState.isAlertOpen ? handleAlertCloseModal : deleteAcc} message={popupState.message} isAlert={popupState.isAlertOpen} className='absolute' />)}
        {open && (<CreateStation togglePopup={togglePopup} focusChain={isDelete.current ? deleteStationChain : createStationFieldsChain} data={formData} handleConfirmPopup={handleConfirmPopup} isDelete={isDelete.current} handleDeleteFromForm={handleDeleteFromForm} className='absolute' states={stateData} />)}
      </div>
    </>
  );
};
