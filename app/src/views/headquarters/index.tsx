import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { StationFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { CreateHQ } from './CreateHQ';
import Button from '../../components/common/button/Button';

const initialValue = {
  station_id: '',
  station_name: '',
  station_headQuarter: '',
};

export const Headquarters = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<StationFormData | any>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<StationFormData | any>(null);
  const editing = useRef(false);
  const isDelete = useRef(false);

  const electronAPI = (window as any).electronAPI;
  const allStations = electronAPI.getAllStations('', 'station_name', '', '', '');

  const getStationId = (station_name : string) =>{
    const selectedHq = allStations.find((item: StationFormData) => item.station_name === station_name);
    return selectedHq.station_id;
  }

  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  useEffect(() => {
    getStations();
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  const getStations = () => {
    const allStations = electronAPI.getAllStations('', 'station_name', '', '', '');
    const selectedSt = allStations.filter((item: StationFormData) => item.station_headQuarter!=='');
    setTableData(selectedSt);
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
    const allData = electronAPI.getAllStations('', 'station_name', '', '', '');
    const selectedHq = allData.find((item: StationFormData) => item.station_id===values.station_id);
    const mode = selectedHq.station_headQuarter!=='' ? 'update' : 'create';
    if (values.station_headQuarter) {
      allData.map((station: any) => {
        if (values.station_headQuarter === station.station_name) {
          values.station_headQuarter = station.station_id;
          delete values.station_headQuarter;
        }
      });
    }
    if (values !== initialValue) {
      setPopupState({
        ...popupState,
        isModalOpen: true,
        message: `Are you sure you want to ${mode} this Headquarter?`,
      });
      setFormData(values);
    }
  };

  const deleteAcc = (station_id: string) => {
    electronAPI.updateStation(station_id, { ['station_headquarter']: '' });
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

  const stationHeadquarterMap: { [key: number]: string } = {};

  allStations?.forEach((data: any) => {
    stationHeadquarterMap[data.station_id] = data.station_name;
  });

  const extractKeys = (mappings: {
    [x: string]: string;
  }) => {

    return Object.values(mappings);
  };

  const stationHeadquarters = extractKeys(stationHeadquarterMap);

  const lookupValue = (
    mappings: {
      [x: string]: any;
      [x: number]: string;
    },
    key: string
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
          if (!newValue || /^\d+$/.test(newValue) || newValue.length > 100) {
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
      case 'station_state':
        {
          field = 'state_code';
        }
        break;
      case 'station_headQuarter':
        {
          field = 'station_headQuarter';
        }
        break;
      default:
        break;
    }
    if(field==='station_headQuarter')
      {
        const newValue2 = getStationId(newValue);
        electronAPI.updateStation(data.station_id, { [field]: newValue2 })
      }
    else electronAPI.updateStation(data.station_id, { [field]: newValue })
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
      headerName: 'Station Name',
      field: 'station_name',
      flex: 1,
      filter: true,
      editable: false,
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Headquarter',
      field: 'station_headQuarter',
      flex: 1,
      filter: true,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: stationHeadquarters,
        valueListMaxHeight: 120,
        valueListMaxWidth: 330,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string }) => {
        lookupValue(stationHeadquarterMap, params.value)
      },
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
          <h1 className="font-bold">Headquarters</h1>
          <Button type='highlight' className='' handleOnClick={() => togglePopup(true)}>Add Headquarter</Button>
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
          <CreateHQ
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