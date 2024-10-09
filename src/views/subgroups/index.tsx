import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { SubGroupFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { CreateSubGroup } from './CreateSubGroup';
import Button from '../../components/common/button/Button';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { subgroupValidationSchema } from './validation_schema';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import usePermission from '../../hooks/useRole';
import { extractKeys, lookupValue, stringValueParser } from '../../helper/helper';
import useHandleKeydown from '../../hooks/useHandleKeydown';
import useApi from '../../hooks/useApi';

export const SubGroups = () => {
  const initialValue = {
    group_code: '',
    group_name: '',
    parent_code: '',
  };
  const { sendAPIRequest } = useApi();
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<SubGroupFormData | any>(null);
  const editing = useRef(false);
  const permissions = usePermission('subgroup')
  const popupInitialState = useMemo(()=>{
    return { isModalOpen: false, isAlertOpen: false, message: '' };
  },[]);
  const [popupState, setPopupState] = useState(popupInitialState);
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
  const [groups, setGroups] = useState<any[]>([]);
  const gridRef = useRef<any>(null);

  async function getAndSetGroups() {
    try {
      const allGroups = await sendAPIRequest('/group');
      setGroups(allGroups);
    } catch (err) {
      console.error('Group data in group index not being fetched');
    }
  }

  async function getAndSetSubGroups() {
    try {
      const allSubGroups = await sendAPIRequest('/subGroup');
      setTableData([...(permissions.createAccess ? [pinnedRow] : []), ...allSubGroups]);
    } catch (err) {
      console.log('Sub group not fetched in group index')
    }
  }

  useEffect(() => {
    getAndSetGroups();
    getAndSetSubGroups();
  }, [permissions.createAccess]);
  

  const handleAlertCloseModal = () => {
    setPopupState(popupInitialState);
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async (data?: any) => {
    setPopupState({ ...popupState, isModalOpen: false });
    try{
      if (data !== initialValue) {
        if (data.group_code) {
          await sendAPIRequest(
            `/subGroup/${formData.group_code}`,
            {
              method: 'PUT',
              body: data,
            }
          );
        } else {
          await sendAPIRequest(`/subGroup`, {
            method: 'POST',
            body: data,
          });
        }
        // settingPopupState(false, `Sub group ${data.group_code ? 'updated' : 'created'} successfully`);
        togglePopup(false);
        await getAndSetSubGroups();
      }
    }catch(error:any){
      if (!error?.isErrorHandled) {
        await getAndSetSubGroups();  // fetch latest sub groups
        settingPopupState(false, error.response.data.error.message) // show backend api response
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

  const deleteAcc = async () => {
    try{
      // settingPopupState(false,'Sub Group deleted')
      isDelete.current = false;
      togglePopup(false);
      await sendAPIRequest(`/subGroup/${selectedRow.group_code}`, {
        method: 'DELETE',
      });
      await getAndSetSubGroups();
      setPopupState(popupInitialState);
    }catch(error:any){
      if (!error?.isErrorHandled) {
        console.log('Sub Group not deleted');
      }
    }finally{
      setSelectedRow(null);
    }
  };

  const handleDelete = (oldData: SubGroupFormData) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
  };

  const handleUpdate = (oldData: SubGroupFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const handleDeleteFromForm = () => {
    settingPopupState(true,'Are you sure you want to delete the subgroup')
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
    const { data, column, newValue, oldValue, valueChanged, node } = e;
    if (!valueChanged && node.rowIndex !== 0) return;
    const field = column.colId;
    if (node.rowIndex === 0 && permissions.createAccess) {
      if (data.group_name && data.parent_code) {
        try { 
          await subgroupValidationSchema.validate(data);
          handleConfirmPopup(data)
        } catch (error: any) {
          settingPopupState(false, error.message);
          node.setDataValue(field, oldValue);
          return;
        }
      }
    }else{
      if (field === 'group_name') {
        if (!newValue) {  // if new value is empty then show popup and setting previous value in cell
          settingPopupState(false, 'Name is required');
          node.setDataValue(field, oldValue);
          return;
        }
      }
      try{
        await sendAPIRequest(`/subGroup/${data.group_code}`, {
          method: 'PUT',
          body: { [field]: newValue },
        });
        await getAndSetSubGroups();
      }catch(error:any){
        if (!error?.isErrorHandled) {
          if (error?.response?.data) {
            settingPopupState(false, error.response.data.error.message);
            node.setDataValue(field, oldValue);
            return;
          }
          settingPopupState(false, 'Subgroup name should not be empty');
          node.setDataValue(field, oldValue);
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
    if (event.key === 'Escape') {
      event.preventDefault();
      togglePopup(false);
      return;
    }
    handleKeyDownCommon(
      event,
      handleDelete,
      handleUpdate,
      togglePopup,  // will be removed
      // undefined,
      selectedRow,
      undefined
    );
  };

  useHandleKeydown(handleKeyDown,[selectedRow]);
  const parentGroupMap: { [key: number]: string } = {};

  groups.forEach((group: any) => {
    parentGroupMap[group.group_code] = group.group_name.toUpperCase();
  });

  const parentGroup = extractKeys(parentGroupMap);

  const defaultColDef: ColDef = {
    floatingFilter: true,
    flex: 1,
    filter: true,
    editable: (params: any) => params.node.rowIndex === 0 ? permissions.createAccess : permissions.updateAccess,
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
        headerName: 'S.No.',
        field: 'Sno',
        flex:0.5,
        valueGetter: (params: any) => params.node ? params.node.rowIndex + 1 : null,
        editable: false
      },
      {
        headerName: 'Sub Group Name',
        field: 'group_name',
        valueParser: stringValueParser,
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
        cellRenderer: (params: { data: SubGroupFormData, node: any }) => (
          !!params.node.rowIndex && <div className='table_edit_buttons'>
            {permissions.updateAccess && <FaEdit
              style={{ cursor: 'pointer', fontSize: '1.1rem' }}
              onClick={() => {
                handleUpdate(params.data);
              }}
            />}
            {permissions.deleteAccess && <MdDeleteForever
              style={{ cursor: 'pointer', fontSize: '1.2rem' }}
              onClick={() => {
                if (!params.node.rowIndex) {  // setting zero indexed row data to empty if user click on delete icon
                  params.node.setData(initialValue);
                  return
                }
                handleDelete(params.data);
              }}
            />}
          </div>
        ),
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
          <h1 className='font-bold'>Sub Groups</h1>
          {permissions.createAccess && <Button
            id='add'
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
              gridOptions={gridOptions}
              onCellClicked={onCellClicked}
              onCellEditingStarted={cellEditingStarted}
              onCellEditingStopped={handleCellEditingStopped}
            />
          }
        </div>
        {(popupState.isModalOpen || popupState.isAlertOpen) && (
          <Confirm_Alert_Popup
            id='viewSGAlert'
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
          <CreateSubGroup
            togglePopup={togglePopup}
            data={formData}
            handleConfirmPopup={handleConfirmPopup}
            isDelete={isDelete.current}
            handleDeleteFromForm={handleDeleteFromForm}
            className='absolute'
            groupList={groups}
          />
        )}
      </div>
    </>
  );
};
