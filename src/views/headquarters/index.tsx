import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';

const initialValue: StationFormData = {
  station_id: '',
  station_name: '',
  station_headQuarter: '',
};

export const Headquarters = () => {
  const { organizationId } = useParams();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<StationFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<StationFormData[]>([]);
  const [allStations, setAllStations] = useState<StationFormData[]>([]);
  const editing = useRef(false);
  const isDelete = useRef(false);

  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const getStations = useCallback(async () => {
    const stations = await sendAPIRequest<any[]>(`/${organizationId}/station`);
    setAllStations(stations);
  }, []);
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
  const getHeadquarters = useCallback(async () => {
    const headQuarter = await sendAPIRequest<StationFormData[]>(
      `/${organizationId}/station/headQuarter`
    );
    setTableData(headQuarter);
  }, []);

  useEffect(() => {
    getStations();
    getHeadquarters();
  }, [getStations, getHeadquarters]);

  useEffect(() => {
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

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

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
    if (formData.station_name) {
      formData.station_name =
        formData.station_name.charAt(0).toUpperCase() +
        formData.station_name.slice(1);
    }
    if (formData !== initialValue) {
      let id = 0;
      const mode = allStations.some((station: any) => {
        if (
          station.station_name === formData.station_name &&
          station.station_headQuarter === null
        ) {
          return true;
        } else if (
          station.station_name === formData.station_name &&
          station.station_headQuarter !== null
        ) {
          id = +station.station_id;
          return false;
        }
      });
      if (mode === false) {
        await sendAPIRequest(
          `/${organizationId}/station/headQuarter/${formData.station_id}/${id}`,
          {
            method: 'PUT',
            body: formData,
          }
        );
      } else {
        await sendAPIRequest(`/${organizationId}/station/headQuarter`, {
          method: 'POST',
          body: formData,
        });
      }
      togglePopup(false);
      getHeadquarters();
    }
  };

  const handleFormSubmit = (values: StationFormData) => {
    const mode = allStations.some((station: any) => {
      if (
        station.station_name === values.station_name &&
        station.station_headQuarter === null
      ) {
        return true;
      } else if (
        station.station_name === values.station_name &&
        station.station_headQuarter !== null
      ) {
        return false;
      }
    });
    if (values !== initialValue) {
      setPopupState({
        ...popupState,
        isModalOpen: true,
        message: `Are you sure you want to ${mode === false ? 'update' : 'create'} this Headquarter?`,
      });
      setFormData(values);
    }
  };

  const deleteAcc = async (station_id: string) => {
    isDelete.current = false;
    togglePopup(false);
    await sendAPIRequest(`/${organizationId}/station/headQuarter/${station_id}`, {
      method: 'DELETE',
    });
    getHeadquarters();
  };

  const stationHeadquarterMap: { [key: number]: string } = {};
  allStations.forEach((data) => {
    if (data.station_id !== undefined) {
      stationHeadquarterMap[+data.station_id] = data.station_name;
    }
  });

  const colDefs: ColDef<StationFormData>[] = [
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
        values: Object.keys(stationHeadquarterMap).map((key) => Number(key)),
        valueListMaxHeight: 120,
        valueListMaxWidth: 330,
        valueListGap: 8,
      },
      valueFormatter: (params) =>
        stationHeadquarterMap[Number(params.value)] || params.value,
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
      cellRenderer: (params: any) => (
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

  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { data, column, valueChanged } = e;
    if (!valueChanged) return;

    const field = column.colId;
    const newValue = e.newValue;
    await sendAPIRequest(
      `/${organizationId}/station/headQuarter/${data.station_id}`,
      {
        method: 'PUT',
        body: { [field]: +newValue },
      }
    );
    getHeadquarters();
  };

  const onCellClicked = (params: any) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  return (
    <>
      <div className='w-full relative'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Headquarters</h1>
          <Button
            type='highlight'
            className=''
            handleOnClick={() => togglePopup(true)}
          >
            Add Headquarter
          </Button>
        </div>
        <div id='account_table' className='ag-theme-quartz'>
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
          <CreateHQ
            togglePopup={togglePopup}
            data={formData}
            handelFormSubmit={handleFormSubmit}
            isDelete={isDelete.current}
            deleteAcc={deleteAcc}
            className='absolute'
          />
        )}
      </div>
    </>
  );
};
