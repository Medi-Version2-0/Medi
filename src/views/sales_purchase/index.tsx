import React, { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import {
  SalesPurchaseFormData,
  SalesPurchaseTableProps,
} from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import { CreateSalePurchase } from './CreateSalePurchase';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import usePermission from '../../hooks/useRole';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { capitalFirstLetter, decimalFormatter, removeNullUndefinedEmptyString, stringValueParser } from '../../helper/helper';
import useApi from '../../hooks/useApi';
import { CellEditingStoppedEvent, ColDef, GridOptions, ValueParserParams } from 'ag-grid-community';

const initialValue: SalesPurchaseFormData = {
  sptype: '',
  igst: '',
  surCharge: '',
  shortName: '',
  shortName2: '',
};

export const Sales_Table = ({ type }: SalesPurchaseTableProps) => {
  const { sendAPIRequest } = useApi();
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<SalesPurchaseFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const { createAccess, updateAccess, deleteAccess } = usePermission(type === 'Sales' ?'saleaccount' : 'purchaseaccount')
  const [tableData, setTableData] = useState<SalesPurchaseFormData[]>([]);

  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const editing = useRef(false);
  const isDelete = useRef(false);

  async function getAndSetTableData() {
    try {
      const data = await sendAPIRequest(`${type === 'Sales'? '/saleAccount' : '/purchaseAccount'}`);
      setTableData(data);
    } catch (err) {
      console.error(`${type === 'Sales' ? 'SalesAccount' : 'PurchaseAccount'} data in salePurchase (index) not being fetched`);
    }
  }

  useEffect(() => {
    getAndSetTableData();
  }, [createAccess]);

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
    setPopupState({ ...popupState, isAlertOpen: false, isModalOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async (data: SalesPurchaseFormData) => {
    setPopupState({ ...popupState, isModalOpen: false });
    data.salesPurchaseType = type;
    if (data !== initialValue) {
      const endPoint =
        type === 'Sales'
          ? `/saleAccount`
          : `/purchaseAccount`;
      const endpoint = data.sp_id
        ? `${endPoint}/${data.sp_id}`
        : `${endPoint}`;
      const method = data.sp_id ? 'PUT' : 'POST';
      const filteredData:any = removeNullUndefinedEmptyString(data);
      filteredData.igst = parseFloat(filteredData.igst)
      filteredData.openingBal = parseFloat(filteredData.openingBal)
      filteredData.surCharge = parseFloat(filteredData.surCharge)
      try {
        await sendAPIRequest(endpoint, { method, body: filteredData });
        settingPopupState(false,`${type}Account ${method === 'POST' ? 'created' : 'updated'}`);
        await getAndSetTableData();
        togglePopup(false);
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          if (error.response?.data.messages) {
            settingPopupState(false, error.response?.data.messages.map((e: any) => e.message).join('\n'))
            await getAndSetTableData();  // fetch latest data
            return
          }
          if (error.response?.data) {
            settingPopupState(false, error.response.data.error?.message)
          }
          await getAndSetTableData();  // fetch latest data
        }
      }
    }
  };

  const handleUpdate = (oldData: SalesPurchaseFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const deleteAcc = async () => {
    isDelete.current = false;
    togglePopup(false);
    const endPoint =
      type === 'Sales'
        ? `/saleAccount`
        : `/purchaseAccount`;
    const endpoint = `${endPoint}/${selectedRow.sp_id}`;
    togglePopup(false);
    try {
      await sendAPIRequest(endpoint, { method: 'DELETE' });
      settingPopupState(false,`${type}Account deleted`)
      await getAndSetTableData();
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        if (error.response.data) settingPopupState(false, error.response.data.error.message);
        console.log(`${type === 'Sales' ? "SaleAccount" : "PurchaseAccount"} not deleted`);
      }
    }
  };

  function handleDeleteFromForm(){
    settingPopupState(true,`Are you sure you want to delete ${type}Account`)
  }

  const handleDelete = (oldData: SalesPurchaseFormData) => {
    setFormData(oldData);
    isDelete.current = true;
    togglePopup(true);
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const valueParser = (params: ValueParserParams): number | null => {
    const { newValue, colDef } = params;
    if (parseFloat(newValue) < 0) {  // value must be positive
      settingPopupState(false, `${colDef.field && colDef.field === 'igst'? 'IGST' : colDef.field } can't be negative`);
      return 0;
    }
    // if (parseFloat(newValue) > 10000) { // value should more than 100 as it is percentage value
    //   // settingPopupState(false, `${colDef.field && colDef.field === 'igst'? 'IGST' : colDef.field } can't be more than ${maxLimit}`);
    //   return 10000;
    // }
    const parsedValue = parseFloat(newValue);
    return isNaN(parsedValue) ? null : parsedValue;
  }

  const actionCellRenderer = (params: { data: SalesPurchaseFormData }) => (
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
  )

  const handleCellEditingStopped = async (e: CellEditingStoppedEvent) => {
    editing.current = false;
    const { data, oldValue, valueChanged, node } = e;
    const { newValue } = e;
    if (!valueChanged) return;
    const field = e.colDef.field!;

    const validationErrors: any = {
      sptype: !newValue
              ? `${type} account name is required`
              : /^\d+$/.test(newValue)
              ? `Only numbers not allowed`
              : newValue.length > 100
              ? `${type} account name must be 100 characters or less`
              : null
    };

    if (validationErrors[field]) {
      settingPopupState(false, `${validationErrors[field]}`);
      node.setDataValue(field, oldValue);
      return;
    }
    const endPoint =
      type === 'Sales'
        ? `/saleAccount`
        : `/purchaseAccount`;
    const endpoint = `${endPoint}/${data.sp_id}`;
    try {
      await sendAPIRequest(endpoint, {
        method: 'PUT',
        body: { [field]: newValue || newValue === 0 ? newValue : null },
      });
      await getAndSetTableData(); // also get latest data from server
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        if(error.response?.data.messages){
          settingPopupState(false, error.response?.data.messages.map((e: any) => e.message).join('\n'))
          await getAndSetTableData(); // fetch latest data
          return
        }
        if(error.response?.data){
          settingPopupState(false, error.response.data.error?.message)
        }
        await getAndSetTableData(); // fetch latest data
      }
    }
  };

  const defaultColDef: ColDef ={
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
      valueParser: stringValueParser,
    },
    {
      headerName: 'IGST %',
      field: 'igst',
      type: 'numberColumn',  // this column is number type
      cellEditor: 'agNumberCellEditor',  // this handle input only numbers as this column is number type
      valueParser,
      valueFormatter: decimalFormatter,  // format all values to 2 decimals
    },
    {
      headerName: 'CGST %',
      field: 'cgst',
      editable : false,
      type: 'numberColumn',
      valueFormatter: decimalFormatter,
      headerClass: 'custom-header custom_header_class',
    },
    {
      headerName: 'SGST %',
      field: 'sgst',
      editable : false,
      type: 'numberColumn',
      valueFormatter: decimalFormatter,
    },
    {
      headerName: 'Cess %',
      field: 'surCharge',
      type: 'numberColumn', 
      cellEditor: 'agNumberCellEditor',
      valueParser,
      valueFormatter: decimalFormatter,
    },
    {
      headerName: 'Short Name',
      field: 'shortName',
      valueParser: stringValueParser,
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
      cellRenderer: actionCellRenderer,
    },
  ];

  const gridOptions: GridOptions<any> = {
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [20, 30, 40],
    defaultColDef,
  };

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
            gridOptions={gridOptions}
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
                : deleteAcc
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
            handleConfirmPopup={handleConfirmPopup}
            isDelete={isDelete.current}
            handleDeleteFromForm={handleDeleteFromForm}
            type={type}
            className='absolute'
          />
        )}
      </div>
    </>
  );
};
