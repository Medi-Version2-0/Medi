import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ItemGroupFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { CreateItemGroup } from './createItemGroup';
import Button from '../../components/common/button/Button';
import { sendAPIRequest } from '../../helper/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { itemGroupValidationSchema } from './validation_schema';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';

export const ItemGroups = () => {
const initialData = {
  group_code: '',
  group_name: '',
  type: '',
};
  const { organizationId } = useParams();
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<ItemGroupFormData>({
    group_name: '',
    group_code: '',
    type: '',
  });
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<ItemGroupFormData | any>(null);
  const queryClient = useQueryClient();
  const editing = useRef(false);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const gridRef = useRef<any>(null);

  const { data } = useQuery<{ data: ItemGroupFormData }>({
    queryKey: ['get-itemGroups'],
    queryFn: () =>
      sendAPIRequest<{ data: ItemGroupFormData }>(
        `/${organizationId}/itemGroup`
      ),
  });

  const typeMapping = {
    p_and_l: 'P&L',
    balance_sheet: 'Balance Sheet',
  };

  const extractKeys = (mappings: any) => {
    const value = Object.keys(mappings);
    value[0] = 'P&L';
    value[1] = 'Balance Sheet';
    return value;
  };

  const types = extractKeys(typeMapping);

  const lookupValue = (mappings: any, key: string | number) => {
    return mappings[key];
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async (data?: any) => {
    const respData = data ? data : formData;
    setPopupState({ ...popupState, isModalOpen: false });
    if (formData.group_name) {
      formData.group_name =
        formData.group_name.charAt(0).toUpperCase() +
        formData.group_name.slice(1);
    }
    const payload = {
      group_name: respData.group_name ? respData.group_name : formData.group_name,
      type: respData.group_name ? respData.type : formData.type,
    };
    
    if (payload !== initialData) {
      if (formData.group_code) {
        const response: any  = await sendAPIRequest(
          `/${organizationId}/itemGroup/${formData.group_code}`,
          {
            method: 'PUT',
            body: formData,
          }
        );
        queryClient.invalidateQueries({ queryKey: ['get-itemGroups'] });
      } else {
        const response: any  = await sendAPIRequest(`/${organizationId}/itemGroup`, {
          method: 'POST',
          body: payload,
        });
        if (respData.group_name && !response.error) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: 'Item Group saved successfully',
          });
        }
        setTableToInitialState();
      }
      togglePopup(false);
      queryClient.invalidateQueries({ queryKey: ['get-itemGroups'] });
    }
  };
  const isDelete = useRef(false);

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialData);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };

  const getGroups = async () => {
    if (Array.isArray(data)) {
      setTableData([initialData, ...data]);
    }
    return data;
  };

  const deleteAcc = async (group_code: string) => {
    togglePopup(false);
    isDelete.current = false;

    await sendAPIRequest(`/${organizationId}/itemGroup/${group_code}`, {
      method: 'DELETE',
    });
    queryClient.invalidateQueries({ queryKey: ['get-itemGroups'] });
  };

  const handleDelete = (oldData: ItemGroupFormData) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
    setSelectedRow(null);
  };

  const handleUpdate = (oldData: ItemGroupFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const handelFormSubmit = (values: ItemGroupFormData) => {
    const mode = values.group_code ? 'update' : 'create';
    const existingGroup = (tableData || []).find((group: ItemGroupFormData) => {
      if (mode === 'create')
        return (
          group.group_name.toLowerCase() === values.group_name.toLowerCase()
        );
      return (
        group.group_name.toLowerCase() === values.group_name.toLowerCase() &&
        group.group_code !== values.group_code
      );
    });
    if (existingGroup) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Item Group with this name already exists!',
      });
      return;
    }
    if (values.group_name) {
      values.group_name =
        values.group_name.charAt(0).toUpperCase() + values.group_name.slice(1);
    }
    if (values !== initialData) {
      setPopupState({
        ...popupState,
        isModalOpen: true,
        message: `Are you sure you want to ${mode} this group?`,
      });
      setFormData(values);
    }
  };

  const handleCellEditingStopped = async (e: {
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
    if (node.rowIndex === 0) {
      if (data.group_name && data.type) {
        try {
          await itemGroupValidationSchema.validate(data);

          if (field === 'group_name') {
            newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
          } else if (field === 'igst_sale' && newValue) {
            newValue = newValue.toLowerCase();
          }
          handleConfirmPopup(data);
        } catch (error: any) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: error.message,
          });
        }
      }

      node.setDataValue(field, newValue);
    } else {
      try {
        await itemGroupValidationSchema.validateAt(field, {[field]: newValue,});
        await sendAPIRequest(
          `/${organizationId}/itemGroup/${data.group_code}`,
          {
            method: 'PUT',
            body: { [field]: newValue },
          }
        );
        queryClient.invalidateQueries({ queryKey: ['get-itemGroups'] });
      } catch (error: any) {
        setPopupState({
          ...popupState,
          isAlertOpen: true,
          message: error.message,
        });
        node.setDataValue(field, oldValue);
      }
    }
  };

  const setTableToInitialState = async () => {
    if (Array.isArray(data)) {
      const combinedData = [initialData, ...data];
      setTableData(combinedData);
    }
};

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
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

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);

  useEffect(() => {
    getGroups();
  }, [data]);

  const colDefs: (ColDef<any, any> | ColGroupDef<any>)[] | null | undefined[] =
    [
      {
        headerName: 'Group Name',
        field: 'group_name',
        flex: 1,
        filter: true,
        editable: true,
        headerClass: 'custom-header',
        suppressMovable: true,
        cellRenderer: (params: any) => (
          <PlaceholderCellRenderer
            value={params.value}
            rowIndex={params.node.rowIndex}
            column={params.colDef}
            startEditingCell={(editParams : any) => {
              gridRef.current?.api?.startEditingCell(editParams);
            }}
            placeholderText={params.colDef.headerName}
          />
        ),
      },
      {
        headerName: 'P&L / BL. Sheet',
        field: 'type',
        filter: true,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: types,
        },
        valueFormatter: (params: { value: string | number }) =>
          lookupValue(typeMapping, params.value),
        flex: 1,
        headerClass: 'custom-header',
        suppressMovable: true,
        cellRenderer: (params: any) => (
          <PlaceholderCellRenderer
            value={params.value}
            rowIndex={params.node.rowIndex}
            column={params.colDef}
            startEditingCell={(editParams : any) => {
              gridRef.current?.api?.startEditingCell(editParams);
            }}
            placeholderText={params.colDef.headerName}
          />
        ),
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
        cellRenderer: (params: { data: ItemGroupFormData }) => (
          <div className='table_edit_buttons'>
            <FaEdit
              style={{ cursor: 'pointer', fontSize: '1.1rem' }}
              onClick={() => {
                handleUpdate(params.data);
              }}
            />

            <MdDeleteForever
              style={{ cursor: 'pointer', fontSize: '1.2rem' }}
              onClick={() => {
                const groupToDelete = params.data;
                handleDelete(groupToDelete);
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
          <h1 className='font-bold'>Item Groups</h1>
          <Button
            type='highlight'
            className=''
            handleOnClick={() => togglePopup(true)}
          >
            Add Group
          </Button>
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
            className='absolute'
          />
        )}
        {open && (
          <CreateItemGroup
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
