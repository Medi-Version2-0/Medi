// TODO : if the form didn't ask for station then station will also noe editable from ag grid cell editing
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { View } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { ColDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import Button from '../../components/common/button/Button';
import { IoSettingsOutline } from 'react-icons/io5';
import { useControls } from '../../ControlRoomContext';
import { ControlRoomSettings } from '../../components/common/controlRoom/ControlRoomSettings';
import { ledgerSettingFields } from '../../components/common/controlRoom/settings';
import { CreateLedger } from './CreateLedger';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import usePermission from '../../hooks/useRole';
import { getLedgerFormValidationSchema } from './validation_schema';
import { validateField, decimalFormatter, createMap, extractKeys, lookupValue, capitalFirstLetter } from '../../helper/helper';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import useApi from '../../hooks/useApi';

export const Ledger = ({type = ''}) => {
  const [view, setView] = useState<View>({ type, data: {} });
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState();
  const [stationData, setStations] = useState<any[]>([]);
  const editing = useRef(false);
  const { sendAPIRequest } = useApi();
  const partyId = useRef('');
  const [open, setOpen] = useState<boolean>(false);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const { controlRoomSettings } = useControls();
  const { createAccess, updateAccess, deleteAccess } = usePermission('ledger')
  const initialValues = {
    multiplePriceList: controlRoomSettings.multiplePriceList || true,
    printPartyBalance: controlRoomSettings.printPartyBalance || false,
    priceListLock: controlRoomSettings.priceListLock || false,
    showTcsColumnOnPurchase:
      controlRoomSettings.showTcsColumnOnPurchase || false,
    makeEwayBill: controlRoomSettings.makeEwayBill || false,
    enablePriceListMode: controlRoomSettings.enablePriceListMode || false,
    fssaiNumber: controlRoomSettings.fssaiNumber || false,
  };

  const togglePopup = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  async function getAndSetParties(){
    try{
      const allParties = await sendAPIRequest('/ledger');
      setTableData(allParties);
    }catch(err){
      console.error('party data in ledger index not being fetched');
    }
  }

  async function getAndSetStations(){
    try{
      const allStation = await sendAPIRequest('/station');
      setStations(allStation);
    }catch(err){
      console.log('Stations not fetched in ledger index')
    }
  }
  
  useEffect(() => {
    getAndSetParties();
    getAndSetStations();
  }, []);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow, popupState]);
  
  const handleKeyDown = (event: KeyboardEvent) => {
    handleKeyDownCommon(
      event,
      handleDelete,
      undefined,
      undefined,
      selectedRow,
      setView
    );
  };
  useHandleKeydown(handleKeyDown, [selectedRow, popupState])

  const typeMapping = useMemo(() => ({ Dr: 'DR', Cr: 'CR' }), []);
  const ledgerStationsMap = createMap( stationData, (item) => item.station_id, (item) => item.station_name);
  const ledgerStations = extractKeys(ledgerStationsMap);
  const lookupStation = (key: number) => lookupValue(ledgerStationsMap, key);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false,isModalOpen: false  });
  };
  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };
  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    try {
      await sendAPIRequest(`/ledger/${partyId.current}`, { method: 'DELETE' });
      await getAndSetParties();
    } catch(error:any) {
      if (error?.response?.status !== 401 && error?.response?.status !== 403){
        if (error?.response?.status === 400){
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: error?.response.data.error.message,
          });
        }
      }
    }
  };

  const handleDelete = (oldData: any) => {
    setPopupState({
      ...popupState,
      isModalOpen: true,
      message: 'Are you sure you want to delete the selected record?',
    });
    partyId.current = oldData.party_id;
  };

  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { column, oldValue, node, data } = e;
    let { newValue } = e;

    if (newValue === oldValue) return;

    const field = column.colId;
    const schema = getLedgerFormValidationSchema();
    const errorMessage = await validateField(schema, field, newValue);
    if (errorMessage) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: errorMessage,
      });
      node.setDataValue(field, oldValue);
      return;
    }

    if (field === 'partyName'){
      newValue = capitalFirstLetter(newValue);
    }
    node.setDataValue(field, newValue);
    try{
      await sendAPIRequest(`/ledger/${data.party_id}`, {
        method: 'PUT',
        body: { [field]: newValue },
      });
      await getAndSetParties();
    }catch(error:any){
      if (!error?.isErrorHandled){
        node.setDataValue(field, oldValue);
        setPopupState({
          ...popupState,
          isAlertOpen: true,
          message: error.response.data.error.message,
        });
        console.log('Party not updated from AgGrid')
      }
    }
  };

  const onCellClicked = (params: { data: any }) =>{
    if(params.data.isPredefinedLedger){
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Predefined Ledgers are not editable',
      });
      return; 
    }else{
      setSelectedRow(params.data);
    }
  }

  const cellEditingStarted = (e: any) => {
      editing.current = true
  };

  const defaultColDef: ColDef = {
    floatingFilter: true,
    flex: 1,
    filter: true,
    suppressMovable: true,
    headerClass: 'custom-header',
    editable: (params: any) => !params.data.isPredefinedLedger ||  updateAccess // editable only in two situations one if user have update access and other is ledger must not be predefined
  }

  const colDefs: ColDef[]= [
    {
      headerName: 'Ledger Name',
      field: 'partyName',
      flex: 2,
    },
    {
      headerName: 'Station',
      field: 'station_id',
      cellDataType: 'text',
      editable:(params:any) => {
        return [
          'SUNDRY CREDITORS',
          'SUNDRY DEBTORS',
          'GENERAL GROUP',
          'DISTRIBUTORS, C & F',
        ].includes(params.data.Group.group_name.toUpperCase());
      },
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ledgerStations },
      valueFormatter: (params: { value: string | number }) => lookupStation(Number(params.value)),
      valueGetter: (params: { data: any }) => lookupStation(params.data.station_id),
    },
    {
      headerName: 'Opening Balance( ₹ )',
      field: 'openingBal',
      type: 'rightAligned',
      valueFormatter: decimalFormatter,
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',
    },
    {
      headerName: 'Debit/Credit',
      field: 'openingBalType',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: Object.keys(typeMapping) },
      valueFormatter: (params: ValueFormatterParams) => lookupValue(typeMapping, params.value),
    },
    {
      headerName: 'Actions',
      sortable: false,
      editable:false,  // actions are not editable
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params: { data: any }) => (
        <div className='table_edit_buttons'>
          {updateAccess && <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => {
              if (params.data.isPredefinedLedger) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: 'Predefined Ledger are not editable',
                });
              } else {
                setView({ type: 'add', data: params.data });
              }
            }}
          />}
          {deleteAccess && <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => {
              if (params.data.isPredefinedLedger) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: 'Predefined Ledger should not be deleted',
                });
              } else {
                handleDelete(params.data);
              }
            }}
          />}
        </div>
      ),
    },
  ];

  const gridOptions: GridOptions<any> = {
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [20, 30, 40],
    defaultColDef,
  };
  
  const ledger = () => {
    return (
      <>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Ledger Master</h1>
          <div className='flex gap-5'>
            <Button
              type='highlight'
              handleOnClick={() => {
                togglePopup(true);
              }}
            >
              <IoSettingsOutline />
            </Button>
            {createAccess && (
              <Button
                autoFocus={true}
                type='highlight'
                handleOnClick={() => setView({ type: 'add', data: {} })}
              >
                Add Ledger
              </Button>
            )}
          </div>
        </div>
        <div id='account_table' className='ag-theme-quartz'>
          <AgGridReact
            rowData={tableData}
            columnDefs={colDefs}
            gridOptions={gridOptions}
            onCellClicked={onCellClicked}
            onCellEditingStarted={cellEditingStarted}
            onCellEditingStopped={handleCellEditingStopped}
          />
        </div>
        {open && (
          <ControlRoomSettings
            togglePopup={togglePopup}
            heading={'Ledger Settings'}
            fields={ledgerSettingFields}
            initialValues={initialValues}
          />
        )}
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
      </>
    );
  };

  const renderView = () => {
    switch (view.type) {
      case 'add':
        return <CreateLedger setView={setView} data={view.data} getAndSetParties={getAndSetParties} stations={stationData}/>;
      default:
        return ledger();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};
