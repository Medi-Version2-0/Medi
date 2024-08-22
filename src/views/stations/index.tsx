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
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';
import { IoSettingsOutline } from 'react-icons/io5';
import { ControlRoomSettings } from '../../components/common/controlRoom/ControlRoomSettings';
import { stationSettingFields } from '../../components/common/controlRoom/settings';
import { useControls } from '../../ControlRoomContext';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { stationValidationSchema } from './validation_schema';
import { useDispatch } from 'react-redux'
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import usePermission from '../../hooks/useRole';
import { useSelector } from 'react-redux';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { extractKeys, lookupValue } from '../../helper/helper';
import { getAndSetStations } from '../../store/action/globalAction';
import { AppDispatch } from '../../store/types/globalTypes';

export const Stations = () => {
  const initialValue = {
    station_id: '',
    station_name: '',
    igst_sale: '',
    state_code: '',
    station_pinCode: '',
  };
  const { organizationId } = useParams();
  const [open, setOpen] = useState<boolean>(false);
  const [settingToggleOpen, setSettingToggleOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<StationFormData | any>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<StationFormData | any>(null);
  const [stateData, setStateData] = useState<any[]>([]);
  const editing = useRef(false);
  const dispatch = useDispatch<AppDispatch>()
  let currTable: any[] = [];
  const gridRef = useRef<any>(null);
  const { stations } = useSelector((state: any) => state.global);
  const { createAccess, updateAccess, deleteAccess } = usePermission('station_setup')

  const { controlRoomSettings } = useControls();

  const initialValues = {
    igstSaleFacility: controlRoomSettings.igstSaleFacility || false,
  };

  const isDelete = useRef(false);

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

  useEffect(() => {
    sendAPIRequest<any[]>('/state').then((response) => {
      setStateData(response);
    })
  }, []);

  useEffect(() => {
    setTableData([...(createAccess ? [initialValue] : []), ...stations])
  }, [stations])

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialValue);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };
  const toggleSettingPopup = (isOpen: boolean) => {
    setSettingToggleOpen(isOpen);
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false, isModalOpen: false });
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
      station_name: respData.station_name ? respData.station_name : formData.station_name,
      state_code: respData.state_code ? respData.state_code : formData.state_code,
      station_pinCode: respData.station_pinCode ? respData.station_pinCode : formData.station_pinCode,
      igst_sale: respData.igst_sale ? respData.igst_sale : formData.igst_sale,
    };

    if (payload !== initialValue) {
      formData.state_code = +formData.state_code;
      if (formData.station_id) {
        delete formData.station_headQuarter;
        await sendAPIRequest(
          `/${organizationId}/station/${formData.station_id}`,
          {
            method: 'PUT',
            body: formData,
          }
        );
      } else {
        await sendAPIRequest(`/${organizationId}/station`, {
          method: 'POST',
          body: payload,
        });
      }
      togglePopup(false);
      dispatch(getAndSetStations(organizationId));
    }
  };

  const handelFormSubmit = (values: StationFormData) => {
    const mode = values.station_id ? 'update' : 'create';
    const existingStation = tableData.find((station: StationFormData) => {
      if (mode === 'create')
        return (
          station.station_name.toLowerCase() ===
          values.station_name.toLowerCase()
        );
      return (
        station.station_name.toLowerCase() ===
        values.station_name.toLowerCase() &&
        station.station_id !== values.station_id
      );
    });
    if (existingStation) {
      settingPopupState(false, 'Station with this name already exists!')
      return;
    }

    if (values !== initialValue) {
      settingPopupState(true, `Are you sure you want to ${mode} this Station?`)
      setFormData(values);
    }
  };

  const deleteAcc = async (station_id: string) => {
    isDelete.current = false;
    togglePopup(false);
    try {
      await sendAPIRequest(`/${organizationId}/station/${station_id}`, {
        method: 'DELETE',
      });
      dispatch(getAndSetStations(organizationId))
    } catch {
      settingPopupState(false, 'This Station is associated')
    }
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
    Yes: 'Yes',
    No: 'No',
  };

  const stateCodeMap: { [key: number]: string } = {};

  stateData?.forEach((state: any) => {
    stateCodeMap[state.state_code] = state.state_name;
  });
  const types = Object.keys(typeMapping);
  const states = extractKeys(stateCodeMap);

  const handleCellEditingStopped = async (e: any) => {
    currTable = [];
    editing.current = false;
    const { data, column, oldValue, valueChanged, node } = e;
    let { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;

    if (node.rowIndex === 0 && createAccess) {
      try {
        await stationValidationSchema.validateAt(field, { [field]: newValue });
        if (data.state_code && data.station_name && data.station_pinCode) {
          handleConfirmPopup(data)

          if (field === 'station_name') {
            newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
            currTable = tableData.filter(
              (data: any) => data.station_id !== e.data.station_id
            );

            const existingStation = currTable.find(
              (station: StationFormData) =>
                station.station_name.toLowerCase() === newValue.toLowerCase()
            );

            if (existingStation) {
              settingPopupState(false, 'Station with this name already exists!')
              node.setDataValue(field, oldValue);
              return;
            }
          }


          if (field === 'igst_sale' && newValue) {
            newValue = newValue.toLowerCase();
          }

          node.setDataValue(field, newValue);
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
          settingPopupState(false, 'Station name, Station state or Pin code cannot be left null.');
          return;
        }
        const isValid = await stationValidationSchema.validateAt(field, { [field]: newValue });
        if (isValid) {
          await sendAPIRequest(`/${organizationId}/station/${data.station_id}`, {
            method: 'PUT',
            body: { [field]: newValue },
          });
        }
        dispatch(getAndSetStations(organizationId));
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

  const cellEditingStarted = (params:any) => {
    editing.current = true;
  };

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

  const defaultCol = {
    editable: updateAccess,
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
        startEditingCell={(editParams: any) => {
          gridRef.current?.api?.startEditingCell(editParams);
        }}
        placeholderText={params.colDef.headerName}
      />
    ),
  }
  const colDefs: any[] = [
    {
      headerName: 'Station Name',
      field: 'station_name',
    },
    ...(controlRoomSettings.igstSaleFacility
      ? [
        {
          headerName: 'IGST Sale',
          field: 'igst_sale',
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: types,
          },
          valueFormatter: (params: { value: string | number }) =>
            lookupValue(typeMapping, params.value),
          headerClass: 'custom-header custom_header_class',
        },
      ]
      : []),
    {
      headerName: 'Station State',
      field: 'state_code',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: (params:any)=>{
        return {
          values: states,
          valueListMaxHeight: 120,
          valueListMaxWidth: 230,
          valueListGap: 8,
          value: params.data.state_code,
        }
      },
      valueFormatter: (params: { value: string | number }) =>{
        return lookupValue(stateCodeMap, params.value)
      },
      valueGetter: (params: { data: any }) => {
        return lookupValue(stateCodeMap, params.data.state_code);
      },
      filterValueGetter: (params: { data: any }) => {
        console.log(lookupValue(stateCodeMap, params.data.state_code))
        return lookupValue(stateCodeMap, params.data.state_code);
      },
      headerClass: 'custom-header custom_header_class',
    },
    {
      headerName: 'Pin Code',
      field: 'station_pinCode',
      headerClass: 'custom-header custom_header_class',
      cellEditorParams: {
        values: [],
        maxLength: 6,
      },
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      sortable: false,
      editable: false,
      floatingFilter: false,
      filter: false,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params: { data: StationFormData }) => (
        <div className='table_edit_buttons'>
          {updateAccess && <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => handleUpdate(params.data)}
          />}

          {deleteAccess && <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => {
              handleDelete(params.data);
            }}
          />}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className='w-full relative'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Stations</h1>
          <div className='flex gap-5'>
            <Button
              type='highlight'
              handleOnClick={() => {
                toggleSettingPopup(true);
              }}
            >
              <IoSettingsOutline />
            </Button>
            {createAccess && <Button type='highlight' handleOnClick={() => {
              setFormData(initialValue);
              togglePopup(true)
            }}>
              Add Station
            </Button>}
          </div>
        </div>
        <div id='account_table' className='ag-theme-quartz'>
          {
            <AgGridReact
              // rowData={[initialValue, ...tableData]}
              rowData={tableData}
              columnDefs={colDefs}
              defaultColDef={defaultCol}
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
            className='absolute'
          />
        )}
        {open && (
          <CreateStation
            togglePopup={togglePopup}
            data={formData}
            handelFormSubmit={handelFormSubmit}
            isDelete={isDelete.current}
            deleteAcc={deleteAcc}
            className='absolute'
            states={stateData}
          />
        )}
        {settingToggleOpen && (
          <ControlRoomSettings
            togglePopup={toggleSettingPopup}
            heading={'Station Settings'}
            fields={stationSettingFields}
            initialValues={initialValues}
          />
        )}
      </div>
    </>
  );
};
