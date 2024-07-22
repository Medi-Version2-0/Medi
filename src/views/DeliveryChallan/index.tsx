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
// import { ICellRendererParams } from 'ag-grid-community';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { GiHamburgerMenu } from 'react-icons/gi';
// import DropdownTippy from '../../components/common/dropdown/dropdown';
import CreateDeliveryChallan from './createDeliveryChallan';

// const initialPopupState = {
//   setting: false,
//   search: false
// }

const DeliveryChallan = () => {
  const [view, setView] = useState<View>({ type: '', data: {} });
  const { organizationId } = useParams();
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<DeliveryChallanFormData | any>(
    null
  );
  //   const [open, setOpen] = useState(initialPopupState);

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

  //   const togglePopup = (isOpen: boolean , key? :string) => {
  //     if(key){
  //       setOpen({...open , [key] : isOpen})
  //     }
  //     else{
  //       setOpen(initialPopupState)
  //     }
  //   };

  const getDeliveryChallanData = async () => {
    setTableData(data);
  };

  useEffect(() => {
    getDeliveryChallanData();
  }, [data]);

  //   const companyCodeMap: { [key: number]: string } = {};
  //   const groupCodeMap: { [key: number]: string } = {};
  //   const salesCodeMap: { [key: number]: string } = {};
  //   const purchaseCodeMap: { [key: number]: string } = {};

  //   (itemGroupData || []).forEach((group: any) => {
  //     groupCodeMap[group.group_code] = group.group_name;
  //   });

  //   (salesData || []).forEach((sale: any) => {
  //     salesCodeMap[sale.sp_id] = sale.sptype;
  //   });
  //   (purchaseData || []).forEach((sale: any) => {
  //     purchaseCodeMap[sale.sp_id] = sale.sptype;
  //   });

  //   (companyData || []).forEach((company: any) => {
  //     companyCodeMap[company.company_id] = company.companyName;
  //   });

  //   const extractKeys = (mappings: { [x: number]: string }) => {
  //     return Object.keys(mappings).map((key) => Number(key));
  //   };

  //   const companies = extractKeys(companyCodeMap);
  //   const groups = extractKeys(groupCodeMap);
  //   const sales = extractKeys(salesCodeMap);
  //   const purchases = extractKeys(purchaseCodeMap);

  //   const lookupValue = (
  //     mappings: {
  //       [x: string]: any;
  //       [x: number]: string;
  //     },
  //     key: string | number
  //   ) => {
  //     return mappings[key];
  //   };

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
    console.log('dleete ---> ');
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

  //   const handleCellEditingStopped = async (e: any) => {
  //     editing.current = false;
  //     const { column, oldValue, valueChanged, node, data } = e;
  //     let { newValue } = e;
  //     if (!valueChanged) return;
  //     const field = column.colId;

  //     switch (field) {
  //       case 'name':
  //         {
  //           if (!newValue || /^\d+$/.test(newValue) || newValue.length > 100) {
  //             setPopupState({
  //               ...popupState,
  //               isAlertOpen: true,
  //               message: !newValue
  //                 ? 'Item Name is required'
  //                 : /^\d+$/.test(newValue)
  //                   ? 'Only Numbers not allowed'
  //                   : 'Item name cannot exceed 100 characters',
  //             });
  //             node.setDataValue(field, oldValue);
  //             return;
  //           }
  //           newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
  //         }
  //         break;
  //       case 'shortName':
  //         {
  //           if (!newValue) {
  //             setPopupState({
  //               ...popupState,
  //               isAlertOpen: true,
  //               message: 'MFG code is required',
  //             });
  //             node.setDataValue(field, oldValue);
  //             return;
  //           }
  //         }
  //         break;
  //     }

  //     await sendAPIRequest(`/${organizationId}/item/${data.id}`, {
  //       method: 'PUT',
  //       body: { [field]: newValue },
  //     });
  //     queryClient.invalidateQueries({ queryKey: ['get-items'] });
  //   };

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
      headerName: 'Party',
      field: 'partyId',
      headerClass: 'custom-header custom_header_class ag-right-aligned-header',
      flex: 1,
      filter: true,
      editable: true,
      suppressMovable: true,
    },
    {
      headerName: 'Station',
      field: 'stationId',
      ...commonColDefConfig,
    },
    {
      headerName: 'MRP',
      field: 'mrp',
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
              handleOnClick={() => {
                setView({ type: 'add', data: {} });
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
