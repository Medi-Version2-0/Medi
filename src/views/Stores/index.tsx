import { useEffect, useState, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { popupOptions, StoreFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import { CreateStore } from './CreateStore';
import { storeValidationSchema } from './validation_schema';
import usePermission from '../../hooks/useRole';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import useApi from '../../hooks/useApi';

const initialValue = {
  store_code: '',
  store_name: '',
  address1: '',
  address2: '',
  address3: '',
  isPredefinedStore: false,
};

export const Store = () => {
  const { sendAPIRequest } = useApi();
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<StoreFormData | any>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectedStoreAddress, setSelectedStoreAddress] = useState({
    address1: '',
    address2: '',
    address3: '',
  });
  const editing = useRef(false);
  const isDelete = useRef(false);
  const { createAccess, updateAccess, deleteAccess } = usePermission('store')
  const popUpInitialValues = useMemo<popupOptions>(()=>{
    return {
      isModalOpen: false,
      isAlertOpen: false,
      message: '',
    }
  },[]);
  const [popupState, setPopupState] = useState<popupOptions>(popUpInitialValues);
  const [tableData, setTableData] = useState<StoreFormData[]>([]);
  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState((previousState: popupOptions)=>{
      return {
        ...previousState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    }
    });
  };

  useEffect(() => {
    getAndSetTableData();
  }, []);

  async function getAndSetTableData() {
    try {
      const allStores = await sendAPIRequest('/store');
      setTableData(allStores);
    } catch (err) {
      console.error('Store data in store index not being fetched');
    }
  }

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialValue);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };

  const handleAlertCloseModal = () => {
    setPopupState(popUpInitialValues);
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async (values:StoreFormData) => {
    try {
      if (values !== initialValue) {
        if (values.store_code) {
          await sendAPIRequest(
            `/store/${formData.store_code}`,
            {
              method: 'PUT',
              body: values,
            }
          );
        } else {
          await sendAPIRequest(`/store`, {
            method: 'POST',
            body: values,
          });
        }
        await getAndSetTableData();
        togglePopup(false);
      }
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Store not created or updated');
      }
    }
  };

  const deleteAcc = async () => {
    isDelete.current = false;
    togglePopup(false);
    setPopupState(popUpInitialValues);
    try {
      await sendAPIRequest(`/store/${selectedRow.store_code}`, {
        method: 'DELETE',
      });
      await getAndSetTableData();
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Store not deleted');
      }
    }finally{
      setSelectedRow(null);
    }
  };

  const handleDelete = (oldData: StoreFormData) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
  };

  const handleUpdate = (oldData: StoreFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  function handleDeleteFromForm() {
    settingPopupState(true, 'Are you sure you want to delete the group');
  }

  const handleCellEditingStopped = async (e: any) => {
    editing.current = false;
    const { data, column, oldValue, valueChanged, node } = e;
    let { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;
    try {
      await storeValidationSchema.validateAt(field, { [field]: newValue });

      if (field === 'store_name') {
        const existingStore = tableData.filter(
          (store: StoreFormData) =>
            store.store_name.toLowerCase() === newValue.toLowerCase()
        );

        if (existingStore.length > 1) {
          settingPopupState(false,'Store with this name already exists')
          node.setDataValue(field, oldValue);
          return;
        }

        newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
      }
    } catch (error: any) {
      settingPopupState(false,error.message);
      node.setDataValue(field, oldValue);
      return;
    }

    node.setDataValue(field, newValue);
    try {
      await sendAPIRequest(`/store/${data.store_code}`, {
        method: 'PUT',
        body: { [field]: newValue },
      });
      await getAndSetTableData();
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Store not updated');
      }
    }
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
    handleKeyDownCommon(
      event,
      handleDelete,
      handleUpdate,
      undefined,
      selectedRow,
      undefined
    );
  };

  useHandleKeydown(handleKeyDown, [selectedRow, popupState])

  const colDefs: any[] = [
    {
      headerName: 'Store Name',
      field: 'store_name',
      flex: 3,
      filter: true,
      editable: (p:any)=>{
       if(updateAccess){
        const isPredefined = !p.data.isPredefinedStore
        if(!isPredefined){
          settingPopupState(false,'Predefined Stores are not editable');
        }
        return isPredefined
       }
       return updateAccess
      },
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
          {updateAccess && <FaEdit
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => {
              if (params.data.isPredefinedStore) {
                settingPopupState(false,'Predefined Stores are not editable');
              } else {
                handleUpdate(params.data);
              }
            }}
          />}
          {deleteAccess && <MdDeleteForever
            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
            onClick={() => {
              if (params.data.isPredefinedStore) {
                settingPopupState(false,'Predefined Stores should not be deleted');
              } else {
                handleDelete(params.data);
              }
            }}
          />}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className='w-full relative'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Store List</h1>
         {createAccess && <Button
            type='highlight'
            id='add'
            className=''
            handleOnClick={() => togglePopup(true)}
          >
            Add Store
          </Button>}
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
                : deleteAcc
            }
            message={popupState.message}
            isAlert={popupState.isAlertOpen}
            className='absolute'
            id='storeAlert'
          />
        )}
        {open && (
          <CreateStore
            togglePopup={togglePopup}
            data={formData}
            handleDeleteFromForm={handleDeleteFromForm}
            handleConfirmPopup={handleConfirmPopup}
            isDelete={isDelete.current}
            className='absolute'
          />
        )}
      </div>
    </>
  );
};
