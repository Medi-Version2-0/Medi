import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { BatchForm } from '../../interface/global';
import { numberedStringLowerCase } from '../../utilities/numberedStringLowercase';
import Button from '../../components/common/button/Button';
import { ColDef } from 'ag-grid-community';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { sendAPIRequest } from '../../helper/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

const expiryFormatRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;

const parseMonthYear = (dateString: string) => {
  const [month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1);
  return date;
};

export const Batch = ({
  params,
}: {
  params: {
    showBatch: any;
    setShowBatch: React.Dispatch<React.SetStateAction<any>>;
  };
}) => {
  const { id } = params.showBatch;

  const pinnedRow: BatchForm = {
    itemId: id ? +id : 0,
    batchNo: '',
    expiryDate: '',
    opBalance: null,
    opFree: null,
    purPrice: null,
    salePrice: null,
    mrp: null,
    locked: '',
  };
  const queryClient = useQueryClient();
  const { organizationId } = useParams();
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [inputRow, setInputRow] = useState<BatchForm>(pinnedRow);
  const [tableData, setTableData] = useState<BatchForm | any>(null);
  const [currTableData, setCurrTableData] = useState<BatchForm | any>(null);
  const editing = useRef(false);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const { data } = useQuery<{ data: BatchForm }>({
    queryKey: ['get-itemBatches'],
    queryFn: () =>
      sendAPIRequest<{ data: BatchForm }>(`/${organizationId}/item/${id}/batch`),
  });

  const getBatch = async () => {
    setCurrTableData(data);
    setTableData(data);
  };

  const isPinnedRowDataCompleted = (params: any) => {
    if (params.node.rowPinned !== 'top') return;
    const filteredInputRow = Object.fromEntries(
      Object.entries(inputRow).filter(([key]) =>
        colDefs?.some((def: any) => def.field === key)
      )
    );
    return colDefs?.every((def: any) => filteredInputRow[def.field]);
  };

  const handelBatchAdd = async (batch: BatchForm) => {
    const existingBatch = tableData?.find((tableBatch: BatchForm) => {
      return (
        numberedStringLowerCase(tableBatch?.batchNo) ===
        numberedStringLowerCase(batch.batchNo)
      );
    });
    if (!expiryFormatRegex.test(batch.expiryDate)) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Expiry date must be valid with format MM/YYYY.',
      });
      return;
    }
    if (existingBatch) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: 'Batch with this id already exists!',
      });
      return;
    }

    batch.batchNo = batch.batchNo.replace(/[a-z]/g, (char: string) =>
      char.toUpperCase()
    );
    batch.locked = batch.locked.toUpperCase();
    await sendAPIRequest(`/${organizationId}/item/${id}/batch`, {
      method: 'POST',
      body: batch,
    });
    queryClient.invalidateQueries({ queryKey: ['get-itemBatches'] });
    setInputRow({
      ...pinnedRow,
      locked: '',
      batchNo: '',
    });
  };

  const handleConfirmPopup = () => {
    getBatch();
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleRowSelected = useCallback((event: any) => {
    if (event.node.isSelected()) {
      setSelectedRow(event.data);
    }
  }, []);

  const handleCellEditingStopped = useCallback(
    async (e: {
      data?: any;
      column?: any;
      oldValue?: any;
      valueChanged?: any;
      node?: any;
      newValue?: any;
    }) => {
      editing.current = false;
      const { data, column, oldValue, valueChanged, node } = e;
      const batchId = data.id;
      let { newValue } = e;
      if (!valueChanged) return;
      const field = column.colId;

      if (node.rowPinned === 'top') {
        if (field === 'expiryDate') {
          if (!expiryFormatRegex.test(newValue)) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'Expiry date must be valid with format MM/YYYY.',
            });
            node.setDataValue(field, oldValue);
            return;
          }
          if (parseMonthYear(newValue) < new Date()) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: 'Expiry date must be greater than current date.',
            });
            node.setDataValue(field, oldValue);
            return;
          }
        }
        if (field === 'locked') {
          if (!['Y', 'N', 'y', 'n'].includes(newValue)) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message:
                'Please enter either "y" for Yes or "n" for "No" for Locked field.',
            });
            return;
          }
        }

        const newBatch = { ...inputRow, [field]: newValue };
        setInputRow(newBatch);
      } else {
        switch (field) {
          case 'batchNo':
            {
              const existingBatches = currTableData.find(
                (batch: BatchForm) =>
                  numberedStringLowerCase(batch.batchNo) ===
                  numberedStringLowerCase(newValue)
              );
              if (existingBatches) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: 'Batch with this number already exists!',
                });
                node.setDataValue(field, oldValue);
                return;
              } else if (!newValue || newValue.length > 100) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: !newValue
                    ? 'Batch Number is required'
                    : 'Batch number cannot exceed 100 characters',
                });
                node.setDataValue(field, oldValue);
                return;
              }
            }
            break;
          case 'expiryDate':
            {
              if (!newValue) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: `Expiry date is required`,
                });
                node.setDataValue(field, oldValue);
                return;
              }
              if (newValue && !expiryFormatRegex.test(newValue)) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: 'Expiry date must be valid with format MM/YYYY.',
                });
                return;
              }
            }
            break;

          case 'opBalance':
            {
              if (!newValue) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: `Opennig stock is required`,
                });
                node.setDataValue(field, oldValue);
                return;
              }
            }
            break;
          case 'opFree':
            {
              if (!newValue) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: `Scheme stock is required`,
                });
                node.setDataValue(field, oldValue);
                return;
              }
            }
            break;
          case 'purPrice':
            {
              if (!newValue) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: `Purchase price is required`,
                });
                node.setDataValue(field, oldValue);
                return;
              }
            }
            break;
          case 'salePrice':
            {
              if (!newValue) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: `Sale price is required`,
                });
                node.setDataValue(field, oldValue);
                return;
              }
            }
            break;
          case 'mrp':
            {
              if (!newValue) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message: `MRP is required`,
                });
                node.setDataValue(field, oldValue);
                return;
              }
            }
            break;
          case 'locked':
            {
              if (!['Y', 'N', 'y', 'n'].includes(newValue)) {
                setPopupState({
                  ...popupState,
                  isAlertOpen: true,
                  message:
                    'Please enter either "y" for Yes or "n" for "No" for Locked field.',
                });
                node.setDataValue(field, oldValue);
                return;
              }
              newValue = newValue.toUpperCase();
            }
            break;
          default:
            break;
        }
        await sendAPIRequest(`/${organizationId}/item/${id}/batch/${batchId}`, {
          method: 'PUT',
          body: { ...data, [field]: newValue },
        });

        queryClient.invalidateQueries({ queryKey: ['get-itemBatches'] });
      }
    },
    [tableData, inputRow]
  );

  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };
  // TO-DO : (Avantika)= Handle Keyboard shortcut(Tab)
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key) {
      if (isPinnedRowDataCompleted({ node: { rowPinned: 'top' } })) {
        handelBatchAdd(inputRow);
      }
    }
  };
  useEffect(() => {
    getBatch();
  }, [data]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow, inputRow]);

  const getRowStyle = useCallback<any>(
    ({ node }: any) =>
      node.rowPinned
        ? { fontWeight: 'light', fontStyle: 'italic', color: 'gray' }
        : {},
    []
  );

  const isEmptyPinnedCell = (params: any) => {
    return (
      (params.node.rowPinned === 'top' && params.value == null) ||
      (params.node.rowPinned === 'top' && params.value === '')
    );
  };

  const createPinnedCellPlaceholder = ({ colDef }: any) => {
    return colDef.headerName || '';
  };

  const createValueFormatter = (colDef: any) => (params: any) => {
    const { value, node } = params;
    const isPinnedRow = node.rowPinned === 'top';
    const isEditing = params.api
      .getEditingCells()
      .some(
        (cell: any) =>
          cell.rowIndex === params.node.rowIndex &&
          cell.column.colId === params.column.colId
      );

    if (isPinnedRow && !isEditing && (value === null || value === '')) {
      return colDef.headerName;
    } else {
      return value;
    }
  };

  const defaultColDef = {
    flex: 1,
    editable: true,
    valueFormatter: (params: any) => {
      if (isEmptyPinnedCell(params)) {
        return createPinnedCellPlaceholder(params);
      } else {
        return params.value;
      }
    },
  };

  const colDefs: ColDef[] = [
    {
      headerName: 'Batch No',
      field: 'batchNo',
      filter: true,
      editable: true,
      sortable: true,
      flex: 1,
      headerClass: 'custom-header',
      suppressMovable: true,
      valueFormatter: createValueFormatter({ headerName: 'Batch No' }),
    },
    {
      headerName: 'Expiry Date',
      field: 'expiryDate',
      filter: true,
      editable: true,
      flex: 1,
      headerClass: 'custom-header',
      sortable: true,
      suppressMovable: true,
      valueFormatter: createValueFormatter({ headerName: 'MM/YYYY' }),
    },
    {
      headerName: 'Opening Stock',
      field: 'opBalance',
      filter: true,
      editable: true,
      sortable: true,
      flex: 1,
      headerClass: 'custom-header',
      suppressMovable: true,
      valueFormatter: createValueFormatter({ headerName: 'Opening Stock' }),
    },
    {
      headerName: 'Scheme Stock',
      field: 'opFree',
      filter: true,
      editable: true,
      sortable: true,
      flex: 1,
      headerClass: 'custom-header',
      suppressMovable: true,
      valueFormatter: createValueFormatter({ headerName: 'Scheme Stock' }),
    },
    {
      headerName: 'Purchase Price',
      field: 'purPrice',
      filter: true,
      headerClass: 'custom-header-class custom-header',
      editable: true,
      sortable: true,
      suppressMovable: true,
      flex: 1,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      valueFormatter: createValueFormatter({ headerName: 'Purchase Price' }),
    },
    {
      headerName: 'Sale Price',
      field: 'salePrice',
      filter: true,
      headerClass: 'custom-header-class custom-header',
      editable: true,
      sortable: true,
      suppressMovable: true,
      flex: 1,
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      valueFormatter: createValueFormatter({ headerName: 'Sale Price' }),
    },
    {
      headerName: 'MRP',
      field: 'mrp',
      filter: true,
      editable: true,
      sortable: true,
      flex: 1,
      headerClass: 'custom-header',
      suppressMovable: true,
      valueFormatter: createValueFormatter({ headerName: 'MRP' }),
    },
    {
      headerName: 'Lock Batch',
      field: 'locked',
      filter: true,
      editable: true,
      flex: 1,
      headerClass: 'custom-header',
      suppressMovable: true,
      valueFormatter: createValueFormatter({ headerName: 'Y/N' }),
    },
  ];

  return (
    <div ref={containerRef}>
      <div className='w-full'>
        <div className='flex w-full items-center justify-between px-8 py-1'>
          <h1 className='font-bold'>Batches</h1>
          <Button
            type='highlight'
            handleOnClick={() => params.setShowBatch(null)}
          >
            Back
          </Button>
        </div>
        <div id='account_table' className='ag-theme-quartz'>
          {
            <AgGridReact
              rowData={tableData}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              rowSelection='single'
              onSelectionChanged={(event) => {
                setSelectedRow(event.api.getSelectedNodes()[0]);
              }}
              pinnedTopRowData={[inputRow]}
              getRowStyle={getRowStyle}
              onCellClicked={onCellClicked}
              onGridReady={getBatch}
              onCellEditingStarted={cellEditingStarted}
              onCellEditingStopped={handleCellEditingStopped}
              onRowSelected={handleRowSelected}
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
          />
        )}
      </div>
    </div>
  );
};
