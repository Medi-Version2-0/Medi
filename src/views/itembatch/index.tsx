import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { BatchForm, ItemFormData } from '../../interface/global';
import { numberedStringLowerCase } from '../../utilities/numberedStringLowercase';
import Button from '../../components/common/button/Button';
import { ColDef } from 'ag-grid-community';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { useControls } from '../../ControlRoomContext';
import { batchSchema, validatePrices } from './validation_schema';
import PlaceholderCellRenderer from '../../components/ag_grid/PlaceHolderCell';
import useApi from '../../hooks/useApi';
import { SelectListTableWithInput } from '../../components/common/customSelectList/selectListWithInputs';

export const Batch = ({ params }: { params: { showBatch: any; setShowBatch: React.Dispatch<React.SetStateAction<any>>; };}) => {
  const { id } = params.showBatch;
  const { sendAPIRequest } = useApi();
  const { controlRoomSettings } = useControls();

  const GodownHeaders = [{ label: 'Godown Name', key: 'godownName' }, { label: 'Stocks', key: 'stocks', isInput: true }];

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
    locked: 'N',
    ...(controlRoomSettings.batchWiseManufacturingCode ? { mfgCode: '', } : {}),
  };
  const [item, setItem] = useState<any>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [inputRow, setInputRow] = useState<BatchForm | any>(pinnedRow);
  const [tableData, setTableData] = useState<BatchForm | any>(null);
  const [fetchedGodown, setFetchedGodown] = useState<any | []>(null);
  const [godownDataDuringCreate, setGodownDataDuringCreate] = useState<any | []>(null);
  const [popupList, setPopupList] = useState<{ isOpen: boolean; data: any }>({ isOpen: false, data: {} });
  const [popupState, setPopupState] = useState({ isModalOpen: false, isAlertOpen: false, message: '' });
  const editing = useRef(false);
  const gridRef = useRef<any>(null);
  
  const fetchItems = async() => {
    const items = await sendAPIRequest<ItemFormData[] | any>('/item');
    const godownData = await sendAPIRequest<any>(`/godown`);
    const itemData = items.find((item: any) => item.id === id);
    setInputRow(pinnedRow);
    setItem(itemData);
    let newRow = { ...pinnedRow, itemId: 0 }; 
    if (controlRoomSettings.batchWiseManufacturingCode) newRow = { ...newRow, mfgCode: itemData?.shortName || '' };
    setTableData([newRow, ...itemData.ItemBatches]);
    setFetchedGodown(godownData);
  }

  useEffect(() => {
    fetchItems();
    onGridReady();
  }, []);

  useEffect(() => {
    onGridReady();
  }, [tableData])

  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({ ...popupState, [isModal ? 'isModalOpen' : 'isAlertOpen']: true, message: message });
  };

  const containerRef = useRef<HTMLDivElement>(null);

  const onGridReady = () => {
    if (gridRef.current) {
      gridRef.current.api?.getDisplayedRowAtIndex(0)?.setSelected(true);
      gridRef.current.api?.startEditingCell({ rowIndex: 0, colKey: colDefs[0].field });
    }
  };  

  const handleBatchAdd = async () => {
    try {
      await batchSchema.validate(inputRow);
      const existingBatch = item.ItemBatches.find((tableBatch: BatchForm) => numberedStringLowerCase(tableBatch?.batchNo) === numberedStringLowerCase(inputRow.batchNo));
      if (existingBatch) {
        settingPopupState(false, 'Batch with this id already exists!');
        return;
      }
      const formattedInputRow = {
        ...inputRow,
        currentStock: inputRow.opBalance,
        batchNo: inputRow.batchNo.toUpperCase(),
        locked: inputRow.locked.toUpperCase(),
        mfgCode: item?.shortName,
      };
      if(!!godownDataDuringCreate){
        godownDataDuringCreate.forEach((data: any) => {
          formattedInputRow[`opGodown${data.godownCode}`] = Number( data?.stocks);
          formattedInputRow[`clGodown${data.godownCode}`] = Number( data?.stocks);
        })
      }      
      await sendAPIRequest(`/item/${id}/batch`, { method: 'POST', body: formattedInputRow });
      setGodownDataDuringCreate(null);
      setInputRow(pinnedRow);
      fetchItems();
    } catch (err: any) {
      if (err.message) {
        settingPopupState(false, `${err.message}`);
      } else {
        settingPopupState(false, 'Error occured while adding batch');
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
        await api.startEditingCell({ rowIndex: lastEditedRowIndex, colKey: lastEditedColKey });
      }, 100);
    }
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleRowSelected = useCallback((event: any) => {
    if (event.node.isSelected()) setSelectedRow(event.data);
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

  const handleCellEditingStopped = useCallback( async (e: any) => {
      editing.current = false;
      const { data, column, oldValue, newValue, node } = e;
      const batchId = data.id;
      const field = column.colId;
      if (newValue === oldValue) return;
      try {
        const finalValue = field === 'locked' ? newValue.toUpperCase() : newValue;
        if (node.rowIndex === 0 && !isAnyFilterActive()) {
          try {
            await batchSchema.validateAt(field, { [field]: finalValue });
            const newBatch = { ...inputRow, [field]: finalValue };
            validatePrices(newBatch);
            setInputRow(newBatch);
          } catch (err: any) {
            if (err.message) {
              await gridRef.current?.api?.startEditingCell({ rowIndex: node.rowIndex, colKey: field });
              node.setDataValue(field, oldValue);
              settingPopupState(false, `${err.message}`);
            }
          }
        } else {
          try {
            await batchSchema.validate({ ...data, [field]: finalValue });
            validatePrices({ ...data, [field]: finalValue });    
            await sendAPIRequest(`/item/${id}/batch/${batchId}`, { method: 'PUT', body: { ...data, [field]: finalValue }});
            fetchItems();
          } catch (err: any) {
            if (err.message) {
              await gridRef.current?.api?.startEditingCell({ rowIndex: node.rowIndex, colKey: field });
              node.setDataValue(field, oldValue);
              settingPopupState(false, `${err.message}`);
            }
          }
        }
      } catch (err: any) {
        if (err.response?.data.message || err.message) {
          settingPopupState(false, `${err.response?.data.message || err.message}`);
        } else {
          console.error('Error:-', err);
        }
        node.setDataValue(field, oldValue);
        gridRef.current?.api?.startEditingCell({ rowIndex: node.rowIndex, colKey: field });
      }
    },[[tableData, inputRow]]);


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

  const openPopup = (rowSelected: any, currentStocks: number, tableData: any) => {
    setPopupList({
      isOpen: true,
      data: {
        heading: 'Godowns',
        headers: [...GodownHeaders],
        tableData,
        rowData: rowSelected,
        currentStocks,
        handleSelect: (rowData: any) => {},
      },
    });
  };

  const mapGodownData = (rowSelected: any) => {
    return fetchedGodown.map((row: any) => {
      const mappedRow: any = {};
      GodownHeaders.forEach(header => {
        mappedRow[header.key] = header.isInput ? rowSelected[`opGodown${row.godownCode}`] : row[header.key];
        mappedRow['godownCode'] = row?.godownCode;
      });
      return mappedRow;
    });
  };

  const handleKeyDown = async (event: KeyboardEvent) => {
    const focusedCell = gridRef?.current?.api.getFocusedCell();
    if (!focusedCell) return;
  
    const { rowIndex, column } = focusedCell;
    const { colId } = column || {};
    const isGodownStockColumn = colId === "godownStocks";    
  
    if (event.code === 'Enter') {
      if (isGodownStockColumn && rowIndex === 0) {
        event.preventDefault();
        event.stopPropagation();
        const currentStocks = inputRow?.opBalance + inputRow?.opFree;
        openPopup(null,currentStocks, godownDataDuringCreate || fetchedGodown);
        return;
      }  
      if (isGodownStockColumn && rowIndex !== 0) {
        event.preventDefault();
        event.stopPropagation();
        const rowSelected = tableData[rowIndex];
        const dataTosend = mapGodownData(rowSelected);
        const currentStocks = rowSelected?.currentStock; 
        openPopup(rowSelected, currentStocks, dataTosend);
        return;
      }  
      if (rowIndex === 0 && !isAnyFilterActive()) {
        const validationStatus = await isPinnedRowDataCompleted();
        if (validationStatus.completed) {
          if (!editing.current) handleBatchAdd();
        } else {
          !editing.current && settingPopupState(false, `${validationStatus.error}`);
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

  const getRowStyle = useCallback<any>(({ node }: any) => node.rowPinned ? { fontWeight: 'light', fontStyle: 'italic', color: 'gray' } : {}, []);

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
    headerClass: 'custom-header',
    suppressMovable: true,
    cellStyle: { display: 'flex', justifyContent: 'flex-start', alignItems: 'center' },
    cellEditor: 'agTextCellEditor',
    cellRenderer: (params: any) => (
      <PlaceholderCellRenderer
        value={params.value}
        rowIndex={params.node.rowIndex}
        className={'text-start'}
        column={params.colDef}
        startEditingCell={(editParams) => gridRef.current?.api?.startEditingCell(editParams)}
        placeholderText={params.colDef.headerName === 'Expiry Date' ? 'MM/YYYY' : params.colDef.headerName}
      />
    ),
  };

  const salePriceColumns: ColDef[] = [];

  if (controlRoomSettings.multiPriceList && controlRoomSettings.salesPriceLimit > 1) {
    salePriceColumns.push({ headerName: 'Sale Price 1', field: 'salePrice', cellDataType: 'number', width: 180});
    for (let i = 2; i <= controlRoomSettings.salesPriceLimit; i++) {
      salePriceColumns.push({ headerName: `Sale Price ${i}`, field: `salePrice${i}`, cellDataType: 'number', width: 180});
    }
  } else {
    salePriceColumns.push({ headerName: 'Sale Price', field: 'salePrice', cellDataType: 'number', width: 180 });
  }

    const colDefs: ColDef[] = [
      { headerName: 'Batch No', field: 'batchNo', cellDataType: 'text' },
      { headerName: 'Expiry Date', field: 'expiryDate' },
      { headerName: 'Opening Stock', field: 'opBalance', cellDataType: 'number' },
      { headerName: 'Scheme Stock', field: 'opFree', cellDataType: 'number' },
      { headerName: 'Godown Stocks', field: 'godownStocks', cellDataType: 'number', valueGetter: () => fetchedGodown?.length },
      { headerName: 'Purchase Price', field: 'purPrice', cellDataType: 'number'},
      ...salePriceColumns,
      { headerName: 'MRP', field: 'mrp', width: 150, cellDataType: 'number' },
      { headerName: 'Current Stock', width: 200, field: 'currentStock', editable: false },
      { headerName: 'Lock Batch', width: 150, field: 'locked' },
      ...(controlRoomSettings.batchWiseManufacturingCode ? [{ headerName: 'MFG Code', field: 'mfgCode', width: 150 }] : []),
    ];

  return (
    <div ref={containerRef}>
      <div className="w-full">
        <div className="flex w-full items-center justify-between px-8 py-1">
          <h1 className="font-bold">{item && item.name}</h1>
          <Button type="highlight" handleOnClick={() => params.setShowBatch(null)}> Back </Button>
        </div>
        <div id="scrollheaders" className="ag-theme-quartz" >
          {tableData &&
            <AgGridReact
              ref={gridRef}
              rowData={tableData}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              rowSelection="single"
              onSelectionChanged={(event) => setSelectedRow(event.api.getSelectedNodes()[0])}
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
            id='itemBatchAlert '
            onClose={handleClosePopup}
            onConfirm={popupState.isAlertOpen ? handleAlertCloseModal : handleConfirmPopup}
            message={popupState.message}
            isAlert={popupState.isAlertOpen}
          />
        )}
        {popupList.isOpen && (
          <SelectListTableWithInput
            heading={popupList.data.heading}
            headers={popupList.data.headers}
            tableData={popupList.data.tableData}
            currentStocks={popupList.data.currentStocks}
            setGodownDataDuringCreate={setGodownDataDuringCreate}
            rowDataDuringUpdation={popupList.data.rowData}
            focusedColumn={1}
            closeList={() => setPopupList({ isOpen: false, data: {} })}
          />
        )}
      </div>
    </div>
  );
};
