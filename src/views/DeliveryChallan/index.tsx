import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { DeliveryChallanFormData, View } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import { sendAPIRequest } from '../../helper/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CreateDeliveryChallan from './createDeliveryChallan';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import usePermission from '../../hooks/useRole';

const DeliveryChallan = () => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<DeliveryChallanFormData | any>(
    null
  );
  const editing = useRef(false);
  const { createAccess, updateAccess, deleteAccess } = usePermission('sale_challan')

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
        `/deliveryChallan`
      ),
  });

  const getDeliveryChallanData = async () => {
    if (data) setTableData(data);
  };

  useEffect(() => {
    getDeliveryChallanData();
  }, [data]);

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
    await sendAPIRequest(`/deliveryChallan/${id.current}`, {
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
    handleKeyDownCommon(
      event,
      handleDelete,
      undefined,
      undefined,
      selectedRow,
      setView 
    );
  };

  const colDefs: any[] = [
    {
      headerName: 'Challan No.',
      field: 'challanNumber',
    },
    {
      headerName: 'Station One / All',
      field: 'oneStation',
    },
    {
      headerName: 'Station Name',
      field: 'stationName',
    },
    {
      headerName: 'Party',
      field: 'partyName',
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',
    },

    {
      headerName: 'Balance',
      field: 'runningBalance',
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params: { data: any }) => (
        <div className='table_edit_buttons'>
          {updateAccess &&<FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => {
              setView({ type: 'add', data: params.data });
            }}
          />}

         {deleteAccess && <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => handleDelete(params.data)}
          />}
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
           {createAccess && <Button
              type='highlight'
              handleOnClick={async () => {
                try{
                  const challanNumber = await sendAPIRequest<string>(
                    `/deliveryChallan/challanNumber`
                  );
                  setView({
                    type: 'add',
                    data: { challanNumber: challanNumber },
                  });
                }
                catch(error: any){
                  setPopupState({
                    ...popupState,
                    isAlertOpen: true,
                    message: 'Add series first in bill book setup ...',
                  });
                  return;
                }
                
              }}
            >
              Add Challan
            </Button>}
            {/* </div> */}
          </div>

          <div id='account_table' className='ag-theme-quartz'>
            <AgGridReact
              rowData={tableData}
              columnDefs={colDefs}
              defaultColDef={{
                floatingFilter: true,
                flex: 1,
                filter: true,
                editable: false,
                suppressMovable: true,
                headerClass: 'custom-header',
              }}
              onCellClicked={onCellClicked}
              onCellEditingStarted={cellEditingStarted}
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