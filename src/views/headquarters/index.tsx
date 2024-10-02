import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { StationFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { CreateHQ } from './CreateHQ';
import Button from '../../components/common/button/Button';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import usePermission from '../../hooks/useRole';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import useApi from '../../hooks/useApi';
import { extractKeys, lookupValue } from '../../helper/helper';
import { createHqFieldsChain, deleteHqChain, updateHqFieldsChain } from '../../constants/focusChain/hqFocusChain';

export const Headquarters = () => {
  const initialValue = { station_id: '', station_name: '', station_headQuarter: '' };
  const [open, setOpen] = useState(false);
  const [stations, setStations] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [formData, setFormData] = useState<StationFormData>(initialValue);
  const [tableData, setTableData] = useState<StationFormData[]>([]);
  const [popupState, setPopupState] = useState({ isModalOpen: false, isAlertOpen: false, message: '' });
  const [filteredStations, setFilteredStations] = useState([]);
  const { createAccess, updateAccess, deleteAccess } = usePermission('headquarters')
  const { sendAPIRequest } = useApi();
  const editing = useRef(false);
  const isDelete = useRef(false);
  const gridRef = useRef<any>(null);

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = async () => {
    const stations = await sendAPIRequest<StationFormData[]>('/station');
    const headQuarter = stations.filter((s: any) => s.station_headQuarter !== null);
    const filteredStations = stations.filter((station: any) => !headQuarter.some((hq: any) => hq.station_id === station.station_id));
    const pinnedRow = { station_id: '', station_name: '', station_headQuarter: '' };
    setTableData([...(createAccess ? [pinnedRow] : []), ...headQuarter]);
    setFilteredStations(filteredStations);
    setStations(stations);
  }

  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({ ...popupState, [isModal ? 'isModalOpen' : 'isAlertOpen']: true, [!isModal ? 'isModalOpen' : 'isAlertOpen'] :false, message: message });
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

  const handleConfirmPopup = async (data?: any) => {
    setPopupState({ ...popupState, isModalOpen: false });
    let id = 0;
    const mode = stations.some((station: any) => {
      if ((station.station_id === data.station_id || station.station_id === data.station_name) && station.station_headQuarter === null) {
        return true;
      } else if (station.station_id === data.station_id && station.station_headQuarter !== null) {
        id = +station.station_id;
        return false;
      }
    });
    try {
      if (mode === false) {
        await sendAPIRequest(`/headquarters/${id}`, { method: 'PUT', body: data });
      } else {
        if(data.station_id === ''){
          data.station_id = data.station_name; 
          delete data.station_name;
        }
        await sendAPIRequest(`/headquarters`, { method: 'POST', body: data });
      }
      togglePopup(false);
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        const errorMessage = error?.response?.data?.error?.message || 'Error in creating/updating HeadQuarters. Please try again'
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
      await sendAPIRequest(`/headquarters/${selectedRow.station_id}`, { method: 'DELETE' });
      setPopupState({ ...popupState, isAlertOpen: false  , isModalOpen :false});
      fetchData();
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        if(error?.response?.data) settingPopupState(false,error.response.data.error.message);
      }
    } finally{
      setSelectedRow(null)
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

  const stationHeadquarterMap: { [key: number]: string } = {};
  const stationOptions: { [key: number]: string } = {};

  stations.forEach((data: any) => {
    if (data.station_id !== undefined) {
      stationHeadquarterMap[data.station_id] = data.station_name;
    }
  });
  filteredStations.forEach((data: any) => {
    if (data.station_id !== undefined && data.station_headQuarter === null) {
      stationOptions[data.station_id] = data.station_name;
    }
  });

  const hqValues = extractKeys(stationHeadquarterMap);
  const stationValues = extractKeys(stationOptions);

  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { data, column, node, oldValue, newValue } = e;
    if (oldValue === newValue && node.rowIndex !== 0) return;
    const field = column.colId;

    
    if (node.rowIndex === 0 && createAccess) {
      data[field] = newValue;
      if (data.station_name && data.station_headQuarter) {
        try {
          handleConfirmPopup(data);
        } catch (error: any) {
          settingPopupState(false, error.message)
          node.setDataValue(field, oldValue);
          return;
        }
      }
    } else {
      try {
        await sendAPIRequest(`/headquarters/${data.station_id}`, { method: 'PUT', body: { [field]: newValue } });
        fetchData();
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          data[field] = oldValue;
          settingPopupState(false, error.message)
          return;
        }
      }
    }
  };

  const onCellClicked = (params: any) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    handleKeyDownCommon(event, handleDelete, handleUpdate, togglePopup, selectedRow, undefined);
  };

  useHandleKeydown(handleKeyDown, [selectedRow])

  const defaultCol = {
    flex: 1,
    filter: true,
    floatingFilter: true,
    suppressMovable: true,
    headerClass: 'custom-header custom_header_class',
    cellRenderer: (params: any) => {
      return (
        <PlaceholderCellRenderer
          value={params.valueFormatted}
          rowIndex={params.node.rowIndex}
          column={params.colDef}
          startEditingCell={(editParams: any) => {
            gridRef.current?.api?.startEditingCell(editParams);
          }}
          placeholderText={params.colDef.headerName}
        />
      );
    },
  }

  const colDefs: ColDef<StationFormData>[] = [
    {
      headerName: 'Station Name',
      field: 'station_name',
      editable: (params) => (createAccess && params.node.rowIndex === 0),
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => {
        return { values: (stationValues.length > 0 ? stationValues : ['No station left']), valueListMaxHeight: 120, valueListMaxWidth: 350, valueListGap: 8, value: params.data.station_id }
      },
      valueFormatter: (params): any =>  stationOptions[Number(params.value)] || params.value,
      valueGetter: (params): any => params.data?.station_name,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Headquarter',
      field: 'station_headQuarter',
      editable: (params) => (params.node.rowIndex === 0 && createAccess) ? createAccess : updateAccess,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => {
        return { values: hqValues, valueListMaxHeight: 120, valueListMaxWidth: 350, valueListGap: 8, value: params.data.station_headQuarter };
      },
      valueFormatter: (params: { value: string | number }) => lookupValue(stationHeadquarterMap, params.value),
      filterValueGetter: (params: { data: any }) => lookupValue(stationHeadquarterMap, params.data.station_headQuarter),
    },
    {
      headerName: 'Actions',
      sortable: false,
      filter: false,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      cellRenderer: (params: any) => (
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

  return (
    <>
      <div className='w-full relative'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Headquarters</h1>
          {createAccess && <Button id='add' type='highlight' handleOnClick={() => togglePopup(true)} > Add Headquarter </Button>}
        </div>
        <div id='account_table' className='ag-theme-quartz'>
          <AgGridReact rowData={tableData} columnDefs={colDefs} defaultColDef={defaultCol} onCellClicked={onCellClicked} onCellEditingStarted={cellEditingStarted} onCellEditingStopped={handleCellEditingStopped} />
        </div>
        {(popupState.isModalOpen || popupState.isAlertOpen) && ( <Confirm_Alert_Popup id={'viwHqAlert'} onClose={handleClosePopup} onConfirm={ popupState.isAlertOpen ? handleAlertCloseModal : deleteAcc } message={popupState.message} isAlert={popupState.isAlertOpen} className='absolute '/>)}
        {open && ( <CreateHQ togglePopup={togglePopup} data={formData} focusChain={isDelete.current ? deleteHqChain : (editing.current ? updateHqFieldsChain : createHqFieldsChain)} handleConfirmPopup={handleConfirmPopup} isDelete={isDelete.current} handleDeleteFromForm={handleDeleteFromForm} className='absolute' stations={stations} />)}
      </div>
    </>
  );
};
