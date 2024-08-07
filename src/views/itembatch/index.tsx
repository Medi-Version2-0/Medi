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
import { useControls } from '../../ControlRoomContext';
import { batchSchema, validatePrices } from './validation_schema';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';

export const Batch = ({
  params,
}: {
  params: {
    showBatch: any;
    setShowBatch: React.Dispatch<React.SetStateAction<any>>;
  };
}) => {
  const { id } = params.showBatch;
  const { controlRoomSettings } = useControls();
  const pinnedRow: BatchForm = {
    itemId: id ? +id : 0,
    batchNo: '',
    expiryDate: '',
    opBalance: null,
    currentStock: null,
    opFree: null,
    purPrice: null,
    salePrice: null,
    ...(controlRoomSettings.multiPriceList ? { salePrice2: null } : {}),
    mrp: null,
    locked: '',
    ...(controlRoomSettings.batchWiseManufacturingCode ? { mfgCode: '', } : {}),
  };
  const queryClient = useQueryClient();
  const { organizationId } = useParams();
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [inputRow, setInputRow] = useState<BatchForm | any>(pinnedRow);
  const [tableData, setTableData] = useState<BatchForm | any>(null);
  const [item, setItem] = useState<any>(null);
  const editing = useRef(false);
  const gridRef = useRef<any>(null);
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const { data } = useQuery<BatchForm[]>({
    queryKey: ['get-itemBatches'],
    queryFn: () =>
      sendAPIRequest<BatchForm[]>(
        `/${organizationId}/item/${id}/batch`
      ),
  });
  const getItem = async () => {
    const itemData = await sendAPIRequest<any>(`/${organizationId}/item/${id}`);
    setItem(itemData);
    return itemData;
  };

  const getBatch = (async () => {
    setInputRow(pinnedRow);
    const itemData = await getItem();
    let newRow = { ...pinnedRow, itemId: 0 };
    if (controlRoomSettings.batchWiseManufacturingCode) {
      newRow = { ...newRow, mfgCode: itemData?.shortName || '' };
    }
    const combinedData = data && [newRow, ...data];
    setTableData(combinedData);
  });

  const onGridReady = () => {
    if (gridRef.current) {
      gridRef.current.api?.getDisplayedRowAtIndex(0)?.setSelected(true);
      gridRef.current.api?.startEditingCell({
        rowIndex: 0,
        colKey: colDefs[0].field,
      });
    }
  };
  useEffect(() => {
    onGridReady();
  }, [tableData])

  useEffect(() => {
    getBatch();
    onGridReady();
  }, [data]);

  const handleBatchAdd = async () => {
    try {
      await batchSchema.validate(inputRow);
      const existingBatch = data?.find(
        (tableBatch: BatchForm) =>
          numberedStringLowerCase(tableBatch?.batchNo) === numberedStringLowerCase(inputRow.batchNo)
      );
      if (existingBatch) {
        setPopupState({
          ...popupState,
          isAlertOpen: true,
          message: 'Batch with this id already exists!',
        });
        return;
      }
      const formattedInputRow = {
        ...inputRow,
        currentStock: inputRow.opBalance,
        batchNo: inputRow.batchNo.toUpperCase(),
        locked: inputRow.locked.toUpperCase(),
      };
      await sendAPIRequest(`/${organizationId}/item/${id}/batch`, {
        method: 'POST',
        body: formattedInputRow,
      });
      setInputRow(pinnedRow);
      await queryClient.invalidateQueries({ queryKey: ['get-itemBatches'] });
      getBatch();
    } catch (err: any) {
      if (err.message) {
        setPopupState({
          ...popupState,
          isAlertOpen: true,
          message: err.message,
        });
      } else {
        console.error('Error occured while adding batch:-', err);
      }
    }
  };

  const handleConfirmPopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleAlertCloseModal = async () => {
    setPopupState({ ...popupState, isAlertOpen: false });

    const api = gridRef?.current?.api;
    const focusedCell = api.getFocusedCell();

    if (focusedCell) {
      const lastEditedRowIndex = focusedCell.rowIndex;
      const lastEditedColKey = focusedCell.column.colId;
      setTimeout(async () => {
        api.setFocusedCell(lastEditedRowIndex, lastEditedColKey);
        await api.startEditingCell({
          rowIndex: lastEditedRowIndex,
          colKey: lastEditedColKey,
        });
      }, 100);
    }
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleRowSelected = useCallback((event: any) => {
    if (event.node.isSelected()) {
      setSelectedRow(event.data);
    }
  }, []);


  const onCellKeyDown = () => {
    const api = gridRef?.current?.api;
    const focusedCell = api.getFocusedCell();

    if (focusedCell) {
      const lastEditedRowIndex = focusedCell.rowIndex;
      const lastEditedColKey = focusedCell.column.colId;
      setTimeout(async () => {
        api.setFocusedCell(lastEditedRowIndex, lastEditedColKey);
        await api.startEditingCell({
          rowIndex: lastEditedRowIndex,
          colKey: lastEditedColKey,
        });
      }, 30);
    }
  }

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
      const { data, column, oldValue, newValue, node } = e;
      const batchId = data.id;
      const field = column.colId;
      if (newValue === oldValue) return;
      try {
        if (node.rowIndex === 0 && !isAnyFilterActive()) {
          try {
            await batchSchema.validateAt(field, { [field]: newValue });
            const newBatch = { ...inputRow, [field]: newValue };
            validatePrices(newBatch);
            setInputRow(newBatch);
          } catch (err: any) {
            if (err.message) {
              await gridRef.current?.api?.startEditingCell({
                rowIndex: node.rowIndex,
                colKey: field,
              });
              node.setDataValue(field, oldValue);
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: err.message,
              });
            }
          }
        } else {
          try {
            await batchSchema.validate({ ...data, [field]: newValue });
            validatePrices({ ...data, [field]: newValue });
            await sendAPIRequest(`/${organizationId}/item/${id}/batch/${batchId}`, {
              method: 'PUT',
              body: { ...data, [field]: newValue },
            });
            await queryClient.invalidateQueries({ queryKey: ['get-itemBatches'] });          
          } catch (err: any) {
            if (err.message) {
              await gridRef.current?.api?.startEditingCell({
                rowIndex: node.rowIndex,
                colKey: field,
              });
              node.setDataValue(field, oldValue);
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message: err.message,
              });
            }
          }
        }
      } catch (err: any) {
        if (err.response?.data.message || err.message) {
          setPopupState({
            ...popupState,
            isAlertOpen: true,
            message:err.response?.data.message || err.message,
          });
        } else {
          console.error('Error:-', err);
        }
        node.setDataValue(field, oldValue);
        gridRef.current?.api?.startEditingCell({
          rowIndex: node.rowIndex,
          colKey: field,
        });
      }
    },
    [[tableData, inputRow]]
  );


  const onCellClicked = (params: { data: any }) => {
    setSelectedRow(selectedRow !== null ? null : params.data);
  };

  const cellEditingStarted = () => {
    editing.current = true;
  };

  const isPinnedRowDataCompleted = async () => {
    try {
      await batchSchema.validate(inputRow);
      return { completed: true };
    } catch (err: any) {
      return { completed: false, error: err.message };
    }
  };

  const handleKeyDown = async (event: KeyboardEvent) => {
    if (event.code === 'Enter') {
      const focusedCell = gridRef?.current?.api.getFocusedCell();
      const lastEditedRowIndex = focusedCell?.rowIndex;
      if (focusedCell && lastEditedRowIndex === 0 && !isAnyFilterActive()) {
        const validationStatus = await isPinnedRowDataCompleted();
        if (validationStatus.completed) {
          if (!editing.current) {
            handleBatchAdd();
          }
        } else {
          !editing.current &&
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message: validationStatus.error,
            });
        }

      }
    } else if (event.code === 'Tab') {
      onCellKeyDown();
    }
  };

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

  const isAnyFilterActive = () => {
    const filterModel = gridRef?.current?.api.getFilterModel();
    if (filterModel) {
      return Object.keys(filterModel).length > 0;
    } else {
      return false;
    }
  };

  const defaultColDef = {
    filter: true,
    editable: true,
    sortable: true,
    flex: 1,
    headerClass: 'custom-header',
    suppressMovable: true,
    cellStyle: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cellEditor: 'agTextCellEditor',
    cellRenderer: (params: any) => (
      <PlaceholderCellRenderer
        value={params.value}
        rowIndex={params.node.rowIndex}
        column={params.colDef}
        startEditingCell={(editParams) => {
          gridRef.current?.api?.startEditingCell(editParams);
        }}
        placeholderText={params.colDef.headerName}
      />
    ),
  };


  const salePriceColumns: ColDef[] = [];

  if (controlRoomSettings.multiPriceList && controlRoomSettings.salesPriceLimit > 1) {
    salePriceColumns.push({
      headerName: 'Sale Price 1',
      field: 'salePrice',
      cellDataType: 'number',
      headerClass: 'custom-header-class custom-header',
    });
    for (let i = 2; i <= controlRoomSettings.salesPriceLimit; i++) {
      salePriceColumns.push({
        headerName: `Sale Price ${i}`,
        field: `salePrice${i}`,
        cellDataType: 'number',
        headerClass: 'custom-header-class custom-header',
      });
    }
  } else {
    salePriceColumns.push({
      headerName: 'Sale Price',
      field: 'salePrice',
      cellDataType: 'number',
      headerClass: 'custom-header-class custom-header',
    });
  }

    const colDefs: ColDef[] = [
      {
        headerName: 'Batch No',
        field: 'batchNo',
        cellDataType: 'text',
      },
      {
        headerName: 'Expiry Date',
        field: 'expiryDate',
      },
      {
        headerName: 'Opening Stock',
        field: 'opBalance',
        cellDataType: 'number',
      },
      {
        headerName: 'Scheme Stock',
        field: 'opFree',
        cellDataType: 'number',
      },
      {
        headerName: 'Purchase Price',
        field: 'purPrice',
        cellDataType: 'number',
        headerClass: 'custom-header-class custom-header',
        cellStyle: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
      },
      ...salePriceColumns,
      {
        headerName: 'MRP',
        field: 'mrp',
        cellDataType: 'number',
      },
      {
        headerName: 'Current Stock',
        field: 'currentStock',
        editable: false
      },
      {
        headerName: 'Lock Batch',
        field: 'locked',
      },
      ...(controlRoomSettings.batchWiseManufacturingCode
        ? [
          {
            headerName: 'MFG Code',
            field: 'mfgCode',
          },
        ]
        : []),
    ];

  return (
    <div ref={containerRef}>
      <div className="w-full">
        <div className="flex w-full items-center justify-between px-8 py-1">
          <h1 className="font-bold">{item && item.name}</h1>
          <Button type="highlight" handleOnClick={() => params.setShowBatch(null)}>
            Back
          </Button>
        </div>
        <div id="account_table" className="ag-theme-quartz">
          {tableData &&
            <AgGridReact
              ref={gridRef}
              rowData={tableData}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              rowSelection="single"
              onSelectionChanged={(event) => {
                setSelectedRow(event.api.getSelectedNodes()[0]);
              }}
              getRowStyle={getRowStyle}
              onCellClicked={onCellClicked}
              onGridReady={onGridReady}
              onCellEditingStarted={cellEditingStarted}
              onCellEditingStopped={handleCellEditingStopped}
              onRowSelected={handleRowSelected}
              onFirstDataRendered={onGridReady}
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
