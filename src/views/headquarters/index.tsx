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
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { useSelector } from 'react-redux';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import { getAndSetStations } from '../../store/action/globalAction';
import usePermission from '../../hooks/useRole';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { useGetSetData } from '../../hooks/useGetSetData';
import useApi from '../../hooks/useApi';

export const Headquarters = () => {
  const initialValue = {
    station_id: '',
    station_name: '',
    station_headQuarter: '',
  };
  const [open, setOpen] = useState(false);
  const { sendAPIRequest } = useApi();
  const [formData, setFormData] = useState<StationFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<StationFormData[]>([]);
  const { stations: allStations } = useSelector((state: any) => state.global);
  const [filteredStations, setFilteredStations] = useState([]);
  const { createAccess, updateAccess, deleteAccess } = usePermission('headquarters')

  const editing = useRef(false);
  const isDelete = useRef(false);
  const gridRef = useRef<any>(null);
  const getAndSetHeadQuarterHandler = useGetSetData(getAndSetStations);

  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
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
  useEffect(() => {
    const headQuarter = allStations.filter((s: any) => s.station_headQuarter !== null)
    const pinnedRow = {
      station_id: '',
      station_name: '',
      station_headQuarter: '',
    };
    setTableData([...(createAccess ? [pinnedRow] : []), ...headQuarter]);
    const filteredStations = allStations.filter((station: any) =>
      !headQuarter.some((hq: any) => hq.station_id === station.station_id)
    );
    setFilteredStations(filteredStations);
  }, [allStations, createAccess])

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
  useHandleKeydown(handleKeyDown, [selectedRow])

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
    try {
      if (mode === false) {
        await sendAPIRequest(`/headquarters/${id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        await sendAPIRequest(`/headquarters`, {
          method: 'POST',
          body: payload,
        });
      }
      getAndSetHeadQuarterHandler();
      togglePopup(false);
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('HeadQuarter not created or updated');
      }
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
      settingPopupState(true, `Are you sure you want to ${mode === false ? 'update' : 'create'} this Headquarter?`)
      setFormData(values);
    }
  };

  const deleteAcc = async (station_id: string) => {
    isDelete.current = false;
    togglePopup(false);
    try {
      await sendAPIRequest(
        `/headquarters/${station_id}`,
        {
          method: 'DELETE',
        }
      );
      getAndSetHeadQuarterHandler();
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Station not deleted');
      }
    }
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
          settingPopupState(false, error.message)
          return;
        }
      }
    } else {
      try {
        await sendAPIRequest(
          `/headquarters/${data.station_id}`,
          {
            method: 'PUT',
            body: { [field]: +newValue },
          }
        );
        getAndSetHeadQuarterHandler();
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          console.log('Station not updated');
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
      cellEditorParams: {
        values: stationValues.length > 0 ? stationValues : ['No station left'],
        valueListMaxHeight: 120,
        valueListMaxWidth: 308,
        valueListGap: 8,
      },
      valueFormatter: (params): any => {
        return stationOptions[Number(params.value)] || params.value;
      },
      valueGetter: (params): any => params.data?.station_name,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Headquarter',
      field: 'station_headQuarter',
      editable: (params) => (params.node.rowIndex === 0 && createAccess) ? createAccess : updateAccess,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params: any) => {
        return {
          values: Object.keys(stationHeadquarterMap).map((key) => Number(key)),
          valueListMaxHeight: 120,
          valueListMaxWidth: 308,
          valueListGap: 8,
        }
      },
      valueFormatter: (params) =>
        stationHeadquarterMap[Number(params.value)] || params.value,
    },
    {
      headerName: 'Actions',
      sortable: false,
      filter: false,
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
            defaultColDef={defaultCol}
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
            stations={allStations}
          />
        )}
      </div>
    </>
  );
};
