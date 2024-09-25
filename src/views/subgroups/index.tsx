import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { SubGroupFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { CreateSubGroup } from './CreateSubGroup';
import Button from '../../components/common/button/Button';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { subgroupValidationSchema } from './validation_schema';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import usePermission from '../../hooks/useRole';
import { useSelector } from 'react-redux';
import { getAndSetSubGroups } from '../../store/action/globalAction';
import { extractKeys, lookupValue } from '../../helper/helper';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import { useGetSetData } from '../../hooks/useGetSetData';
import useApi from '../../hooks/useApi';

export const SubGroups = () => {
  const initialValue = {
    group_code: '',
    group_name: '',
    parent_code: '',
  };
  const { sendAPIRequest } = useApi();
  const [open, setOpen] = useState<boolean>(false);
  const { createAccess, updateAccess } = usePermission('subgroup');
  const [formData, setFormData] = useState<SubGroupFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<SubGroupFormData | any>(null);
  const editing = useRef(false);
  const permissions = usePermission('subgroup')
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };

  const pinnedRow: SubGroupFormData = {
    group_name: ''
  };
  const getAndSetSubGroupsHandler = useGetSetData(getAndSetSubGroups);
  const { subGroups, groups: groupList } = useSelector((state: any) => state.global);
  const gridRef = useRef<any>(null);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  useEffect(() => {
    document.getElementById('account_button')?.focus();  // when component mounted then focus will be on addGroup button
  }, [document.getElementById('account_button')]);  

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
      parent_code: respData.group_name ? respData.parent_code : formData.parent_code,
    };

    try{
      if (payload !== initialValue) {
        if (formData.group_code) {
          await sendAPIRequest(
            `/subGroup/${formData.group_code}`,
            {
              method: 'PUT',
              body: formData,
            }
          );
        } else {
          await sendAPIRequest(`/subGroup`, {
            method: 'POST',
            body: payload,
          });
        }
        togglePopup(false);
        getAndSetSubGroupsHandler();
      }
    }catch(error:any){
      if (!error?.isErrorHandled) {
        console.log('Sub Group not created or updated')
      }
    }
  };
  const isDelete = useRef(false);

  const togglePopup = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialValue);
      isDelete.current = false;
    }
    setOpen(isOpen);
  };
  useEffect(()=>{
    setTableData([...(permissions.createAccess ?[pinnedRow]:[]), ...subGroups]);
  }, [subGroups, permissions.createAccess]);

  const deleteAcc = async (group_code: string) => {
    try{
      isDelete.current = false;
      togglePopup(false);
      await sendAPIRequest(`/subGroup/${group_code}`, {
        method: 'DELETE',
      });
      getAndSetSubGroupsHandler();
    }catch(error:any){
      if (!error?.isErrorHandled) {
        console.log('Sub Group not deleted');
      }
    }
  };

  const handleDelete = (oldData: SubGroupFormData) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
    setSelectedRow(null);
  };

  const handleUpdate = (oldData: SubGroupFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const handelFormSubmit = (values: SubGroupFormData) => {
    const mode = values.group_code ? 'update' : 'create';
    const existingGroup = tableData.find((group: SubGroupFormData) => {
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
      settingPopupState(false, 'Sub Group with this name already exists!');
      return;
    }
    if (values.group_name) {
      values.group_name =
        values.group_name.charAt(0).toUpperCase() + values.group_name.slice(1);
    }
    if (values !== initialValue) {
      settingPopupState(true, `Are you sure you want to ${mode} this group?`);
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
    if (!valueChanged && node.rowIndex !== 0) return;
    const field = column.colId;
    if (field === 'group_name'){
      newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
      const existingGroup = tableData.find((group: SubGroupFormData) => group.group_name.toLowerCase() === newValue.toLowerCase() && group.group_code !== data.group_code);
      if (existingGroup) {
        settingPopupState(false, 'Sub Group with this name already exists!');
        node.setDataValue(field, oldValue);
        return;
      }
    }
    if (node.rowIndex === 0 && permissions.createAccess) {
      if (data.group_name && data.parent_code) {
        try { 
          await subgroupValidationSchema.validate(data);
            handleConfirmPopup(data)
          if (field === 'igst_sale' && newValue) {
            newValue = newValue.toLowerCase();
          }
        } catch (error: any) {
          settingPopupState(false, error.message);
          node.setDataValue(field, oldValue);
          return;
        }
    }
  }else{
    node.setDataValue(field, newValue);
    try{
      await sendAPIRequest(`/subGroup/${data.group_code}`, {
        method: 'PUT',
        body: { [field]: newValue },
      });
      getAndSetSubGroupsHandler();
    }catch(error:any){
      if (!error?.isErrorHandled) {
        settingPopupState(false, 'Subgroup name should not be empty');
        node.setDataValue(field, oldValue);
        return;
      }
    }
  }
  };

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(params.data);
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

  useHandleKeydown(handleKeyDown,[selectedRow]);
  const parentGroupMap: { [key: number]: string } = {};

  groupList.forEach((group: any) => {
    parentGroupMap[group.group_code] = group.group_name.toUpperCase();
  });

  const parentGroup = extractKeys(parentGroupMap);

  const defaultCol = {
    floatingFilter: true,
    flex: 1,
    filter: true,
    editable: (params: any) => params.node.rowIndex === 0 ? createAccess : updateAccess,
    suppressMovable: true,
    headerClass: 'custom-header',
    cellRenderer: (params: any) => (
      <PlaceholderCellRenderer
        value={params.value}
        rowIndex={params.node.rowIndex}
        column={params.colDef}
        startEditingCell={(editParams: any) => {
          gridRef.current?.api?.startEditingCell(editParams);
        }}
        placeholderText={params.colDef.headerName}
      />
    ),
  }

  const colDefs: (ColDef<any, any> | ColGroupDef<any>)[] | null | undefined[] =
    [
      {
        headerName: 'Sub Group Name',
        field: 'group_name',
      },
      {
        headerName: 'Parent Group',
        field: 'parent_code',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params: any) => {
          return {
            values: parentGroup,
            valueListMaxHeight: 120,
            valueListMaxWidth: 185,
            valueListGap: 8,
            value: params.data.parent_code,
          }
        },
        valueFormatter: (params: { value: string | number }) =>
          lookupValue(parentGroupMap, params.value),
        valueGetter: (params: { data: any }) => {
        return lookupValue(parentGroupMap, params.data.parent_code);
        },
        filterValueGetter: (params: { data: any }) => {
        return lookupValue(parentGroupMap, params.data.parent_code);
        },
       },
      {
        headerName: 'Actions',
        headerClass: 'custom-header-class custom-header',
        sortable: false,
        filter:false,
        editable:false,
        cellStyle: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        cellRenderer: (params: { data: SubGroupFormData }) => (
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
          <h1 className='font-bold'>Sub Groups</h1>
          {permissions.createAccess && <Button
            id='account_button'
            handleOnClick={() => togglePopup(true)}
            type='highlight'
          >
            Add Subgroup
          </Button>}
        </div>
        <div id='account_table' className='ag-theme-quartz'>
          {
            <AgGridReact
              rowData={tableData}
              columnDefs={colDefs}
              defaultColDef={defaultCol}
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
          <CreateSubGroup
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
