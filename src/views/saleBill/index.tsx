import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { View } from '../../interface/global';
import Button from '../../components/common/button/Button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import usePermission from '../../hooks/useRole';
import CreateSaleBill from './createSaleBill';
import { sendAPIRequest } from '../../helper/api';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { DiscountTypeSection } from './discountTypeSection';
import { MdDeleteForever } from 'react-icons/md';

const SaleBill = () => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<any>(null);
  const editing = useRef(false);
  const { createAccess, updateAccess, deleteAccess } = usePermission('invoicebill')
  const id = useRef('');
  const queryClient = useQueryClient();

  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  ''
  const { data } = useQuery<{ data: any }>({
    queryKey: ['get-saleBill'],
    queryFn: () =>
      sendAPIRequest<{ data: any }>(`/invoiceBill`)
  });

  const getSaleBillData = async () => {
    if (data) setTableData(data);
  };

  useEffect(() => {
    getSaleBillData();
  }, [data]);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    await sendAPIRequest(`/invoiceBill/${id.current}`, {
      method: 'DELETE',
    });
    queryClient.invalidateQueries({ queryKey: ['get-saleBill'] });

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

  const colDefs: any[] = [
    {
      headerName: 'Bill No',
      field: 'invoiceNumber',
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
      field: 'balance',
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
          {updateAccess && <FaEdit
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

  const saleBill = () => {
    return (
      <>
        <div className='w-full relative'>
          <div className='flex w-full items-center justify-between px-8 py-1'>
            <h1 className='font-bold'>Sale Bill</h1>
            {createAccess && <Button
              type='highlight'
              handleOnClick={async () => setView({ type: 'add', data: {} })}
            >
              Add Sale Bill
            </Button>}
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
        return <CreateSaleBill setView={setView} data={view.data} />;
      case 'discountType':
        return <DiscountTypeSection setView={setView} data={view.data} />;
      default:
        return saleBill();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};

export default SaleBill;