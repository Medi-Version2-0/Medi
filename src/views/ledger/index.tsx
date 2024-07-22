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
import * as Yup from 'yup';
import { sendAPIRequest } from '../../helper/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useControls } from '../../ControlRoomContext';
import { ControlRoomSettings } from '../../components/common/controlRoom/ControlRoomSettings';
import { ledgerSettingFields } from '../../components/common/controlRoom/settings';
import { CreateLedger } from './CreateLedger';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { useSelector } from 'react-redux'

const ledgerValidationSchema = Yup.object().shape({
  partyName: Yup.string()
    .required('Party Name is required')
    .matches(/^\D+$/, 'Only Numbers not allowed')
    .max(100, 'Party name cannot exceed 100 characters'),
  station_id: Yup.number(),
  openingBal: Yup.number()
    .nullable()
    .test(
      'is-valid',
      'Opening Balance must be a positive number with at most two decimal places',
      value => {
        if (value === undefined || value === null) return true;
        return /^\d+(\.\d{0,2})?$/.test(value.toString()) && value >= 0;
      }
    )
    .min(0, 'Opening Balance must be at least 0'),
});

const validateField = async (field: string, value: any) => {
  try {
    await ledgerValidationSchema.validateAt(field, { [field]: value });
    return null;
  } catch (error: any) {
    return error.message;
  }
};

export const Ledger = () => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const { stations: stationData } = useSelector((state: any) => state.global)
  const { organizationId } = useParams();
  const [tableData, setTableData] = useState<LedgerFormData[]>([]);
  const editing = useRef(false);
  const partyId = useRef('');
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const { controlRoomSettings } = useControls();

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

  const { data } = useQuery<LedgerFormData[]>({
    queryKey: ['get-ledger'],
    queryFn: () =>
      sendAPIRequest<LedgerFormData[]>(`/${organizationId}/ledger`),
    initialData: [],
  });

  const fetchLedgerData = async () => {
    data.map((e: any) => (e.stationName = e.Station?.station_name || ''));
    setTableData(data);
  };

  const togglePopup = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  useEffect(() => {
    fetchLedgerData();
  }, [data]);

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

  const typeMapping = useMemo(() => ({ Dr: 'DR', Cr: 'CR' }), []);

  const ledgerStationsMap: { [key: number]: string } = {};

  stationData?.forEach((station: any) => {
    ledgerStationsMap[station.station_id] = station.station_name;
  });

  const types = useMemo(() => Object.keys(typeMapping), [typeMapping]);
  const extractKeys = (mappings: {
    [x: number]: string;
    Dr?: string;
    Cr?: string;
  }) => {
    return Object.keys(mappings).map((key) => Number(key));
  };
  const ledgerStations = extractKeys(ledgerStationsMap);

  const lookupValue = (
    mappings: {
      [x: string]: any;
      [x: number]: string;
      Dr?: string;
      Cr?: string;
    },
    key: string | number
  ) => {
    return mappings[key];
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };
  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };
  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    await sendAPIRequest(`/${organizationId}/ledger/${partyId.current}`, {
      method: 'DELETE',
    });
    queryClient.invalidateQueries({ queryKey: ['get-ledger'] });
  };

  const decimalFormatter = (params: ValueFormatterParams): any =>
    params.value ? parseFloat(params.value).toFixed(2) : '';

  const handleDelete = (oldData: any) => {
    setPopupState({
      ...popupState,
      isModalOpen: true,
      message: 'Are you sure you want to delete the selected record?',
    });
    partyId.current = oldData.party_id;
  };

  const handleCellEditingStopped = async (e: any) => {
    if (!e.data.isPredefinedLedger) {
      editing.current = false;
      const { column, oldValue, valueChanged, node, data } = e;
      let { newValue } = e;

      if (!valueChanged) return;

      const field = column.colId;
      const errorMessage = await validateField(field, newValue);
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
    } else {
      const { column, oldValue, node } = e;
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Predefined Ledgers are not editable',
      });
      node.setDataValue(column.colId, oldValue);
    }
  };

  const onCellClicked = (params: { data: any }) =>
    setSelectedRow(selectedRow !== null ? null : params.data);

  const cellEditingStarted = () => (editing.current = true);

  const colDefs = [
    {
      headerName: 'Ledger Name',
      field: 'partyName',
      flex: 2,
      filter: 'agTextColumnFilter',
      editable: (params: any) => !params.data.isPredefinedLedger,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Station',
      field: 'station_id',
      flex: 1,
      filter: 'agTextColumnFilter',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ledgerStations },
      valueFormatter: (params: { value: string | number }) => {
        return lookupValue(ledgerStationsMap, params.value);
      },
      editable: (params: any) => {
        return (
          !params.data.isPredefinedLedger &&
          (params.data.Group.group_name === 'SUNDRY CREDITORS' ||
            params.data.Group.group_name === 'SUNDRY DEBTORS' ||
            params.data.Group.group_name.toUpperCase() === 'GENERAL GROUP' ||
            params.data.Group.group_name.toUpperCase() ===
              'DISTRIBUTORS, C & F')
        );
      },
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Balance( ₹ )',
      field: 'openingBal',
      flex: 1,
      filter: true,
      editable: (params: any) => !params.data.isPredefinedLedger,
      type: 'rightAligned',
      valueFormatter: decimalFormatter,
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',
      suppressMovable: true,
    },
    {
      headerName: 'Debit/Credit',
      field: 'openingBalType',
      flex: 1,
      filter: 'agTextColumnFilter',
      editable: (params: any) => !params.data.isPredefinedLedger,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: types },
      valueFormatter: (params: ValueFormatterParams) =>
        lookupValue(typeMapping, params.value),
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      suppressMovable: true,
      headerClass: 'custom-header',
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params: { data: any }) => (
        <div className='table_edit_buttons'>
          <FaEdit
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
          />
          <MdDeleteForever
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
          />
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
            <Button
              type='highlight'
              handleOnClick={() => {
                togglePopup(true);
              }}
            >
              <IoSettingsOutline />
            </Button>
            <Button
              type='highlight'
              handleOnClick={() => setView({ type: 'add', data: {} })}
            >
              Add Ledger
            </Button>
          </div>
        </div>
        <div id='account_table' className='ag-theme-quartz'>
          <AgGridReact
            rowData={tableData}
            columnDefs={colDefs}
            defaultColDef={{ floatingFilter: true }}
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
        return <CreateLedger setView={setView} data={view.data} />;
      default:
        return ledger();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};
