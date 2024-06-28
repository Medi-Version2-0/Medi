import React, { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import {
  SalesPurchaseFormData,
  SalesPurchaseTableProps,
} from '../../interface/global';
import { ValueFormatterParams } from 'ag-grid-community';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import { CreateSalePurchase } from './CreateSalePurchase';

const initialValue = {
  sptype: '',
  igst: '0.00',
  surCharge: '',
  shortName: '',
  shortName2: '',
};

export const Sales_Table: React.FC<SalesPurchaseTableProps> = ({ type }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [tableData, setTableData] = useState<SalesPurchaseFormData | any>(null);
  const [currTableData, setCurrTableData] = useState<SalesPurchaseFormData | any>(null);
  const [formData, setFormData] = useState<SalesPurchaseFormData | any>(
    initialValue
  );
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const editing = useRef(false);
  const isDelete = useRef(false);

  const electronAPI = (window as any).electronAPI;

  const getSalesData = async () => {
    const data = await electronAPI.getSalesPurchase('', 'sptype', '', type);
    setTableData(data);
    setCurrTableData(electronAPI.getSalesPurchase('', 'sptype', '', type));
  };

  useEffect(() => {
    getSalesData();
  }, [type]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [type, selectedRow]);

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialValue);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };

  const decimalFormatter = (params: ValueFormatterParams): any => {
    if (!params.value) return;
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
    if (formData.sptype) {
      formData.sptype =
        formData.sptype.charAt(0).toUpperCase() + formData.sptype.slice(1);
    }
    if (formData !== initialValue) {
      if (formData.sp_id) {
        electronAPI.updateSalesPurchase(formData.sp_id, formData);
      } else {
        electronAPI.addSalesPurchase(formData);
      }
      togglePopup(false);
      getSalesData();
    }
  };

  const handelFormSubmit = (values: SalesPurchaseFormData) => {
    const mode = values.sp_id ? 'update' : 'create';
    const existingSalePurchase = tableData.find((sp: SalesPurchaseFormData) => {
      if (mode === 'create')
        return sp.sptype?.toLowerCase() === values.sptype?.toLowerCase();
      return (
        sp.sptype?.toLowerCase() === values.sptype?.toLowerCase() &&
        sp.sp_id !== values.sp_id
      );
    });
    if (existingSalePurchase) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Type with this name already exists!',
      });
      return;
    }
    if (values.sptype) {
      values.sptype =
        values.sptype.charAt(0).toUpperCase() + values.sptype.slice(1);
    }
    if (mode === 'create') {
      values.salesPurchaseType = type;
    }
    if (values !== initialValue) {
      setPopupState({
        ...popupState,
        isModalOpen: true,
        message: `Are you sure you want to ${mode} this ${type} Account?`,
      });
      setFormData(values);
    }
  };

  const handleUpdate = (oldData: any) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const deleteAcc = (sp_id: string) => {
    electronAPI.deleteSalesPurchase(sp_id);
    isDelete.current = false;
    togglePopup(false);
    getSalesData();
  };
  const handleDelete = (oldData: any) => {
    setFormData(oldData);
    isDelete.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        togglePopup(false);
        break;
      case 'n':
      case 'N':
        if (event.ctrlKey) {
          togglePopup(true);
        }
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
      case 'sptype':
        {
          const existingSalePurchase = currTableData.find((sp: SalesPurchaseFormData) => sp.sptype?.toLowerCase() === newValue?.toLowerCase()
        );
        if(existingSalePurchase){
          setPopupState({
           ...popupState,
            isAlertOpen: true,
            message: `${type} with this name already exists!`,
          });
          node.setDataValue(field, oldValue);
          return;
        }
          else if (!newValue || /^\d+$/.test(newValue) || newValue.length > 100) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: !newValue
                ? `${type} Type is required`
                : /^\d+$/.test(newValue)
                ? `Only numbers not allowed`
                : `${type} Type must be 100 characters or less`,
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
              message: `IGST is required`,
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
              message: `CGST is required`,
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
              message: `SGST is required`,
            });
            node.setDataValue(field, oldValue);
            return;
          }
        }
        break;
      default:
        break;
    }
    if (field === 'igst') {
      data.cgst = newValue / 2;
      data.sgst = newValue / 2;
      electronAPI.updateSalesPurchase(data.sp_id, data);
    } else {
      electronAPI.updateSalesPurchase(data.sp_id, { [field]: newValue });
    }
    getSalesData();
  };

  const colDefs: any[] = [
    {
      headerName: 'Name',
      field: 'sptype',
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
      headerName: 'Cess %',
      field: 'surCharge',
      flex: 1,
      filter: true,
      editable: true,
      valueFormatter: decimalFormatter,
      headerClass: 'custom-header',
      suppressMovable: true,
    },
    {
      headerName: 'Short Name',
      field: 'shortName',
      flex: 1,
      filter: true,
      editable: true,
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
      <div className='w-full'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>{type} Account</h1>
          <Button
            type='highlight'
            id='sp_button'
            handleOnClick={() => {
              return togglePopup(true);
            }}
          >
            Add {type}
          </Button>
        </div>
        <div
          id='account_table'
          className='ag-theme-quartz bg-[white] h-[calc(100vh_-_7.4rem)] mx-[1rem] my-0 rounded-[1.4rem]'
        >
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
        {open && (
          <CreateSalePurchase
            togglePopup={togglePopup}
            data={formData}
            handelFormSubmit={handelFormSubmit}
            isDelete={isDelete.current}
            deleteAcc={deleteAcc}
            type={type}
          />
        )}
      </div>
    </>
  );
};
