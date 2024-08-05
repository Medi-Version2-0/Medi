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
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { useSelector, useDispatch } from 'react-redux';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import { setStation } from '../../store/action/globalAction';
import usePermission from '../../hooks/useRole';

export const Headquarters = () => {
  const initialValue = {
    station_id: '',
    station_name: '',
    station_headQuarter: '',
  };
  const { organizationId } = useParams();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<StationFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<StationFormData[]>([]);
  const { stations: allStations } = useSelector((state: any) => state.global);
  const [filteredStations, setFilteredStations] = useState([]);
  const { createAccess, updateAccess, deleteAccess } = usePermission('headquarters')

  const editing = useRef(false);
  const isDelete = useRef(false);
  const gridRef = useRef<any>(null);
  const dispatch = useDispatch()

  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

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

  const filterStations = async (headQuarter?: any) => {
    const filtered = allStations.filter(
      (station: any) =>
        !headQuarter.some((hq: any) => hq.station_id === station.station_id)
    );
    return filtered;
  }

  const getHeadquarters = useCallback(async () => {
    const headQuarter = await sendAPIRequest<StationFormData[]>(
      `/${organizationId}/station/headQuarter`
    );
    const pinnedRow = {
      station_id: '',
      station_name: '',
      station_headQuarter: '',
    };
    setTableData([...(createAccess ? [pinnedRow] : []), ...headQuarter]);

    const filteredStations = await filterStations(headQuarter);

    setFilteredStations(filteredStations);
    return headQuarter;
  }, []);

  useEffect(() => {
    getHeadquarters();
  }, [getHeadquarters]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyDownCommon(
        event,
        handleDelete,
        handleUpdate,
        togglePopup,
        selectedRow,
        undefined
      );
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

  const handleConfirmPopup = async (data?: any) => {
    const respData = data ? data : formData;
    setPopupState({ ...popupState, isModalOpen: false });
    if (formData.station_name) {
      formData.station_name =
        formData.station_name.charAt(0).toUpperCase() +
        formData.station_name.slice(1);
    }

    const payload = {
      station_name: respData.station_name || formData.station_name,
      station_headQuarter:
        respData.station_headQuarter || formData.station_headQuarter,
    };

    if (formData !== initialValue) {
      let id = 0;
      const mode = allStations.some((station: any) => {
        if (
          station.station_name ===
          (formData.station_name || payload.station_name) &&
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
        await sendAPIRequest(`/${organizationId}/station/headQuarter/${id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        await sendAPIRequest(`/${organizationId}/station/headQuarter`, {
          method: 'POST',
          body: payload,
        });
      }

      const stations = await sendAPIRequest<any[]>(`/${organizationId}/station`);
      dispatch(setStation(stations))
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
    await sendAPIRequest(
      `/${organizationId}/station/headQuarter/${station_id}`,
      {
        method: 'DELETE',
      }
    );
    const updatedStation = [...allStations]
    const stationIndex = allStations.findIndex((x: any) => x.station_id === station_id);
    updatedStation[stationIndex] = { ...updatedStation[stationIndex], station_headQuarter: null }
    dispatch(setStation(updatedStation))
    filterStations(updatedStation);
    getHeadquarters();
  };

  const stationHeadquarterMap: { [key: number]: string } = {};
  allStations.forEach((data: any) => {
    if (data.station_id !== undefined) {
      stationHeadquarterMap[+data.station_id] = data.station_name;
    }
  });

  const stationOptions: { [key: number]: string } = {};
  filteredStations.forEach((data: any) => {
    if (data.station_id !== undefined && data.station_headQuarter === null) {
      stationOptions[+data.station_id] = data.station_name;
    }
  });

  const stationValues = Object.keys(stationOptions).map((key) => Number(key));

  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { data, column, node, oldValue, newValue } = e;
    if (oldValue === newValue) return;
    const field = column.colId;

    const stationName = await allStations.filter(
      (e: any) => newValue === e.station_id
    );

    data[field] = field == 'station_name' ? stationName[0]?.station_name : newValue;

    if (node.rowIndex === 0 && createAccess) {
      if (data.station_name && data.station_headQuarter) {
        try {
          handleConfirmPopup(data);
        } catch (error: any) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: error.message,
          });
          return;
        }
      }
    } else {
      await sendAPIRequest(
        `/${organizationId}/station/headQuarter/${data.station_id}`,
        {
          method: 'PUT',
          body: { [field]: +newValue },
        }
      );
      getHeadquarters();
    }
  };

  const onCellClicked = (params: any) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const colDefs: ColDef<StationFormData>[] = [
    {
      headerName: 'Station Name',
      field: 'station_name',
      flex: 1,
      filter: true,
      editable: (params) => (createAccess && params.node.rowIndex === 0),
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: stationValues.length > 0 ? Object.keys(stationOptions).map((key) => Number(key)) : ['No station left'],
        valueListMaxHeight: 120,
        valueListMaxWidth: 308,
        valueListGap: 8,
      },
      valueFormatter: (params): any => {
        return stationOptions[Number(params.value)] || params.value;
      },
      headerClass: 'custom-header',
      suppressMovable: true,
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
    },
    {
      headerName: 'Headquarter',
      field: 'station_headQuarter',
      flex: 1,
      filter: true,
      editable: (params) => (params.node.rowIndex === 0 && createAccess) ? createAccess : updateAccess,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: Object.keys(stationHeadquarterMap).map((key) => Number(key)),
        valueListMaxHeight: 120,
        valueListMaxWidth: 308,
        valueListGap: 8,
      },
      valueFormatter: (params) =>
        stationHeadquarterMap[Number(params.value)] || params.value,
      headerClass: 'custom-header custom_header_class',
      suppressMovable: true,
      cellRenderer: (params: any) => (
        <PlaceholderCellRenderer
          value={params.valueFormatted}
          rowIndex={params.node.rowIndex}
          column={params.colDef}
          startEditingCell={(editParams: any) => {
            gridRef.current?.api?.startEditingCell(editParams);
          }}
          placeholderText={params.colDef.headerName}
        />
      ),
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
          {updateAccess && <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => handleUpdate(params.data)}
          />}
          {deleteAccess && <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => handleDelete(params.data)}
          />}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className='w-full relative'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Headquarters</h1>
          {createAccess && <Button
            type='highlight'
            className=''
            handleOnClick={() => togglePopup(true)}
          >
            Add Headquarter
          </Button>}
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
