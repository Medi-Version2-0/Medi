// TODO : if the form didn't ask for station then station will also noe editable from ag grid cell editing
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { LedgerFormData, View } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { useParams } from 'react-router-dom';
import { ValueFormatterParams } from 'ag-grid-community';
import Button from '../../components/common/button/Button';
import { IoSettingsOutline } from 'react-icons/io5';
import { sendAPIRequest } from '../../helper/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useControls } from '../../ControlRoomContext';
import { ControlRoomSettings } from '../../components/common/controlRoom/ControlRoomSettings';
import { ledgerSettingFields } from '../../components/common/controlRoom/settings';
import { CreateLedger } from './CreateLedger';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { useSelector } from 'react-redux'
import usePermission from '../../hooks/useRole';
import { useDispatch } from 'react-redux'
import { setParty } from '../../store/action/globalAction';
import { getLedgerFormValidationSchema } from './validation_schema';
import { validateField } from '../../components/common/validateFields';
import { decimalFormatter } from '../../utilities/decimalFormatter';
import { createMap, extractKeys, lookupValue } from '../../components/common/extractKeys';

export const Ledger = () => {
  const { organizationId } = useParams();
  const { controlRoomSettings } = useControls();
  const queryClient = useQueryClient();
  const dispatch = useDispatch()
  const { stations: stationData, party: partyData } = useSelector((state: any) => state.global)
  const { createAccess, updateAccess, deleteAccess } = usePermission('ledger');
  const [view, setView] = useState<View>({ type: '', data: {} });
  const [tableData, setTableData] = useState<LedgerFormData[]>(partyData);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [open, setOpen] = useState<any>(false);
  const editing = useRef(false);
  const partyId = useRef('');
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const initialValues = {
    multiplePriceList: controlRoomSettings.multiplePriceList || true,
    printPartyBalance: controlRoomSettings.printPartyBalance || false,
    priceListLock: controlRoomSettings.priceListLock || false,
    showTcsColumnOnPurchase: controlRoomSettings.showTcsColumnOnPurchase || false,
    makeEwayBill: controlRoomSettings.makeEwayBill || false,
    enablePriceListMode: controlRoomSettings.enablePriceListMode || false,
    fssaiNumber: controlRoomSettings.fssaiNumber || false,
  };

  useEffect(() => {
    setTableData(partyData)
  }, [partyData])

  const togglePopup = (isOpen: boolean) => setOpen(isOpen);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow, popupState]);

  const handleKeyDown = (event: KeyboardEvent) => handleKeyDownCommon( event, handleDelete, undefined, undefined, selectedRow, setView );

  const typeMapping = useMemo(() => ({ Dr: 'DR', Cr: 'CR' }), []);
  const ledgerStationsMap = useMemo(() => createMap(stationData, (item) => item.station_id, (item) => item.station_name), [stationData]);
  const ledgerStations = extractKeys(ledgerStationsMap);
  const lookupStation = (key: number) => lookupValue(ledgerStationsMap, key);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false, isModalOpen: false });
  };
  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };  
  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    try{
      await sendAPIRequest(`/${organizationId}/ledger/${partyId.current}`, {method: 'DELETE'});
      dispatch(setParty(tableData.filter((x:LedgerFormData)=> x.party_id !== partyId.current)))
      queryClient.invalidateQueries({ queryKey: ['get-ledger'] });
    }catch{
      setPopupState({ ...popupState, isAlertOpen: true, message:'This Party is associated' });
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

      if (field === 'partyName')
        newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
      node.setDataValue(field, newValue);
      await sendAPIRequest(`/${organizationId}/ledger/${data.party_id}`, {
        method: 'PUT',
        body: { [field]: newValue },
      });
      queryClient.invalidateQueries({ queryKey: ['get-ledger'] });
  };

  const onCellClicked = (params: { data: any }) => {
    if(params.data.isPredefinedLedger){
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Predefined Ledgers cannot be edited',
      });
      return;
    }else{
      setSelectedRow(selectedRow !== null ? null : params.data);
    }
  }

  const cellEditingStarted = (e:any) => editing.current = true;  

  const colDefs:any[] = [
    {
      headerName: 'Ledger Name',
      field: 'partyName',
      flex: 2,
    },
    {
      headerName: 'Station',
      field: 'station_id',
      cellDataType: 'text',
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
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center'},
      cellRenderer: (params: { data: any }) => (
        <div className='table_edit_buttons'>
          {updateAccess && <FaEdit style={{ cursor: 'pointer', fontSize: '1.1rem' }} 
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
          {deleteAccess &&<MdDeleteForever style={{ cursor: 'pointer', fontSize: '1.2rem' }}
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

  const ledger = () => {
    return (
      <>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Ledger Master</h1>
          <div className='flex gap-5'>
            <Button type='highlight' handleOnClick={() => togglePopup(true)}>
              <IoSettingsOutline />
            </Button>
            <Button type='highlight' handleOnClick={() => setView({ type: 'add', data: {} })} disable={!createAccess}>
              Add Ledger
            </Button>
          </div>
        </div>
        <div id='account_table' className='ag-theme-quartz'>
          <AgGridReact
            rowData={tableData}
            columnDefs={colDefs}
            defaultColDef={{ 
              floatingFilter: true,
              flex: 1,
              filter: true,
              suppressMovable: true,
              headerClass: 'custom-header',
              editable: (params: any) => !params.data.isPredefinedLedger && updateAccess,
            }}
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
            onConfirm={ popupState.isAlertOpen ? handleAlertCloseModal : handleConfirmPopup }
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
        return <CreateLedger setView={setView} data={view.data} />;
      default:
        return ledger();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};