import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { GroupFormData } from '../../interface/global';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { CreateGroup } from './CreateGroup';
import Button from '../../components/common/button/Button';
import { sendAPIRequest } from '../../helper/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { groupValidationSchema } from './validation_schema';

const initialValue = {
  group_code: '',
  group_name: '',
  type: '',
  parent_code: '',
  isPredefinedGroup: true,
};

export const Groups = () => {
  const { organizationId } = useParams();
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<GroupFormData>(initialValue);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tableData, setTableData] = useState<GroupFormData[] | null>();
  const editing = useRef(false);
  const queryClient = useQueryClient();
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const pinnedRow: GroupFormData = {
    group_name: '',
    type: '',
  };
  const [inputRow, setInputRow] = useState<GroupFormData | any>(pinnedRow);
  const [subgroups, setSubgroups] = useState<GroupFormData[]>([]);
  const gridRef = useRef<any>(null);

  const { data } = useQuery<GroupFormData[]>({
    queryKey: ['get-groups'],
    queryFn: () => sendAPIRequest<GroupFormData[]>(`/${organizationId}/group`),
    initialData: [],
  });

  useEffect(() => {
    const fetchSubgroups = async () => {
      const subgroups = await sendAPIRequest<GroupFormData[]>(
        `/${organizationId}/group/sub`
      );
      setSubgroups(subgroups);
    };
    fetchSubgroups();
  }, []);

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

  const handleConfirmPopup = async (dataa?: any) => {
    // await groupValidationSchema.validate(data);
    const respData = dataa ? dataa : formData;
    setPopupState({ ...popupState, isModalOpen: false });
    if (formData.group_name) {
      formData.group_name =
        formData.group_name.charAt(0).toUpperCase() +
        formData.group_name.slice(1);
    }
    const payload = {
      group_name: respData.group_name || formData.group_name,
      type: respData.type || formData.type,
    };
    if (payload !== initialValue) {
      try {
        if (formData.group_code) {
         const response: any  = await sendAPIRequest(
            `/${organizationId}/group/${formData.group_code}`,
            {
              method: 'PUT',
              body: formData,
            }
          );
          await queryClient.invalidateQueries({
            queryKey: ['get-itemBatches'],
          });
          getGroups();
        } else {
          const response: any = await sendAPIRequest(`/${organizationId}/group`, {
            method: 'POST',
            body: payload,
          });
          if (!response.error) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'Group saved successfully2',
            });
          }
          setInputRow(pinnedRow);
          await queryClient.invalidateQueries({
            queryKey: ['get-itemBatches'],
          });
          getGroups();
        }
        togglePopup(false);
      } catch (error) {
        console.error('Error saving group:', error);
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
    await sendAPIRequest(`/${organizationId}/group/${group_code}`, {
      method: 'DELETE',
    });
    queryClient.invalidateQueries({ queryKey: ['get-groups'] });
  };

  const handleDelete = (oldData: GroupFormData) => {
    isDelete.current = true;
    setFormData(oldData);
    togglePopup(true);
    setSelectedRow(null);
  };

  const handleUpdate = (oldData: GroupFormData) => {
    setFormData(oldData);
    isDelete.current = false;
    editing.current = true;
    togglePopup(true);
    setSelectedRow(null);
  };

  const handelFormSubmit = (values: GroupFormData) => {
    const mode = values.group_code ? 'update' : 'create';
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
    if (existingGroup) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Group with this name already exists!',
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
    const { data, column, oldValue, valueChanged, newValue, node } = e;
    const field = column.colId;
    if (!valueChanged) return;
    if (node.rowIndex === 0) {

      if (data.group_name && data.type) {
        try {
          await groupValidationSchema.validate(data);
          handleConfirmPopup(data);
        } catch (error: any) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: error.message,
          });
        }
      }

      node.setDataValue(field, e.newValue);
    } else {
      try {
        await groupValidationSchema.validateAt(field, { [field]: e.newValue });

        node.setDataValue(field, e.newValue);
        await sendAPIRequest(`/${organizationId}/group/${data.group_code}`, {
          method: 'PUT',
          body: { [field]: e.newValue },
        });

        queryClient.invalidateQueries({ queryKey: ['get-groups'] });
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

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  // const isPinnedRowDataCompleted = async () => {
  //   try {
  //     await groupValidationSchema.validate(inputRow);
  //     return { completed: true };
  //   } catch (err: any) {
  //     return { completed: false, error: err.message };
  //   }
  // };

  const handleKeyDown = async (event: KeyboardEvent) => {
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
        if (
          event.ctrlKey &&
          selectedRow &&
          selectedRow.isPredefinedGroup === false
        ) {
          const isParentGroup = subgroups.some(
            (subgroup: GroupFormData) =>
              subgroup.parent_code === selectedRow.group_code
          );
          if (isParentGroup) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'This group is associated with sub group',
            });
          } else {
            handleDelete(selectedRow);
          }
        } else if (
          event.ctrlKey &&
          selectedRow &&
          selectedRow.isPredefinedGroup === true
        ) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: 'Predefined Groups should not be deleted',
          });
        } else if (event.ctrlKey && selectedRow && !!selectedRow.parent_code) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: 'This group is already associated with sub group.',
          });
        }
        break;
      case 'e':
      case 'E':
        if (
          event.ctrlKey &&
          selectedRow &&
          selectedRow.isPredefinedGroup === false
        ) {
          handleUpdate(selectedRow);
        } else if (
          event.ctrlKey &&
          selectedRow &&
          selectedRow.isPredefinedGroup === true
        ) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message: 'Predefined Groups are not editable',
          });
        }
        break;
      // case 'Enter':
      //   const api = gridRef?.current?.api;
      //   console.log(
      //     'gridRef----',
      //     gridRef,
      //     'gridRef?.current------',
      //     gridRef?.current
      //   );
      //   // if (api) {
      //   //   const focusedCell = api.getFocusedCell();
      //   //   if (focusedCell) {
      //   //     const lastEditedRowIndex = focusedCell.rowIndex;
      //   //     const lastEditedColKey = focusedCell.column.colId;

      //   //     await api.startEditingCell({
      //   //       rowIndex: lastEditedRowIndex,
      //   //       colKey: lastEditedColKey,
      //   //     });
      //   //     api.setFocusedCell(lastEditedRowIndex, lastEditedColKey);
      //   //   }

      //   const focusedCell = gridRef.current.api.getFocusedCell();
      //   const lastEditedRowIndex = focusedCell?.rowIndex;
      //   if (focusedCell && lastEditedRowIndex === 0) {
      //     const validationStatus = await isPinnedRowDataCompleted();
      //     if (validationStatus.completed) {
      //       if (!editing.current) {
      //         handleConfirmPopup();
      //       }
      //     }
      //   }
      //   break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow]);


  const fetchGroupData = async () => {
    try {
      const fetchedData = await sendAPIRequest<GroupFormData[]>(
        `/${organizationId}/group`
      );
      setTableData([initialValue, ...fetchedData]);
      return fetchedData;
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  };

  const getGroups = async () => {
    setInputRow(pinnedRow);
    const getGroupData: any = await fetchGroupData();
    const combinedData = [pinnedRow, ...getGroupData];
    setTableData(combinedData);
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
  }, [tableData]);

  useEffect(() => {
    fetchGroupData();
    onGridReady();
  }, [data]);

  const colDefs: ColDef<any, any>[]| ColGroupDef<any> | null | undefined[] = 
    [
      {
        headerName: 'Group Name',
        field: 'group_name',
        flex: 1,
        filter: true,
        editable: true,
        headerClass: 'custom-header',
        suppressMovable: true,
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
        cellRenderer: (params: { data: GroupFormData }) => (
          <div className='table_edit_buttons'>
            <FaEdit
              style={{ cursor: 'pointer', fontSize: '1.1rem' }}
              onClick={() => {
                if (params.data.isPredefinedGroup === false) {
                  handleUpdate(params.data);
                } else if (params.data.isPredefinedGroup === true) {
                  setPopupState({
                    ...popupState,
                    isAlertOpen: true,
                    message: 'Predefined Groups are not editable',
                  });
                }
              }}
            />

            <MdDeleteForever
              style={{ cursor: 'pointer', fontSize: '1.2rem' }}
              onClick={() => {
                const groupToDelete = params.data;
                if (groupToDelete.isPredefinedGroup) {
                  setPopupState({
                    ...popupState,
                    isAlertOpen: true,
                    message: 'Predefined Groups should not be deleted',
                  });
                } else {
                  const isParentGroup = subgroups.some(
                    (subgroup: GroupFormData) =>
                      subgroup.parent_code === groupToDelete.group_code
                  );
                  if (isParentGroup) {
                    setPopupState({
                      ...popupState,
                      isAlertOpen: true,
                      message:
                        'This group is already associated with sub group',
                    });
                  } else {
                    handleDelete(groupToDelete);
                  }
                }
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
          <h1 className='font-bold'>Groups</h1>
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
