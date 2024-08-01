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
import { useDispatch } from 'react-redux'
import { setSales, setPurchase } from '../../store/action/globalAction';
import usePermission from '../../hooks/useRole';

const initialValue: SalesPurchaseFormData = {
  sptype: '',
  igst: '0.00',
  surCharge: '',
  shortName: '',
  shortName2: '',
};

const useSalesData = (type: string, organizationId?: string) => {
  const [tableData, setTableData] = useState<SalesPurchaseFormData[]>([]);
  const dispatch = useDispatch()

  const getSalesData = async () => {
    const endpoint =
      type === 'Sales'
        ? `/${organizationId}/sale`
        : `/${organizationId}/purchase`;
    const data = await sendAPIRequest<SalesPurchaseFormData[]>(endpoint);
    type === 'Sales' ? dispatch(setSales(data)) : dispatch(setPurchase(data));
    setTableData(data);
  };

  useEffect(() => {
    getSalesData();
  }, [type]);

  return { tableData, getSalesData };
};

export const Sales_Table = ({ type }: SalesPurchaseTableProps) => {
  const { organizationId } = useParams();
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<SalesPurchaseFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const { createAccess, updateAccess, deleteAccess } = usePermission(type === 'Sales' ?'sales_account' : 'purchase_account')

  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const editing = useRef(false);
  const isDelete = useRef(false);
  const dispatch = useDispatch()

  const { tableData, getSalesData } = useSalesData(type, organizationId);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialValue);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };

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

  const decimalFormatter = (
    params: ValueFormatterParams
  ): string | undefined => {
    if (!params.value) return;
    return parseFloat(params.value).toFixed(2);
  };

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
        message: `${type} account with this name already exists!`,
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
    const filteredData = tableData?.filter((x: SalesPurchaseFormData) => x.sp_id !== sp_id);
    type === 'Sales' ? dispatch(setSales(filteredData)) : dispatch(setPurchase(filteredData));
    getSalesData();
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
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: validationErrors[field],
      });
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
    getSalesData();
  };

  const colDefs: any[] = [
    {
      headerName: 'Name',
      field: 'sptype',
      flex: 1,
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
            defaultColDef={{
              floatingFilter: true,
            }}
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
