import React, { useEffect, useRef, useState } from 'react';
import './sales_purchase.css';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import { SalesPurchaseFormData, SalesPurchaseTableProps } from '../../interface/global';
import { ValueFormatterParams } from 'ag-grid-community';
import Confirm_Alert_Popup from '../helpers/Confirm_Alert_Popup';

export const Sales_Table: React.FC<SalesPurchaseTableProps> = ({
  type,
}) => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<SalesPurchaseFormData | any>(null); 
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const spId = useRef('');
  const editing = useRef(false);

  const electronAPI = (window as any).electronAPI;

  const getSalesData = async () => {
    const data = await electronAPI.getSalesPurchase('', 'spType', '', type);
    setTableData(data);
  };

  useEffect(() => {
    getSalesData();
  }, [type]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  const decimalFormatter = (params: ValueFormatterParams): any => {
    return parseFloat(params.value).toFixed(2);
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
    electronAPI.deleteSalesPurchase(spId.current);
    getSalesData();
  };

  const handleUpdate = (oldData: any) => {
    return navigate(`/sales_purchase`, { state: oldData });
  };

  const handleDelete = (oldData: any) => {
    setPopupState({
      ...popupState,
      isModalOpen: true,
      message: 'Are you sure you want to delete the selected record ?',
    });
    spId.current = oldData.sp_id;
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
        if (event.ctrlKey) {
          return navigate(`/sales_purchase`, {state: type});
        }
        break;
      case 'd':
      case 'D':
        if (
          event.ctrlKey &&
          selectedRow
        ) {
          handleDelete(selectedRow);
        }
        break;
      case 'e':
      case 'E':
        if (
          event.ctrlKey &&
          selectedRow
        ) {
          handleUpdate(selectedRow);
        } 
        break;
      default:
        break;
    }
  };

  const handleCellEditingStopped = (e: {
    data?: any;
    column?: any;
    oldValue?: any;
    valueChanged?: any;
    node?: any;
    newValue?: any;
  }) => {
      editing.current = false;
      const { data, column, oldValue, valueChanged, node } = e;
      let { newValue } = e;
      if (!valueChanged) return;
      const field = column.colId;
      switch (field) {
        case 'spType':
          {
            if (!newValue || newValue.length > 100) {
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: !newValue
                  ? `${type} Type is required` : `${type} Type must be 100 characters or less`,
              });
              node.setDataValue(field, oldValue);
              return;
            }
            newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
          }
          break;
        case 'igst':
          {
            if (!newValue) {
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: `IGST is required`
              });
              node.setDataValue(field, oldValue);
              return;
            }
          }
          break;
          case 'cgst':
            {
              if (!newValue) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: `CGST is required`
                });
                node.setDataValue(field, oldValue);
                return;
              }
            }
          break;
          case 'sgst':
            {
              if (!newValue) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: `SGST is required`
                });
                node.setDataValue(field, oldValue);
                return;
              }
            }
          break;
        default:
          break;
      }
      if(field === "igst"){
        data.cgst =  newValue/2; 
        data.sgst = newValue/2;
        electronAPI.updateSalesPurchase(data.sp_id, data);
      }
      else{
        electronAPI.updateSalesPurchase(data.sp_id, { [field]: newValue });
      }
      getSalesData();
  };

  const colDefs: any[] = [
    {
      headerName: 'Name',
      field: 'spType',
      flex: 1,
      menuTabs: ['filterMenuTab'],
      filter: true,
      editable: true,
      suppressMovable: true,
      headerClass: 'custom-header',
    },
    {
      headerName: 'IGST %',
      field: 'igst',
      flex: 1,
      filter: true,
      editable: true,
      valueFormatter: decimalFormatter,
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'CGST %',
      field: 'cgst',
      flex: 1,
      filter: true,
      valueFormatter: decimalFormatter,
      headerClass: 'custom-header custom_header_class',
      suppressMovable: true,
    },
    {
        headerName: 'SGST %',
        field: 'sgst',
        flex: 1,
        filter: true,
        valueFormatter: decimalFormatter,
        headerClass: 'custom-header',
        suppressMovable: true,
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
      cellRenderer: (params: { data: SalesPurchaseFormData }) => (
        <div className='table_edit_buttons'>
          <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => handleUpdate(params.data)}
          />

          <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => {
              handleDelete(params.data);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className='sp-container'>
        <div id='sp_main'>
          <h1 id='sp_header'>{type} Master</h1>
          <button
            id='sp_button'
            className='sp_button'
            onClick={() => {
              return navigate(`/sales_purchase`, {state: type});
            }}
          >
            Add {type}
          </button>
        </div>
        <div id='account_table' className='ag-theme-quartz'>
            {
              <AgGridReact
                rowData={tableData}
                columnDefs={colDefs}
                defaultColDef={{
                  floatingFilter: true,
                }}
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
            />
          )}
      </div>
    </>
  );
};
