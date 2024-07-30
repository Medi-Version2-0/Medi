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
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';
import { handleKeyDownCommon } from '../../utilities/handleKeyDown';
import { subgroupValidationSchema } from './validation_schema';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';


export const SubGroups = () => {
  const initialValue = {
    group_code: '',
    group_name: '',
    parent_code: '',
  };
  const { organizationId } = useParams();
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<SubGroupFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<SubGroupFormData | any>(null);
  const [groupOptions, setGroupOptions] = useState<any[]>([]);
  const editing = useRef(false);
  let currTable: any[] = [];
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const pinnedRow: SubGroupFormData = {
    group_name: ''
  };
  const gridRef = useRef<any>(null);

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
      parent_code: respData.group_name ? respData.parent_code : formData.parent_code,
    };

    if (payload !== initialValue) {
      if (formData.group_code) {
        await sendAPIRequest(
          `/${organizationId}/group/sub/${formData.group_code}`,
          {
            method: 'PUT',
            body: formData,
          }
        );
      } else {
        await sendAPIRequest(`/${organizationId}/group/sub`, {
          method: 'POST',
          body: payload,
        });
      }
      togglePopup(false);
      getSubGroups();
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

  const getSubGroups = async () => {
    const subGroups = await sendAPIRequest<any[]>(
      `/${organizationId}/group/sub`
    );
    setTableData([pinnedRow, ...subGroups]);
    return subGroups
  };

  const deleteAcc = async (group_code: string) => {
    isDelete.current = false;
    togglePopup(false);
    await sendAPIRequest(`/${organizationId}/group/sub/${group_code}`, {
      method: 'DELETE',
    });
    getSubGroups();
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
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Sub Group with this name already exists!',
      });
      return;
    }
    if (values.group_name) {
      values.group_name =
        values.group_name.charAt(0).toUpperCase() + values.group_name.slice(1);
    }
    if (values !== initialValue) {
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
    currTable = [];
    editing.current = false;
    const { data, column, oldValue, valueChanged, node } = e;
    let { newValue } = e;
    if (!valueChanged) return;
    const field = column.colId;
    if (node.rowIndex === 0) {
      if (data.group_name && data.parent_code) {
        try { 
          await subgroupValidationSchema.validate(data);
            handleConfirmPopup(data)

            const existingGroup = currTable.find(
              (group: SubGroupFormData) =>
                group.group_name.toLowerCase() === newValue.toLowerCase()
            );

            if (existingGroup) {
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: 'Sub Group with this name already exists!',
              });
              node.setDataValue(field, oldValue);
              return;
            }
          if (field === 'igst_sale' && newValue) {
            newValue = newValue.toLowerCase();
          }
        } catch (error: any) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: error.message,
          });
          node.setDataValue(field, oldValue);
          return;
        }
    }
  }else{
    node.setDataValue(field, newValue);
    await sendAPIRequest(`/${organizationId}/group/sub/${data.group_code}`, {
      method: 'PUT',
      body: { [field]: newValue },
    });
    getSubGroups();
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
    getSubGroups();
  }, []);

  const getGroups = async () => {
    const groupList = await sendAPIRequest<any[]>(`/${organizationId}/group`);
    return groupList.map((grp: any) => ({
      value: grp.group_code,
      label: grp.group_name.toUpperCase(),
    }));
  };


  useEffect(() => {
    const fetchGroups = async () => {
      const groups = await getGroups();
      setGroupOptions(groups);
    };

    fetchGroups();
  }, []);


  const parentGroupMap: { [key: number]: string } = {};

  groupOptions?.forEach((group: any) => {
    parentGroupMap[group.value] = group.label;
  });


  const extractKeys = (mappings: {
    [x: number]: string;
    Yes?: string;
    No?: string;
  }) => {
    return Object.keys(mappings).map((key) => Number(key));
  };

  const parentGroup = extractKeys(parentGroupMap);

  const lookupValue = (
    mappings: {
      [x: string]: any;
      [x: number]: string;
      Yes?: string;
      No?: string;
    },
    key: string | number
  ) => {
    return mappings[key];
  };

  const colDefs: (ColDef<any, any> | ColGroupDef<any>)[] | null | undefined[] =
    [
      {
        headerName: 'Sub Group Name',
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
        headerName: 'Parent Group',
        field: 'parent_code',
        flex: 1,
        filter: true,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: parentGroup,
          valueListMaxHeight: 120,
          valueListMaxWidth: 185,
          valueListGap: 8,
        },
        valueFormatter: (params: { value: string | number }) =>
          lookupValue(parentGroupMap, params.value),
        valueGetter: (params: { data: any }) => {
        return lookupValue(parentGroupMap, params.data.parent_code);
        },
        filterValueGetter: (params: { data: any }) => {
        return lookupValue(parentGroupMap, params.data.parent_code);
        },
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
          <Button
            id='account_button'
            handleOnClick={() => togglePopup(true)}
            type='highlight'
          >
            Add Subgroup
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
