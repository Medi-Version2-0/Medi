import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { GroupFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { ColDef, ColGroupDef, ValueFormatterParams } from 'ag-grid-community';
import { CreateGroup } from './CreateGroup';
import Button from '../../components/common/button/Button';
import { groupValidationSchema } from './validation_schema';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import { useSelector } from 'react-redux'
import { getAndSetGroups } from '../../store/action/globalAction';
import usePermission from '../../hooks/useRole';
import { lookupValue } from '../../helper/helper';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { useGetSetData } from '../../hooks/useGetSetData';
import useApi from '../../hooks/useApi';

export const Groups = () => {
  const initialValue = {
    group_code: '',
    group_name: '',
    type: '',
    parent_code: '',
    isPredefinedGroup: false,
  };
  const { sendAPIRequest } = useApi();
  const { createAccess, updateAccess } = usePermission('group')
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<GroupFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const getAndSetGroupsHandler = useGetSetData(getAndSetGroups);
  const { groups: groupsData, subGroups: subGroupsData } = useSelector((state: any) => state.global);
  const [tableData, setTableData] = useState([...(createAccess ? [initialValue] :[]), ...groupsData]);
  const editing = useRef(false);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const pinnedRow: GroupFormData = {
    group_name: '',
    type: '',
  };
  const [subgroups, setSubgroups] = useState<GroupFormData[]>(subGroupsData);
  const gridRef = useRef<any>(null);

  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };

  useEffect(() => {
    setSubgroups(subGroupsData);
  }, [subGroupsData]);

  const typeMapping = useMemo(() => ({p_and_l: 'P&L', balance_sheet: 'Balance Sheet'}), []);

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleConfirmPopup = async (dataa?: any) => {
   const respData = dataa ? dataa : formData;
   setPopupState({ ...popupState, isModalOpen: false });
   if (formData.group_name) {
     formData.group_name =
     formData.group_name.charAt(0).toUpperCase() +
     formData.group_name.slice(1);
    }
    let payload:any = {
      group_name: respData.group_name || formData.group_name,
      type: formData.type || respData.type
    };
    const isPayloadGroupNameExist = tableData.find((grp:GroupFormData)=> grp.group_name.toLowerCase() === payload.group_name.toLowerCase() && grp.group_code);
    if (isPayloadGroupNameExist && !formData.group_code && isPayloadGroupNameExist.type === payload.type) {
      settingPopupState(false, `${payload.group_name} group already exists`);
      return;
    }else{
      if (isPayloadGroupNameExist) { 
        payload = {...isPayloadGroupNameExist, type: payload.type}
    }}
    if (payload !== initialValue) {
      try {
        if (formData.group_code || (isPayloadGroupNameExist && isPayloadGroupNameExist.type !== payload.type)) {
          await sendAPIRequest(`/group/${formData.group_code || payload.group_code}`,{
              method: 'PUT',
              body: formData.group_name ?  formData : payload,
            }
          );
        } else {
          const response: any = await sendAPIRequest(`/group`, {
            method: 'POST',
            body: payload,
          });
          if (respData.group_name && !response.error) {
            settingPopupState(false, 'Group saved successfully');
          }
        }
        getAndSetGroupsHandler();
        togglePopup(false);
        setFormData(pinnedRow)
      } catch (error:any) {
        if (!error?.isErrorHandled) {
          console.error('Group either not created or updated');
        }
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

  const deleteAcc = async (group_code: string) => {
    isDelete.current = false;
    togglePopup(false);
    try{
      await sendAPIRequest(`/group/${group_code}`, {
        method: 'DELETE',
      });
      getAndSetGroupsHandler();
    }catch(error:any) {
      if (error?.response?.status!== 401 && error.response?.status!== 403) {
        console.error('Group not deleted');
      }
    }
  };

  const handleDelete = (rowData: GroupFormData) => {
    if (rowData.isPredefinedGroup) {
      settingPopupState(false, 'Predefined Groups should not be deleted')
      return;
    }
      const isParentGroup = subgroups.some((subgroup: GroupFormData) => subgroup?.parent_code === (selectedRow?.group_code || rowData?.group_code));
      if (isParentGroup) {
        settingPopupState(false, 'This group is associated with sub group')
        return;
      } else {
        isDelete.current = true;
        setFormData(rowData);
        togglePopup(true);
        setSelectedRow(null);
      }
  };

  const handleUpdate = (rowData: GroupFormData) => {
    if (rowData.isPredefinedGroup) {
      settingPopupState(false, 'Predefined Groups are not editable');
      return;
    } else {
      setFormData(rowData);
      isDelete.current = false;
      editing.current = true;
      togglePopup(true);
      setSelectedRow(null);
    }
  };

  const handelFormSubmit = (values: GroupFormData) => {
    let mode = values.group_code ? 'update' : 'create';
    const existingGroup = tableData?.find((group: GroupFormData) => {
      if (mode === 'create')
        return (
          group.group_name.toLowerCase() === values.group_name.toLowerCase()
        );
      return (
        group.group_name.toLowerCase() === values.group_name.toLowerCase() &&
        group.group_code !== values.group_code
      );
    });
    if (mode === 'create' && existingGroup){
      if (existingGroup.group_code && existingGroup.type !== values.type){
        values = {...existingGroup,type: values.type};
        mode = 'update';
      }else{
        settingPopupState(false, 'Group already exists!')
        return;
      }
    }else{
      if(existingGroup){
        settingPopupState(false, 'Group already exists!')
        return;
      }
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
    const { data, column, oldValue, newValue, valueChanged, node } = e;
    const field = column.colId;
    if (!valueChanged && node.rowIndex !== 0) return;
    if (node.rowIndex === 0 && createAccess) {  
      
      if (data.group_name && data.type) {
        try {
          await groupValidationSchema.validate(data);
          handleConfirmPopup(data);
        } catch (error: any) {
          settingPopupState(false, `${error.message}`);
        }
      }
      node.setDataValue(field, newValue);
    } else {
      try {
        if (newValue) {
          if (column.colId === 'group_name'){
            const isPayloadGroupNameExist = tableData.find((grp: GroupFormData) => grp.group_name.toLowerCase() === newValue.toLowerCase() && grp.group_code && grp.group_code !== data.group_code);
            if (isPayloadGroupNameExist) {
              settingPopupState(false, `${newValue} group name already exists`);
              node.setDataValue(field, oldValue);
              return;
            }
          }
          node.setDataValue(field, e.newValue);
          await sendAPIRequest(`/group/${data.group_code}`, {
            method: 'PUT',
            body: { [field]: newValue },
          });
          getAndSetGroupsHandler();
        }else{
          settingPopupState(false,"Name is Required");
          node.setDataValue(field, oldValue);
        }
      } catch (error: any) {
        if (!error?.isErrorHandled) {
          settingPopupState(false, `${error.message}`);
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
      ()=> handleDelete(selectedRow),
      ()=>handleUpdate(selectedRow),
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


  const fetchGroupData = () => {
      setTableData([...(createAccess ? [initialValue] :[]), ...groupsData]);
  };

  const onGridReady = () => {
    if (gridRef.current) {
      gridRef.current.api?.getDisplayedRowAtIndex(0)?.setSelected(true);
      gridRef.current.api?.startEditingCell({
        rowIndex: 0,
        colKey: colDefs,
      });
    }
  };
  useEffect(() => {
    onGridReady();
  }, [tableData, groupsData]);

  useEffect(() => {
    fetchGroupData();
  }, [groupsData,createAccess]);

  const defaultCols = {
    floatingFilter: true,
    flex: 1,
    filter: true,
    suppressMovable: true,
    headerClass: 'custom-header',
    editable: (params: any) => (!params.data.isPredefinedGroup || !params.data.group_code) && params.node.rowIndex === 0 ? createAccess : updateAccess,
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
  }

  const colDefs: ColDef<any, any>[]| ColGroupDef<any> | null | undefined[] = 
    [
      {
        headerName: 'Group Name',
        field: 'group_name',
      },
      {
        headerName: 'P&L / BL. Sheet',
        field: 'type',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: Object.values(typeMapping) },
        valueFormatter: (params: ValueFormatterParams) => lookupValue(typeMapping, params.value),
      },
      {
        headerName: 'Actions',
        headerClass: 'custom-header-class custom-header',
        sortable: false,
        cellStyle: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        cellRenderer: (params: { data: GroupFormData,node:any }) => (
          !params.data.isPredefinedGroup && <div className='table_edit_buttons'>
              <FaEdit
                style={{ cursor: 'pointer', fontSize: '1.1rem' }}
                onClick={() => {
                  setSelectedRow(selectedRow !== null ? null : params.data);
                  handleUpdate(params.data);
                }}
              />
              { params.node.rowIndex !== 0 &&
              <MdDeleteForever
                style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                onClick={() => handleDelete(params.data)}
              />
              }
            </div>
          )
      },
    ];

  return (
    <>
      <div className='w-full relative'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Groups</h1>
         {createAccess && <Button
            type='highlight'
            className=''
            handleOnClick={() => togglePopup(true)}
          >
            Add Group
          </Button>}
        </div>
        <div id='account_table' className='ag-theme-quartz'>
          {
            <AgGridReact
              rowData={tableData}
              columnDefs={colDefs}
              defaultColDef={defaultCols}
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
          <CreateGroup
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
