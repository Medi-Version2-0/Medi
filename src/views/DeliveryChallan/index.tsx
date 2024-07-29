import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { DeliveryChallanFormData, View } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { useParams } from 'react-router-dom';
import Button from '../../components/common/button/Button';
import { sendAPIRequest } from '../../helper/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CreateDeliveryChallan from './createDeliveryChallan';

const DeliveryChallan = () => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const { organizationId } = useParams();
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<DeliveryChallanFormData | any>(
    null
  );
  const [partiesData, setPartiesData] = useState<any[]>([]);
  const [stationData, setStationData] = useState<any[]>([]);

  const editing = useRef(false);
  const id = useRef('');
  const queryClient = useQueryClient();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const { data } = useQuery<{ data: DeliveryChallanFormData }>({
    queryKey: ['get-deliveryChallan'],
    queryFn: () =>
      sendAPIRequest<{ data: DeliveryChallanFormData }>(
        `/${organizationId}/deliveryChallan`
      ),
  });

  const getParties = async () => {
    setPartiesData(await sendAPIRequest<any[]>(`/${organizationId}/ledger`));
  };

  const getDeliveryChallanData = async () => {
    if (data) setTableData(data);
  };

  const getStations = async () => {
    setStationData(await sendAPIRequest<any[]>(`/${organizationId}/station`));
  };

  useEffect(() => {
    getStations();
    getDeliveryChallanData();
    getParties();
  }, [data]);

  const partiesCodeMap: { [key: number]: string } = {};
  const oneStationCodeMap: { [key: number | string]: string } = {};
  const stationsCodeMap: { [key: number]: string } = {};

  (partiesData || []).forEach((party: any) => {
    partiesCodeMap[party.party_id] = party.partyName;
  });

  (stationData || []).forEach((station: any) => {
    stationsCodeMap[station.station_id] = station.station_name;
  });

  [
    { label: 'One Station', value: 'One Station' },
    { label: 'All Stations', value: 'All Stations' },
  ].forEach((oneStation: any) => {
    oneStationCodeMap[oneStation.label] = oneStation.value;
  });

  const extractKeys = (mappings: { [x: number]: string }) => {
    return Object.keys(mappings).map((key) => Number(key));
  };

  const parties = extractKeys(partiesCodeMap);
  const stations = extractKeys(stationsCodeMap);

  const lookupValue = (
    mappings: {
      [x: string]: any;
      [x: number]: string;
    },
    key: string | number
  ) => {
    return mappings[key];
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    await sendAPIRequest(`/${organizationId}/deliveryChallan/${id.current}`, {
      method: 'DELETE',
    });
    queryClient.invalidateQueries({ queryKey: ['get-deliveryChallan'] });
  };

  const handleDelete = (oldData: any) => {
    setPopupState({
      ...popupState,
      isModalOpen: true,
      message: 'Are you sure you want to delete the selected record?',
    });
    id.current = oldData.id;
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'n':
      case 'N':
        if (event.ctrlKey) setView({ type: 'add', data: {} });
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
          setView({ type: 'add', data: selectedRow });
        }
        break;
      default:
        break;
    }
  };

  const commonColDefConfig = {
    flex: 1,
    filter: true,
    editable: true,
    suppressMovable: true,
    headerClass: 'custom-header',
  };
  const colDefs: any[] = [
    {
      headerName: 'Challan No.',
      field: 'challanNumber',
      menuTabs: ['filterMenuTab'],
      ...commonColDefConfig,
    },
    {
      headerName: 'Station One / All',
      field: 'oneStation',
      editable: false,
      flex: 1,
      filter: true,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Station Name',
      field: 'stationId',
      editable: false,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: stations,
        valueListMaxHeight: 120,
        valueListMaxWidth: 172,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string }) => {
        return lookupValue(stationsCodeMap, params.value);
      },
      flex: 1,
      filter: true,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
    {
      headerName: 'Party',
      field: 'partyId',
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',
      flex: 1,
      filter: true,
      editable: false,
      suppressMovable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: parties,
        valueListMaxHeight: 120,
        valueListMaxWidth: 172,
        valueListGap: 8,
      },
      valueFormatter: (params: { value: string | number }) =>
        lookupValue(partiesCodeMap, params.value),
    },

    {
      headerName: 'Balance',
      field: 'runningBalance',
      ...commonColDefConfig,
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
      cellRenderer: (params: { data: any }) => (
        <div className='table_edit_buttons'>
          <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => {
              setView({ type: 'add', data: params.data });
            }}
          />

          <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => handleDelete(params.data)}
          />
        </div>
      ),
    },
  ];

  const deliveryChallan = () => {
    return (
      <>
        <div className='w-full relative'>
          <div className='flex w-full items-center justify-between px-8 py-1'>
            <h1 className='font-bold'>Delivery Challan</h1>
            <Button
              type='highlight'
              handleOnClick={async () => {
                const challanNumber = await sendAPIRequest<string>(
                  `/${organizationId}/deliveryChallan/challanNumber`
                );
                setView({
                  type: 'add',
                  data: { challanNumber: challanNumber },
                });
              }}
            >
              Add Challan
            </Button>
            {/* </div> */}
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
              //   onCellEditingStopped={handleCellEditingStopped}
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
            />
          )}
        </div>
      </>
    );
  };

  const renderView = () => {
    switch (view.type) {
      case 'add':
        return <CreateDeliveryChallan setView={setView} data={view.data} />;
      default:
        return deliveryChallan();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};

export default DeliveryChallan;
