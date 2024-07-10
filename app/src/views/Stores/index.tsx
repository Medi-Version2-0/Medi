import { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { StoreFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import { CreateStore } from './CreateStore';
import { sendAPIRequest } from '../../helper/api';

const initialValue = {
  store_code: '',
  store_name: '',
  address1: '',
  address2: '',
  address3: '',
};

export const Store = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<StoreFormData | any>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<StoreFormData | any>(null);
  const [selectedStoreAddress, setSelectedStoreAddress] = useState({
    address1: '',
    address2: '',
    address3: '',
  });
  const editing = useRef(false);
  const isDelete = useRef(false);

  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  useEffect(() => {
    getStores();
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  const getStores = async () => {
    const stores = await sendAPIRequest('/store');
    setTableData(stores);
  };

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialValue);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async () => {
    setPopupState({ ...popupState, isModalOpen: false });
    if (formData.store_name) {
      formData.store_name =
        formData.store_name.charAt(0).toUpperCase() +
        formData.store_name.slice(1);
    }
    if (formData !== initialValue) {
      if (formData.store_code) {
        await sendAPIRequest(`/store/${formData.store_code}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        await sendAPIRequest('/store', { method: 'POST', body: formData });
      }
      togglePopup(false);
      getStores();
    }
  };

  const handelFormSubmit = (values: StoreFormData) => {
    const mode = values.store_code ? 'update' : 'create';
    const existingStore = tableData.find((store: StoreFormData) => {
      if (mode === 'create') {
        return (
          store.store_name.toLowerCase() === values.store_name.toLowerCase()
        );
      }
      return (
        store.store_name.toLowerCase() === values.store_name.toLowerCase() &&
        store.store_code !== values.store_code
      );
    });

    if (existingStore) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Store with this name already exists!',
      });
      return;
    }

    if (values.store_name) {
      values.store_name =
        values.store_name.charAt(0).toUpperCase() + values.store_name.slice(1);
    }
    if (values !== initialValue) {
      setPopupState({
        ...popupState,
        isModalOpen: true,
        message: `Are you sure you want to ${mode} this Store?`,
      });
      setFormData(values);
    }
  };

  const deleteAcc = async (store_code: string) => {
    isDelete.current = false;
    togglePopup(false);
    await sendAPIRequest(`/store/${store_code}`, { method: 'DELETE' });
    getStores();
  };

  const handleDelete = (oldData: StoreFormData) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
    setSelectedRow(null);
  };

  const handleUpdate = (oldData: StoreFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { data, column, oldValue, valueChanged, node } = e;
    let { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;
    switch (field) {
      case 'store_name':
        {
          const existingStore = tableData.filter(
            (store: StoreFormData) =>
              store.store_name.toLowerCase() === newValue.toLowerCase()
          );

          if (existingStore.length > 1) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'Store with this name already exists!',
            });
            node.setDataValue(field, oldValue);
            return;
          } else if (
            !newValue ||
            /^\d+$/.test(newValue) ||
            newValue.length > 100
          ) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: !newValue
                ? 'Store Name is required'
                : /^\d+$/.test(newValue)
                  ? 'Only Numbers not allowed'
                  : 'Store name cannot exceed 100 characters',
            });
            node.setDataValue(field, oldValue);
            return;
          }
          newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
        }
        break;
      default:
        break;
    }
    await sendAPIRequest(`/store/${data.store_code}`, {
      method: 'PUT',
      body: { [field]: newValue },
    });
    getStores();
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
    setSelectedStoreAddress({
      address1: params.data.address1,
      address2: params.data.address2,
      address3: params.data.address3,
    });
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

  const handleCellKeyDown = (event: any) => {
    const { node } = event;

    if (event.event.key === 'ArrowDown' || event.event.key === 'ArrowUp') {
      const nextRowIndex =
        event.event.key === 'ArrowDown' ? node.rowIndex + 1 : node.rowIndex - 1;

      const nextRowNode = event.api.getDisplayedRowAtIndex(nextRowIndex);

      if (nextRowNode) {
        const nextRowData = nextRowNode.data;
        setSelectedRow(nextRowData);
        setSelectedStoreAddress({
          address1: nextRowData.address1,
          address2: nextRowData.address2,
          address3: nextRowData.address3,
        });
      }
    }
  };

  const colDefs: any[] = [
    {
      headerName: 'Store Name',
      field: 'store_name',
      flex: 3,
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
      cellRenderer: (params: { data: StoreFormData }) => (
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
      <div className='w-full relative'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Store List</h1>
          <Button
            type='highlight'
            className=''
            handleOnClick={() => togglePopup(true)}
          >
            Add Store
          </Button>
        </div>
        <div
          id='store_table'
          className='ag-theme-quartz bg-[white] h-[calc(100vh_-_11rem)] mx-8 my-2 rounded-[1.4rem]'
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
              onCellKeyDown={handleCellKeyDown}
            />
          }
        </div>
        <div className='flex flex-col gap-1 relative border h-[6rem] p-4 border-solid border-[gray] text-gray-600 text-sm  mx-8 my-[1em]'>
          <div className='absolute top-[-0.8rem] inline-block text-base text-black px-1 py-0 left-1 bg-[#f3f3f3]'>
            Address
          </div>
          <div className='w-full'>{selectedStoreAddress.address1}</div>
          <div className='w-full'>{selectedStoreAddress.address2}</div>
          <div className='w-full'>{selectedStoreAddress.address3}</div>
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
          <CreateStore
            togglePopup={togglePopup}
            data={formData}
            handelFormSubmit={handelFormSubmit}
            isDelete={isDelete.current}
            deleteAcc={deleteAcc}
            className='absolute'
          />
        )}
      </div>
    </>
  );
};
