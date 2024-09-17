import React, { useEffect, useRef, useState } from 'react';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { SchemeSection } from './createDeliveryChallan';
import { schemeTypeOptions, itemHeader, batchHeader, itemFooters, batchFooters, previousItemsList, pendingChallansList } from '../../constants/saleChallan';
import { ChallanTable } from '../../components/common/challanTable';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import Items from '../item';
import { useTabs } from '../../TabsContext';
import { sendAPIRequest } from '../../helper/api';
interface RowData {
  id: number;
  columns: {
    [key: string]: string | number | any;
  };
}


export const CreateDeliveryChallanTable = ({ setDataFromTable, totalValue, setTotalValue, challanTableData, setIsNetRateSymbol, setChallanTableData, partyId, challanId }: any) => {
  const headers = [
    { name: 'Item name', key: 'itemId', width: '15%', type: 'input', props: { inputType: 'text', label: true, handleFocus: (rowIndex: number, colIndex: number) => handleFocus(rowIndex, colIndex) } },
    { name: 'Batch no', key: 'batchNo', width: '15%', type: 'input', props: { inputType: 'text', label: true, handleFocus: (rowIndex: number, colIndex: number) => handleFocus(rowIndex, colIndex) } },
    { name: 'Qty', key: 'qty', width: '5%', type: 'input', props: { inputType: 'number', handleBlur: (args: any) => { handleQtyChange(args); handleTotalAmt(args) }, handleChange: (args: any) => { handleInputChange(args); handleTotalAmt(args) } } },
    { name: 'Scheme', key: 'scheme', width: '7%', type: 'input', props: { inputType: 'number', handleBlur: (args: any) => { handleQtyChange(args); handleTotalAmt(args) }, handleChange: (args: any) => { handleInputChange(args); handleTotalAmt(args) } } },
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

  const [gridData, setGridData] = useState<RowData[]>(initialRows);
  const [itemValue, setItemValue] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [currentSavedData, setCurrentSavedData] = useState<{ item: any; batch: any; }>({ item: {}, batch: {} });
  const [schemeValue, setSchemeValue] = useState<any>({ scheme1: null, scheme2: null });
  const [open, setOpen] = useState<boolean>(false);
  const [openDataPopup, setOpenDataPopup] = useState<boolean>(false);
  const focusColIndex = useRef(0);
  const { openTab } = useTabs()

  const [popupState, setPopupState] = useState<any>({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
    onClose : null
  });
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
    isOpen: false,
    data: {}
  })

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
            columns: headers.reduce((acc: any, header: any) => {
              let data = rowData[header.key];

              if (header.key === 'itemId') {
                data = {
                  label: itemValue.find((x) => x.id === rowData[header.key])?.name,
                  value: rowData[header.key],
                };
              } else if (header.key === 'batchNo') {
                data = {
                  label: batches.find((x) => x.id === rowData[header.key])?.batchNo,
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
                rowId: rowData.id
              };
            }, {}),
          };
          return obj;
        }
      );
      setGridData(initialRows);
      calculateTotals(initialRows)
      handleTotalAmt({ rowIndex: -1, data: initialRows })
    }
  }, [challanTableData, itemValue]);

  useEffect(() => {
    const setItemAndBatches = async () => {
      if (challanId) {
        try {
          const resp = await sendAPIRequest(`/deliveryChallan/items/${challanId}`, { method: 'POST' });
          if (resp && Array.isArray(resp)) {
            const newItemValues: any = [];
            const newBatches: any = [];
            const processedItemIds = new Set();
            const processedBatchNos = new Set();

            resp.forEach(item => {
              if (!processedItemIds.has(item.itemId)) {
                newItemValues.push(item.Item);
                processedItemIds.add(item.itemId);
              }
              if (!processedBatchNos.has(item.batchNo)) {
                newBatches.push({ ...item.ItemBatch, additionalStockQty: item.schemeType === 'P' ? (item.qty + item.scheme) : item.qty });
                processedBatchNos.add(item.batchNo);
              } else {
                const batchIndex = newBatches.findIndex((b: any) => b.id === item.batchNo);
                if (batchIndex !== -1) {
                  const existingBatch = newBatches[batchIndex];
                  const additionalStock = item.schemeType === 'P' ? (item.qty + item.scheme) : item.qty;
                  existingBatch.additionalStockQty = (existingBatch.additionalStockQty || 0) + additionalStock;
                }
              }
            });

            setItemValue(prevItemValue => [
              ...prevItemValue,
              ...newItemValues.filter((item: any) => !prevItemValue.some(i => i.id === item.id))
            ]);

            setBatches(prevBatches => [
              ...prevBatches.filter(batch => !processedBatchNos.has(batch.id)),
              ...newBatches
            ]);

          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    setItemAndBatches();
  }, [challanId]);

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

    if (focusColIndex.current === 0) {
      // if (partyId) {
      //   setPopupList({
      //     isOpen: true,
      //     data: {
      //       heading: 'Previous Challan Items',
      //       headers: [...previousItemsList],
      //       apiRoute: `/deliveryChallan/items/${partyId}/${currentSavedData.item.id}`,
      //       handleSelect: () => { handleFocus(focusedRowIndex, 1) },
      //       onEsc: () => { handleFocus(focusedRowIndex, 1) },
      //       autoClose: false
      //     }
      //   })
      // }
      // else {
        handleFocus(focusedRowIndex, 1)
      // }
    }

    if (focusColIndex.current === 1) {
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
    if (!gridData.length) {
      return setGridData(initialRows)
    }
    return handleSave();
  }, [gridData])

  useEffect(() => {
    if (!popupState.isAlertOpen && popupState.onClose) {
          popupState.onClose();
          setPopupState({ ...popupState, isAlertOpen: false , onClose:null});
        }
  }, [popupState])


  const handleFocus = (rowIndex: number, colIndex: number) => {
    focusColIndex.current = colIndex;
    setFocusedRowIndex(rowIndex);
    if (colIndex === 0) {
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Item',
          headers: [...itemHeader],
          footers: itemFooters,
          newItem: () => openTab('Items', <Items type='add' />),
          apiRoute: '/item',
          searchFrom: 'name',
          handleSelect: (rowData: any) => {
            const isItemSelected = gridData.findIndex((x)=> x.columns.itemId?.value === rowData.id)
            setCurrentSavedData({ ...currentSavedData, item: rowData });
            const isItemExists = itemValue.some((item: any) => item.id === rowData.id);
            if (!isItemExists) {
              setItemValue([...itemValue, rowData]);
            }
            if(isItemSelected > -1 && isItemSelected !== rowIndex){
              setPopupState({
                ...popupState,
                isAlertOpen: true,
                message:
                  "Alert! , You've already selected this item",
                  onClose : ()=> document.getElementById('searchBar')?.focus()
              });
            }
          },
          autoClose: true

        }
      })
    }
    if (colIndex === 1) {

      const selectedItem = itemValue.find((item: any) => item.id === gridData[rowIndex].columns.itemId?.value);
      if (!selectedItem) {
        setPopupState({
          ...popupState,
          isAlertOpen: true,
          message:
            'Select item name first',
        });
        return document.getElementById(`cell-${rowIndex}-${focusColIndex.current + 1}`)?.focus();
      }
      if (selectedItem) {
        setPopupList({
          isOpen: true,
          data: {
            heading: 'Batch',
            headers: [...batchHeader],
            footers: batchFooters,
            newItem: () => openTab('Item', <Items batchData={itemValue.find((x) => x.id === gridData[rowIndex].columns.itemId?.value)} />),
            apiRoute: `/item/${gridData[rowIndex].columns.itemId?.value}/batch`,
            searchFrom: 'batchNo',
            autoClose: true,
            handleSelect: (rowData: any) => {
              setCurrentSavedData({ ...currentSavedData, batch: rowData });
              const isBatchExists = batches.some((batch: any) => batch.id === rowData.id);
              if (!isBatchExists) {
                setBatches([...batches, rowData]);
              }
            },
          }
        })
      }
      else {
        setPopupState({
          ...popupState,
          isAlertOpen: true,
          message:
            'No unlocked batch associated with this items',
        });
        return document.getElementById(`cell-${rowIndex}-${focusColIndex.current + 1}`)?.focus();
      }

    }
  }
  
  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false});
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleInputChange = async ({ rowIndex, header, value }: any) => {
    const newGridData = [...gridData];
    newGridData[rowIndex].columns[header] = value;
    setGridData(newGridData);
  };

  const updateTaxAndGst = async (rowIndex: number, value: any) => {
    const newGridData = [...gridData];
    const item = itemValue?.find((item: any) => item.id === value?.value);
    newGridData[rowIndex].columns = {
      ...newGridData[rowIndex].columns,
      taxType: item.saleAccount?.sptype,
      gstAmount: item.company?.stateInOut === 'Within State' ? Number(item.saleAccount.cgst) + Number(item.saleAccount.sgst) : item.company?.stateInOut === 'Out Of State' ? Number(item.saleAccount.igst) : 0,
      cgst : item.company?.stateInOut === 'Within State' ? Number(item.saleAccount.cgst): 0,
      sgst : item.company?.stateInOut === 'Within State' ? Number(item.saleAccount.sgst) :  0,
    };
    setGridData(newGridData);
  };

  const handleSelectChange = ({ selectedOption, rowIndex, header }: any) => {
    if (selectedOption) handleInputChange({ rowIndex, header, value: selectedOption || {} });
  };


  const handleTotalAmt = ({ rowIndex, data }: { rowIndex: number, data?: any[] }) => {
    const newGridData = [...(data?.length ? data : gridData)];
    if (rowIndex >= 0) {
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
    }

    newGridData.map(async (data: any) => {
      const item = itemValue?.find((item: any) => item.id === data.columns.itemId.value);
      const isStateInOut = item?.company?.stateInOut
      if (isStateInOut === 'Within State') {
        data.columns.cgst = Number(item.saleAccount.cgst);
        data.columns.sgst = Number(item.saleAccount.sgst);
      }
      else {
        data.columns.cgst = 0
        data.columns.sgst = 0
      }
    })
    setGridData(newGridData);
  };

  const calculateTotals = (data?: typeof gridData) => {
    const newGridData = [...(Array.isArray(data)? data : gridData)];
    const totalDiscount = newGridData.reduce((acc, item) => acc + (item.columns.amt * item.columns.disPer) / 100, 0);
    const totalGST = newGridData.reduce((acc, item) => acc + ((item.columns.amt - (item.columns.amt * item.columns.disPer) / 100) * item.columns.gstAmount) / 100, 0);
    const totalCGST = newGridData.reduce((acc, item) => acc + ((item.columns.amt - (item.columns.amt * item.columns.disPer) / 100) * (item.columns.cgst || 0)) / 100, 0);
    const totalSGST = newGridData.reduce((acc, item) => acc + ((item.columns.amt - (item.columns.amt * item.columns.disPer) / 100) * (item.columns.sgst || 0)) / 100, 0);
    const totalAmt = newGridData.reduce((acc, item) => acc + (item.columns.amt - (item.columns.amt * item.columns.disPer) / 100) + ((item.columns.amt - (item.columns.amt * item.columns.disPer) / 100) * item.columns.gstAmount) / 100, 0);
    const totalQty = newGridData.reduce((acc, item) => acc + Number(item.columns.qty) + (item.columns.scheme !== '' && item.columns.schemeType.label === 'Pieces' ? Number(item.columns.scheme) : 0), 0);
    setTotalValue({
      ...totalValue,
      totalAmt,
      totalQty,
      totalDiscount,
      totalGST,
      totalCGST,
      totalSGST,
      isDefault: false
    });
  };

  const handleSave = () => {
    calculateTotals(gridData)
    const dataToSend = gridData.map((row) => {
      if (row.columns?.itemId?.value) {
        return {
          id: row.id,
          ...row.columns,
        };
      }
      return null;
    }).filter(Boolean);
    
    if (schemeValue.scheme1 !== null) {
      setIsNetRateSymbol('Yes');
    }
    setDataFromTable(dataToSend);
  };

  const handleRemainingQty = (rowIndex: number, selectedBatch: any) => {
    let remainingQty = selectedBatch?.currentStock + (selectedBatch.additionalStockQty || 0);
    gridData.forEach((data: any, index: number) => {
      if (index < rowIndex && data.columns['batchNo']?.value === selectedBatch?.id) {
        if (data.columns['scheme'] !== '' && data.columns['schemeType'].label === 'Pieces') {
          remainingQty = remainingQty - (Number(data.columns['qty']) + Number(data.columns['scheme']));
        } else {
          remainingQty -= Number(data.columns['qty']);
        }
      }
    });
    remainingQty -= (gridData[rowIndex].columns['schemeType'].label === 'Pieces' ? Number(gridData[rowIndex].columns['scheme']) : 0);
    return remainingQty
  };

  const handleQtyInput = (rowIndex: number, value: any) => {
    const updatedGridData = [...gridData];
    const batch = batches?.find((batch: any) => batch.id === value?.value);
    const remainingQty = handleRemainingQty(rowIndex, batch);
    updatedGridData[rowIndex].columns.qty = remainingQty;
    updatedGridData[rowIndex].columns.rate = batch?.salePrice;
    updatedGridData[rowIndex].columns.mrp = batch?.mrp;
    updatedGridData[rowIndex].columns.expDate = batch?.expiryDate;
    setGridData(updatedGridData);
  };

  const handleQtyChange = ({ row }: any) => {
    let sum = 0;
    const selectedBatch = row.columns['batchNo'];
    const batch = batches?.find((batch: any) => batch.id === selectedBatch?.value);
    for (const data of gridData) {
      if (data.columns['batchNo'].value === selectedBatch?.value) {
        if (data.columns['scheme'] !== '' && data.columns['schemeType'].label === 'Pieces') {
          sum = sum + Number(data.columns['qty']) + Number(data.columns['scheme']);
          if (sum > batch?.currentStock + (batch?.additionalStockQty || 0)) {
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
          if (sum > batch?.currentStock + (batch?.additionalStockQty || 0)) {
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

  const handleDeleteRow = (rowIndex: number) => {
    calculateTotals(gridData.filter((_, ind) => ind !== rowIndex))
  }

  return (
    <div className="flex flex-col gap-1">
      <ChallanTable
        headers={headers}
        gridData={gridData}
        setGridData={setGridData}
        withAddRow={() => setCurrentSavedData({ item: {}, batch: {} })}
        rowDeleteCallback={handleDeleteRow}
        newRowTrigger={headers.length - 3}
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
      {popupList.isOpen && <SelectList
        tableData={[]}
        heading={popupList.data.heading}
        closeList={() => setPopupList({ isOpen: false, data: {} })}
        headers={popupList.data.headers}
        footers={popupList.data.footers}
        apiRoute={popupList.data.apiRoute}
        handleSelect={(rowData) => { popupList.data.handleSelect(rowData) }}
        handleNewItem={popupList.data?.newItem}
        searchFrom={popupList.data.searchFrom}
        autoClose={popupList.data.autoClose}
        onEsc={popupList.data.onEsc}
      />}
    </div>
  );

};