import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  ItemFormData,
  View,
} from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { useParams } from 'react-router-dom';
// import { IoSettingsOutline } from 'react-icons/io5';
import Button from '../../components/common/button/Button';
import { sendAPIRequest } from '../../helper/api';
// import { ICellRendererParams } from 'ag-grid-community';
import CreateVoucher from './createVoucher';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

const Vouchers = () => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const { organizationId } = useParams();
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<ItemFormData | any>(null);

  const editing = useRef(false);
  const id = useRef('');
//   const queryClient = useQueryClient();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const { data } = useQuery<{ data: ItemFormData }>({
    queryKey: ['get-items'],
    queryFn: () =>
      sendAPIRequest<{ data: ItemFormData }>(`/${organizationId}/voucher`),
  });

  const getVoucherData = async () => {
    setTableData(data);
  };


  useEffect(() => {
    getVoucherData();
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
    // await sendAPIRequest(`/${organizationId}/item/${id.current}`, {
    //   method: 'DELETE',
    // });
    // queryClient.invalidateQueries({ queryKey: ['get-items'] });
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
      headerName: 'Voucher Type',
      field: 'voucherType',
      menuTabs: ['filterMenuTab'],
      ...commonColDefConfig,
    },
    {
      headerName: 'GST Nature',
      field: 'gstNature',
      menuTabs: ['filterMenuTab'],
      ...commonColDefConfig,
    },
    {
      headerName: 'Account',
      field: 'account',
      menuTabs: ['filterMenuTab'],
      ...commonColDefConfig,
    },
    {
      headerName: 'Bank',
      field: 'bank',
      menuTabs: ['filterMenuTab'],
      ...commonColDefConfig,
    },
    {
      headerName: 'Opening Balance',
      field: 'openingBalance',
      menuTabs: ['filterMenuTab'],
      ...commonColDefConfig,
    },
    {
      headerName: 'Amount',
      field: 'amount',
      menuTabs: ['filterMenuTab'],
      ...commonColDefConfig,
    },
    {
      headerName: 'Discount',
      field: 'discount',
      menuTabs: ['filterMenuTab'],
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

  const voucher = () => {
    return (
      <>
        <div className='w-full relative'>
          <div className='flex w-full items-center justify-between px-8 py-1'>
            <h1 className='font-bold'>Vouchers</h1>
            <Button
              type='highlight'
              handleOnClick={() => {
                setView({ type: 'add', data: {} });
              }}
            >
              Add Voucher
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
      return <CreateVoucher setView={setView} data={view.data} />;
      default:
        return voucher();
    }
  };

  return <div className='w-full'>{renderView()}</div>;
};

export default Vouchers;
