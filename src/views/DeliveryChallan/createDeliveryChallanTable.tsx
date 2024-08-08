import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sendAPIRequest } from '../../helper/api';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { SchemeSection } from './createDeliveryChallan';
import { DropDownPopup } from '../../components/common/dropDownPopup';
import { schemeTypeOptions, itemHeader, batchHeader } from '../../constants/saleChallan';
import { ChallanTable } from '../../components/common/challanTable';
interface RowData {
  id: number;
  columns: {
    [key: string]: string | number | any;
  };
}


export const CreateDeliveryChallanTable = ({ setDataFromTable, totalValue, setTotalValue, challanTableData, setIsNetRateSymbol, setChallanTableData }: any) => {
  const headers = [
    { name: 'Item name', key: 'itemId', width: '15%', type: 'input', props: { inputType: 'text', label: true, handleFocus: (rowIndex: number, colIndex: number) => handleFocus(rowIndex, colIndex) } },
    { name: 'Batch no', key: 'batchNo', width: '15%', type: 'input', props: { inputType: 'text', label: true, handleFocus: (rowIndex: number, colIndex: number) => handleFocus(rowIndex, colIndex) } },
    { name: 'Qty', key: 'qty', width: '5%', type: 'input', props: { inputType: 'number', handleBlur: (args: any) => { handleQtyChange(args); handleTotalAmt(args) }, handleChange: (args: any) => { handleInputChange(args); handleTotalAmt(args) } } },
    { name: 'Scheme', key: 'scheme', width: '7%', type: 'input', props: { inputType: 'text', handleBlur: (args: any) => { handleQtyChange(args); handleTotalAmt(args) }, handleChange: (args: any) => { handleInputChange(args); handleTotalAmt(args) } } },
    { name: 'Scheme type', key: 'schemeType', width: '10%', type: 'customSelect', props: { options: schemeTypeOptions, handleChange: (args: any) => { handleSelectChange(args); handleQtyChange(args); handleTotalAmt(args) } } },
    { name: 'Rate', key: 'rate', width: '5%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); handleTotalAmt(args) } } },
    { name: 'Dis.%', key: 'disPer', width: '5%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); handleTotalAmt(args) } } },
    { name: 'Amt', key: 'amt', width: '5%', type: 'input', props: { inputType: 'number', disable: true } },
    { name: 'MRP', key: 'mrp', width: '5%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); handleTotalAmt(args) } } },
    { name: 'Exp. Date', key: 'expDate', width: '8%', type: 'input', props: { inputType: 'text', handleChange: (args: any) => { handleInputChange(args); handleTotalAmt(args) } } },
    { name: 'Tax type', key: 'taxType', width: '15%', type: 'input', props: { inputType: 'text', disable: true } },
    { name: 'GST', key: 'gstAmount', width: '5%', type: 'input', props: { inputType: 'number', disable: true } },
  ];

  const initialRows: RowData[] = Array.from({ length: 1 }, (_, rowIndex) => ({
    id: rowIndex + 1,
    columns: headers.reduce(
      (acc, header) => ({ ...acc, [header.key]: '' }),
      {}
    ),
  }));


  const { organizationId } = useParams();
  const [gridData, setGridData] = useState<RowData[]>(initialRows);
  const [itemValue, setItemValue] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [currentSavedData, setCurrentSavedData] = useState<{ item: any; batch: any; }>({ item: {}, batch: {} });
  const [schemeValue, setSchemeValue] = useState<any>({ scheme1: null, scheme2: null });
  const [open, setOpen] = useState<boolean>(false);
  const [openDataPopup, setOpenDataPopup] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [headerData, setHeaderData] = useState<any>({ isItem: false, isBatch: false });
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const focusColIndex = useRef(0);

  useEffect(() => {
    updateGridData();
  }, [currentSavedData.item, currentSavedData.batch]);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (challanTableData?.length > 0) {
      const initialRows: RowData[] = challanTableData.map(
        (rowData: any, rowIndex: number) => {
          const obj = {
            id: rowIndex + 1,
            columns: headers.reduce((acc, header) => {
              let data = rowData[header.key];

              if (header.key === 'itemId') {
                data = {
                  label: itemValue.find((x) => x.id === rowData[header.key])?.name,
                  value: rowData[header.key],
                };
              } else if (header.key === 'batchNo') {
                data = {
                  label: (itemValue.find((x) => x.id === rowData['itemId'])?.ItemBatches || []).find((x: any) => x.id === rowData[header.key])?.batchNo,
                  value: rowData[header.key],
                };
              }
              if (header.key === 'schemeType') {
                data = {
                  label: schemeTypeOptions.find((x) => x.value === rowData[header.key])?.label,
                  value: rowData[header.key],
                };
              }
              return {
                ...acc,
                [header.key]: data,
                rowId : rowData.id
              };
            }, {}),
          };
          return obj;
        }
      );
      setGridData(initialRows);
    }
  }, [challanTableData, itemValue]);


  const updateGridData = () => {
    if (focusedRowIndex === null) return;
    const newGridData = [...gridData];
    if (Object.keys(currentSavedData.item).length) {
      newGridData[focusedRowIndex].columns['itemId'] = {
        label: currentSavedData.item.name,
        value: currentSavedData.item.id,
      };
      const newValue = newGridData[focusedRowIndex].columns['itemId'];
      setGridData(newGridData);
      updateTaxAndGst(focusedRowIndex, newValue);
    }

    if (Object.keys(currentSavedData.batch).length) {
      newGridData[focusedRowIndex].columns['batchNo'] = {
        label: currentSavedData.batch.batchNo,
        value: currentSavedData.batch.id,
      };
      setGridData(newGridData);
      handleQtyInput(
        focusedRowIndex,
        newGridData[focusedRowIndex].columns['batchNo']
      );
    }

    if(focusColIndex.current === 0){
      handleFocus(focusedRowIndex,1)
       }

    if(focusColIndex.current === 1){
      document.getElementById(`cell-${focusedRowIndex}-${focusColIndex.current + 1}`)?.focus();
      }

  };

  const togglePopup = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'm':
      case 'M':
        if (event.ctrlKey) {
          if (togglePopup) togglePopup(true);
        }
        break;
      case 'Escape':
        if (openDataPopup) setOpenDataPopup(false);
        if (togglePopup) togglePopup(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    fetchItems();
  }, [])

  const handleFocus = (rowIndex: number, colIndex: number) => {
    focusColIndex.current = colIndex;
    setFocusedRowIndex(rowIndex);
    if (colIndex === 0) {
      setTableData(itemValue);
      setHeaderData({ ...headerData, isItem: true, isBatch: false });
    }
    if (colIndex === 1 ) {
      if (challanTableData && challanTableData.length > 0 && rowIndex < challanTableData.length) {
        const item = challanTableData[rowIndex];
        const selectedItem = itemValue.find((data: any) => data.id === item.itemId);
        if (selectedItem) {
          setTableData(selectedItem.ItemBatches);
          setBatches(selectedItem.ItemBatches);
        }
      }
      else {
        const selectedItem = itemValue.find((item: any) => item.name === currentSavedData.item.name);
        if (selectedItem) {
          setTableData(selectedItem.ItemBatches);
          setBatches(selectedItem.ItemBatches);
        }
      }
      setHeaderData({ ...headerData, isItem: false, isBatch: true });
    }
    return setOpenDataPopup(true);
  }

  const fetchItems = async () => {
    const items = await sendAPIRequest<any>(`/${organizationId}/item`);
    const company = await sendAPIRequest<any>(`/${organizationId}/company`);
    const sales = await sendAPIRequest<any>(`/${organizationId}/sale`);
    const purchases = await sendAPIRequest<any>(`/${organizationId}/purchase`);

    items.map((item: any) => {
      item.company = company.find((comp: any) => comp.company_id === item.compId)?.companyName;
      item.sales = sales.find((sale: any) => sale.sp_id === item.saleAccId)?.sptype;
      item.purchase = purchases.find((purchase: any) => purchase.sp_id === item.purAccId)?.sptype;
    })
    setItemValue(items);
    setTableData(items);
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const getSalesPurchaseData = async () => {
    const sale = await sendAPIRequest<any[]>(`/${organizationId}/sale`);
    const purchase = await sendAPIRequest<any[]>(`/${organizationId}/purchase`);
    return [...sale, ...purchase];
  };

  const handleInputChange = async ({ rowIndex, header, value }: any) => {
    const newGridData = [...gridData];
    newGridData[rowIndex].columns[header] = value;
    setGridData(newGridData);
  };

  const updateTaxAndGst = async (rowIndex: number, value: any) => {
    const newGridData = [...gridData];
    const company = await sendAPIRequest<any[]>(`/${organizationId}/company`);
    let selectedItem = '';
    if (value !== undefined || !!value) {
      selectedItem = value.label;
    }
    const item = itemValue?.find((item: any) => item.name === selectedItem);
    const spData = await getSalesPurchaseData();
    const salesPurchaseSelected = spData.find((data: any) => data.sp_id === item?.saleAccId);
    const taxTypeInitial = salesPurchaseSelected?.sptype;
    const isStateInOut = company.find((comp: any) => comp.company_id === item?.compId)?.stateInOut;
    newGridData[rowIndex].columns = {
      ...newGridData[rowIndex].columns,
      taxType: taxTypeInitial,
      gstAmount: isStateInOut === 'Within State' ? Number(salesPurchaseSelected.cgst) + Number(salesPurchaseSelected.sgst) : isStateInOut === 'Out Of State' ? Number(salesPurchaseSelected.igst) : 0,
    };
    setGridData(newGridData);
  };

  const handleSelectChange = ({ selectedOption, rowIndex, header }: any) => {
    if (selectedOption) handleInputChange({ rowIndex, header, value: selectedOption || {} });
  };

  const handleTotalAmt = ({ rowIndex }: any) => {
    const newGridData = [...gridData];
    const { qty, schemeType, rate, disPer } = newGridData[rowIndex].columns;
    let { scheme } = newGridData[rowIndex].columns;
    let total = rate * qty;
    // Todo:  confirm the net rate symbol calculations
    if (schemeValue.scheme1 !== null) {
      const value = +schemeValue.scheme1 + (schemeValue.scheme2 === null ? 0 : +schemeValue.scheme2);
      scheme = +schemeValue.scheme1 / +value;
    }
    if (schemeType.value === '%') total -= (total * scheme) / 100;
    else if (schemeType.value === 'R') total -= scheme;
    else if (schemeType.value === '/') total -= qty * scheme;
    newGridData[rowIndex].columns.amt = total;
    total = parseFloat(total.toFixed(2));

    const totalDiscount = newGridData.reduce((acc, data) => acc + (data.columns.amt * data.columns.disPer) / 100, 0);
    const totalGST = newGridData.reduce((acc, data) => acc + ((data.columns.amt - (data.columns.amt * data.columns.disPer) / 100) * data.columns.gstAmount) / 100, 0);

    const totalAmt = newGridData.reduce((acc, data) => acc + (data.columns.amt - (data.columns.amt * data.columns.disPer) / 100) + ((data.columns.amt - (data.columns.amt * data.columns.disPer) / 100) * data.columns.gstAmount) / 100, 0);
    const totalQty = newGridData.reduce((acc, data) => acc + Number(data.columns.qty) + (data.columns.scheme !== '' && data.columns.schemeType.label === 'Pieces' ? Number(data.columns.scheme) : 0), 0);
    setGridData(newGridData);
    setTotalValue({
      ...totalValue,
      totalAmt: totalAmt,
      totalQty: totalQty,
      totalDiscount: totalDiscount,
      totalGST: totalGST,
    });
  };

  const handleSave = () => {
    const dataToSend = gridData.map((row) => ({
      id: row.id,
      ...row.columns,
    }));
    if (schemeValue.scheme1 !== null) {
      setIsNetRateSymbol('Yes');
    }
    setDataFromTable(dataToSend);
    setPopupState({
      ...popupState,
      isAlertOpen: true,
      message: 'Table Data saved successfully.',
    });
  };

  const handleRemainingQty = (rowIndex: number, selectedBatch: any) => {
    let remainingQty = selectedBatch?.currentStock;
    gridData.forEach((data: any, index: number) => {
      if (index < rowIndex && data.columns['batchNo']?.label === selectedBatch?.batchNo) {
        if (data.columns['scheme'] !== '' && data.columns['schemeType'].label === 'Pieces') {
          remainingQty = remainingQty - (Number(data.columns['qty']) + Number(data.columns['scheme']));
        } else {
          remainingQty -= Number(data.columns['qty']);
        }
      }
    });
    return remainingQty;
  };

  const handleQtyInput = (rowIndex: number, value: any) => {
    const updatedGridData = [...gridData];
    const selectedBatch = value?.label;
    const batch = batches?.find((batch: any) => batch.batchNo === selectedBatch);
    if (rowIndex) {
      const remainingQty = handleRemainingQty(rowIndex, batch);
      updatedGridData[rowIndex].columns.qty = remainingQty;
    } else {
      updatedGridData[rowIndex].columns.qty = batch?.currentStock;
    }
    updatedGridData[rowIndex].columns.rate = batch?.salePrice;
    updatedGridData[rowIndex].columns.mrp = batch?.mrp;
    updatedGridData[rowIndex].columns.expDate = batch?.expiryDate;
    setGridData(updatedGridData);
  };

  const handleQtyChange = ({ row, rowIndex, colIndex }: any) => {
    let sum = 0;
    const selectedBatch = row.columns['batchNo'];
    const batch = batches?.find((batch: any) => batch.batchNo === selectedBatch?.label);
    for (const data of gridData) {
      if (data.columns['batchNo'].label === selectedBatch?.label) {
        if (data.columns['scheme'] !== '' && data.columns['schemeType'].label === 'Pieces') {
          sum = sum + Number(data.columns['qty']) + Number(data.columns['scheme']);
          if (sum > batch?.currentStock) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message:
                'No more available stocks. Please select a smaller quantity or scheme.',
            });
            break;
          }
        } else {
          sum += Number(data.columns['qty']);
          if (sum > batch?.currentStock) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message:
                'Selected quantity exceeds the available stock. Please select a smaller quantity.',
            });
            break;
          }
        }
      }
    }
  };

  const handleDeleteRow =(rowIndex:number, data:any)=>{
    const updateItems = [...itemValue]
    const itemIndex = updateItems.findIndex((x:any)=> x.id === data.columns.itemId?.value)
    const batchIndex = updateItems[itemIndex].ItemBatches.findIndex((x:any)=> x.id === data.columns.batchNo?.value)
    updateItems[itemIndex].ItemBatches[batchIndex].currentStock += (Number(data.columns.qty) + (data.columns.scheme !== '' && data.columns.schemeType.label === 'Pieces' ? Number(data.columns.scheme) : 0))
    if(challanTableData?.length && challanTableData.find((x:any)=> x.id === data.columns.rowId)){
        setChallanTableData(challanTableData.filter((x:any)=> x.id !== data.columns.rowId))
    }
    setItemValue(updateItems)
  }

  return (
    <div className="">
      <ChallanTable
        headers={headers}
        gridData={gridData}
        setGridData={setGridData}
        handleSave={handleSave}
        withAddRow = {()=> setCurrentSavedData({ item: {}, batch: {} })}
        rowDeleteCallback={handleDeleteRow}
      />

      {popupState.isAlertOpen && (
        <Confirm_Alert_Popup
          onClose={handleClosePopup}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
      {open && (
        <SchemeSection
          togglePopup={togglePopup}
          setSchemeValue={setSchemeValue}
        />
      )}
      {openDataPopup && (headerData.isItem || headerData.isBatch) && (
        <DropDownPopup
          heading={headerData.isItem ? 'Items' : headerData.isBatch ? 'Batches' : ''}
          setOpenDataPopup={setOpenDataPopup}
          headers={headerData.isItem ? itemHeader : headerData.isBatch ? batchHeader : []}
          tableData={tableData}
          setCurrentSavedData={setCurrentSavedData}
          dataKeys={{ 'Items': 'item',  'Batches': 'batch' }}
        />
      )}
    </div>
  );

};
