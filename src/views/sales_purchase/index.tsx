import React, { useEffect, useRef, useState } from 'react';
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
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { useDispatch, useSelector } from 'react-redux'
import { getAndSetSales, getAndSetPurchase } from '../../store/action/globalAction';
import usePermission from '../../hooks/useRole';
import { AppDispatch } from '../../store/types/globalTypes';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { decimalFormatter } from '../../helper/helper';

const initialValue: SalesPurchaseFormData = {
  sptype: '',
  igst: '0.00',
  surCharge: '',
  shortName: '',
  shortName2: '',
};

export const Sales_Table = ({ type }: SalesPurchaseTableProps) => {
  const { organizationId } = useParams();
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<SalesPurchaseFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const { createAccess, updateAccess, deleteAccess } = usePermission(type === 'Sales' ?'sales_account' : 'purchase_account')
  const { purchase: purchaseData, sales: salesData } = useSelector((state: any) => state.global);
  const [tableData, setTableData] = useState<SalesPurchaseFormData[]>([]);

  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const editing = useRef(false);
  const isDelete = useRef(false);
  const dispatch = useDispatch<AppDispatch>()

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialValue);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };

  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };

  useEffect(() => {
    const data = type === 'Sales' ? salesData : purchaseData
    setTableData(data)
  }, [ salesData, purchaseData])
  

  const handleKeyDown = (event: KeyboardEvent) => {
    handleKeyDownCommon(
      event,
      handleDelete,
      handleUpdate,
      togglePopup,
      selectedRow,
      undefined
    );
  };
  useHandleKeydown(handleKeyDown, [selectedRow, popupState])

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    if (formData.sptype) {
      formData.sptype =
        formData.sptype.charAt(0).toUpperCase() + formData.sptype.slice(1);
    }
    if (formData !== initialValue) {
      const endPoint =
        type === 'Sales'
          ? `/${organizationId}/sale`
          : `/${organizationId}/purchase`;
      const endpoint = formData.sp_id
        ? `${endPoint}/${formData.sp_id}`
        : `${endPoint}`;
      const method = formData.sp_id ? 'PUT' : 'POST';

      await sendAPIRequest(endpoint, { method, body: formData });
      type === 'Sales' ?  dispatch(getAndSetSales(organizationId)) : dispatch(getAndSetPurchase(organizationId));
      togglePopup(false);
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
      settingPopupState(false, `${type} account with this name already exists!`);
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
      settingPopupState(true, `Are you sure you want to ${mode} this ${type} Account?`);
      setFormData(values);
    }
  };

  const handleUpdate = (oldData: SalesPurchaseFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const deleteAcc = async (sp_id: string) => {
    isDelete.current = false;
    togglePopup(false);
    const endPoint =
      type === 'Sales'
        ? `/${organizationId}/sale`
        : `/${organizationId}/purchase`;
    const endpoint = `${endPoint}/${sp_id}`;
    togglePopup(false);
    await sendAPIRequest(endpoint, { method: 'DELETE' });
    type === 'Sales' ? await dispatch(getAndSetSales(organizationId)) : await dispatch(getAndSetPurchase(organizationId));
  };

  const handleDelete = (oldData: SalesPurchaseFormData) => {
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

  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { data, column, oldValue, valueChanged, node } = e;
    const { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;

    const validationErrors: any = {
      sptype: !newValue
        ? `${type} account name is required`
        : /^\d+$/.test(newValue)
          ? `Only numbers not allowed`
          : newValue.length > 100
            ? `${type} account name must be 100 characters or less`
            : '',
      igst: !newValue
        ? `IGST is required`
        : /[^0-9.]/.test(newValue)
          ? 'Only numbers allowed'
          : '',
    };

    if (validationErrors[field]) {
      settingPopupState(false, `${validationErrors[field]}`);
      node.setDataValue(field, oldValue);
      return;
    }

    if (field === 'igst') {
      data.cgst = newValue / 2;
      data.sgst = newValue / 2;
    }
    const endPoint =
      type === 'Sales'
        ? `/${organizationId}/sale`
        : `/${organizationId}/purchase`;
    const endpoint = `${endPoint}/${data.sp_id}`;
    await sendAPIRequest(endpoint, {
      method: 'PUT',
      body: { ...data, [field]: newValue },
    });
    type === 'Sales' ? dispatch(getAndSetSales(organizationId)) : dispatch(getAndSetPurchase(organizationId));
  };

    const defaultCols={
      flex: 1,
      filter: true,
      suppressMovable: true,
      headerClass: 'custom-header',
      floatingFilter: true,
      editable : updateAccess
    }

  const colDefs: any[] = [
    {
      headerName: 'Name',
      field: 'sptype',
    },
    {
      headerName: 'IGST %',
      field: 'igst',
      valueFormatter: decimalFormatter,
    },
    {
      headerName: 'CGST %',
      field: 'cgst',
      editable : false,
      valueFormatter: decimalFormatter,
      headerClass: 'custom-header custom_header_class',
    },
    {
      headerName: 'SGST %',
      field: 'sgst',
      editable : false,
      valueFormatter: decimalFormatter,
    },
    {
      headerName: 'Cess %',
      field: 'surCharge',
      valueFormatter: decimalFormatter,
    },
    {
      headerName: 'Short Name',
      field: 'shortName',
    },
    {
      headerName: 'Actions',
      headerClass: 'custom-header-class custom-header',
      sortable: false,
      editable: false,
      suppressMovable: true,
      flex: 1,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: (params: { data: SalesPurchaseFormData }) => (
        <div className='table_edit_buttons'>
         {updateAccess && <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => handleUpdate(params.data)}
          />}
          {deleteAccess && <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => handleDelete(params.data)}
          />}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className='w-full relative'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>{type} Account</h1>
          {createAccess &&<Button
            type='highlight'
            id='sp_button'
            handleOnClick={() => togglePopup(true)}
          >
            Add {type}
          </Button>}
        </div>
        <div
          id='account_table'
          className='ag-theme-quartz bg-[white] h-[calc(100vh_-_7.4rem)] mx-[1rem] my-0 rounded-[1.4rem]'
        >
          <AgGridReact
            rowData={tableData}
            columnDefs={colDefs}
            defaultColDef={defaultCols}
            onCellClicked={onCellClicked}
            onCellEditingStarted={cellEditingStarted}
            onCellEditingStopped={handleCellEditingStopped}
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
            className='absolute'
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
            className='absolute'
          />
        )}
      </div>
    </>
  );
};
