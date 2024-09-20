import React, { useEffect, useRef, useState } from 'react';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import { schemeTypeOptions, itemHeader, batchHeader, itemFooters, batchFooters } from '../../constants/saleChallan';
import { ChallanTable } from '../../components/common/challanTable';
import { useSelector } from 'react-redux';
import { useTabs } from '../../TabsContext';
import Items from '../item';
import useApi from '../../hooks/useApi';
import { isLessThanMonths } from '../../helper/helper';
import { useControls } from '../../ControlRoomContext';

interface RowData {
  id: number;
  columns: {
    [key: string]: string | number | any;
  };
}

export const CreateSaleBillTable = ({ setDataFromTable, totalValue, setTotalValue, billTableData, setIsNetRateSymbol, isEditing, selectedParty, invoiceDate }: any) => {
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
      (acc, header) => ({ ...acc, [header.key]: header.props?.inputType === 'number' ? null : '' }),
      {}
    ),
  }));

  const [gridData, setGridData] = useState<RowData[]>(initialRows);
  const [itemValue, setItemValue] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const { sales, company, purchase } = useSelector((state: any) => state.global)
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [currentSavedData, setCurrentSavedData] = useState<{ item: any; batch: any; }>({ item: {}, batch: {} });
  const [schemeValue, setSchemeValue] = useState<any>({ scheme1: null, scheme2: null });
  const [open, setOpen] = useState<boolean>(false);
  const { openTab } = useTabs()
  const { sendAPIRequest } = useApi();
  const { controlRoomSettings } = useControls();
  const [popupState, setPopupState] = useState<any>({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
    onClose: null
  });
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: {} })
  const focusColIndex = useRef(0);
  const cgst = useRef<number | null>(null);
  const sgst = useRef<number | null>(null);

  useEffect(() => {
    updateGridData();
  }, [currentSavedData.item, currentSavedData.batch]);

  useEffect(() => {
    fetchItems();
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!gridData.length) {
      setGridData(initialRows);
    }
    return handleSave();
  }, [gridData]);

  const calculateTotals = (data?: typeof gridData) => {
    const newGridData = [...(Array.isArray(data) ? data : gridData)];
    const totalAmt = newGridData.reduce((acc, data) => acc + data.columns.amt, 0);
    const totalQty = newGridData.reduce((acc, item) => acc + Number(item.columns.qty) + (item.columns.scheme !== '' && item.columns.schemeType.label === 'Pieces' ? Number(item.columns.scheme) : 0), 0);
    setTotalValue({
      ...totalValue,
      totalAmt,
      totalQty,
      isDefault: false
    });
  };

  useEffect(() => {
    if (billTableData?.length > 0) {
      const initialRows: RowData[] = billTableData.map(
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
                ['isSaleBillCreated']: rowData.isSaleBillCreated,
                ['isFromChallan']: rowData.isFromChallan,
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
  }, [billTableData, itemValue]);

  useEffect(() => {
    const allItems = JSON.parse(JSON.stringify(itemValue));
    billTableData?.forEach((billItem: any) => {
      const selectedItem = allItems.find((item: any) => item.id === billItem.itemId);
      if (selectedItem) {
        const batch = selectedItem.ItemBatches.find((batch: any) => batch.id === billItem.batchNo);
        if (batch) {
          batch.currentStock += billItem.qty;
        }
      }
    });
    setItemValue(allItems)
  }, [billTableData])

  const settingPopupState = (isModal: boolean, message: string, onClose?: any) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
      onClose: onClose
    });
  };

  const updateDiscountIfPartyWiseDiscount = async (rowIndex: number, value: any) => {
    const newGridData = [...gridData];
    let selectedItem = '';
    if (value !== undefined || !!value) selectedItem = value.value;
    const item = itemValue?.find((item: any) => item.id === selectedItem);

    try {
      const getPartyWiseDiscount = await sendAPIRequest<any[]>(`/partyWiseDiscount`);
      const allPartyWiseDiscount = getPartyWiseDiscount.filter((party: any) => party?.partyId === selectedParty);
      const partyWiseDiscountForCompany = allPartyWiseDiscount.filter((party: any) => party?.companyId === item.compId);
      const companyWiseDiscount = partyWiseDiscountForCompany.filter((party: any) => party?.discountType === 'companyWise');
      const dpcoActDiscount = partyWiseDiscountForCompany.filter((party: any) => party?.discountType === 'dpcoact');
  
      const discountGiven = !!dpcoActDiscount.length ? dpcoActDiscount[0].discount : (!!companyWiseDiscount.length ? companyWiseDiscount[0].discount : (!!allPartyWiseDiscount.length ? allPartyWiseDiscount[0].discount : 0))
  
      newGridData[rowIndex].columns = {
        ...newGridData[rowIndex].columns,
        disPer: discountGiven,
      };
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Party wise discount not fetched in salebill');
      }
    }
  }

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
      updateDiscountIfPartyWiseDiscount(focusedRowIndex, newValue);
    }

    if (Object.keys(currentSavedData.batch).length) {
      newGridData[focusedRowIndex].columns['batchNo'] = {
        label: currentSavedData.batch.batchNo,
        value: currentSavedData.batch.id,
      };
      setGridData(newGridData);
      handleQtyInput(focusedRowIndex, newGridData[focusedRowIndex].columns['batchNo']);
      handleTotalAmt({ rowIndex: focusedRowIndex, data: newGridData })
    }

    if (focusColIndex.current === 0) handleFocus(focusedRowIndex, 1);

    if (focusColIndex.current === 1) document.getElementById(`cell-${focusedRowIndex}-${focusColIndex.current + 1}`)?.focus();

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
        if (togglePopup) togglePopup(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!popupState.isAlertOpen && popupState.onClose) {
      popupState.onClose();
      setPopupState({ ...popupState, isAlertOpen: false, onClose: null });
    }
  }, [popupState])

  const handleFocus = (rowIndex: number, colIndex: number) => {
    if (!!billTableData && isEditing.current === false && rowIndex < billTableData.length) return;
    if (!!billTableData && rowIndex < billTableData.length && isEditing.current === true && billTableData[rowIndex]?.isFromChallan) return;
    focusColIndex.current = colIndex;
    setFocusedRowIndex(rowIndex);
    if (colIndex === 0) {
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Select Item',
          headers: [...itemHeader],
          footers: [...itemFooters],
          newItem: () => openTab('Items', <Items type='add' />),
          apiRoute: '/item',
          searchFrom: 'name',
          handleSelect: (rowData: any) => {
            const isItemSelected = gridData.findIndex((x) => x.columns.itemId?.value === rowData.id)
            setCurrentSavedData({ ...currentSavedData, item: rowData });
            const isItemExists = itemValue.some((item: any) => item.id === rowData.id);
            if (!isItemExists) {
              setItemValue([...itemValue, rowData]);
            }
            if (isItemSelected > -1 && isItemSelected !== rowIndex) {
              settingPopupState(false, `Alert! You've already selected this item`, () => document.getElementById('searchBar')?.focus());
            }
          },
          autoClose: true
        }
      })
    }
    if (colIndex === 1) {
      if (billTableData && billTableData.length > 0 && rowIndex < billTableData.length) {
        const item = billTableData[rowIndex];
        const selectedItem = itemValue.find((data: any) => data.id === item.itemId);
        if (selectedItem) {
          setPopupList({
            isOpen: true,
            data: {
              heading: 'Select Batch',
              headers: [...batchHeader],
              footers: batchFooters,
              newItem: () => openTab('Item', <Items batchData={currentSavedData.item} />),
              apiRoute: `/item/${currentSavedData.item.id}/batch`,
              ...({ extraQueryParams: { locked: 'N' } }),
              searchFrom: 'batchNo',
              handleSelect: (rowData: any) => {
                setCurrentSavedData({ ...currentSavedData, batch: rowData });
                const nearexpiry = isLessThanMonths(invoiceDate, rowData.expiryDate, Number(controlRoomSettings.expiryWarningMonths))
                const isBatchExists = batches.some((batch: any) => batch.id === rowData.id);
                if (!isBatchExists) {
                  setBatches([...batches, rowData]);
                }
                if (nearexpiry) {
                  settingPopupState(false, 'Item is near expiry', () => document.getElementById(`cell-${rowIndex}-${focusColIndex.current + 1}`)?.focus())
                }
              },
              autoClose: true
            }
          })
        }
      }
      else {
        const selectedItem = itemValue.find((item: any) => item.id === currentSavedData.item.id);
        if (!selectedItem) {
          settingPopupState(false, 'Select the item first...');
          return document.getElementById(`cell-${rowIndex}-${focusColIndex.current + 1}`)?.focus();
        }
        if (selectedItem) {
          setPopupList({
            isOpen: true,
            data: {
              heading: 'Select Batch',
              headers: [...batchHeader],
              footers: batchFooters,
              newItem: () => openTab('Item', <Items batchData={currentSavedData.item} />),
              apiRoute: `/item/${currentSavedData.item.id}/batch`,
              ...({ extraQueryParams: { locked: 'N' } }),
              searchFrom: 'batchNo',
              autoClose: true,
              handleSelect: (rowData: any) => {
                setCurrentSavedData({ ...currentSavedData, batch: rowData });
                const nearexpiry = isLessThanMonths(invoiceDate, rowData.expiryDate, Number(controlRoomSettings.expiryWarningMonths))
                const isBatchExists = batches.some((batch: any) => batch.id === rowData.id);
                if (!isBatchExists) {
                  setBatches([...batches, rowData]);
                }
                if (nearexpiry) {
                  settingPopupState(false, 'Item is near expiry', () => document.getElementById(`cell-${rowIndex}-${focusColIndex.current + 1}`)?.focus())
                }
              },
            }
          })
        }
        else {
          settingPopupState(false, 'No unlocked batch associated with this items');
          return document.getElementById(`cell-${rowIndex}-${focusColIndex.current + 1}`)?.focus();
        }
      }
    }
  }

  const fetchItems = async () => {
    try {
      const items = await sendAPIRequest<any[]>(`/item`)
      items.map((item: any) => {
        item.company = company.find((comp: any) => comp.company_id === item.compId)?.companyName;
        item.sales = sales.find((sale: any) => sale.sp_id === item.saleAccId)?.sptype;
        item.purchase = purchase.find((purchase: any) => purchase.sp_id === item.purAccId)?.sptype;
        item.ItemBatches = item.ItemBatches.map((batch: any) => {
          return {
            ...batch,
            updatedOpFree: parseFloat(((batch.opFree / batch.opBalance) * 100).toFixed(2))
          }
        })
      })
      setItemValue(items);
    } catch (error: any) {
      if (!error?.isErrorHandled) {
        console.log('Items not feteched in salebill');
      }
    }
  };

  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleInputChange = async ({ rowIndex, header, value }: any) => {
    if (!!billTableData && rowIndex < billTableData.length && isEditing.current === false) return;
    if (!!billTableData && rowIndex < billTableData.length && isEditing.current === true && billTableData[rowIndex]?.isFromChallan) return;
    const newGridData = [...gridData];
    newGridData[rowIndex].columns[header] = value;
    setGridData(newGridData);
  };

  const updateTaxAndGst = async (rowIndex: number, value: any) => {
    const newGridData = [...gridData];
    let selectedItem = '';
    if (value !== undefined || !!value) {
      selectedItem = value.value;
    }
    const item = itemValue?.find((item: any) => item.id === selectedItem);
    cgst.current = Number(item.saleAccount?.cgst);
    sgst.current = Number(item.saleAccount?.cgst);
    const isStateInOut = company.find((comp: any) => comp.company_id === item?.compId)?.stateInOut;
    newGridData[rowIndex].columns = {
      ...newGridData[rowIndex].columns,
      taxType: item.saleAccount.sptype,
      gstAmount: isStateInOut === 'Within State' ? Number(item.saleAccount.cgst) + Number(item.saleAccount.sgst) : isStateInOut === 'Out Of State' ? Number(item.saleAccount.igst) : 0,
    };
    setGridData(newGridData);
  };

  const handleSelectChange = ({ selectedOption, rowIndex, header }: any) => {
    if (!!billTableData && rowIndex < billTableData.length && isEditing.current === false) return;
    if (!!billTableData && rowIndex < billTableData.length && isEditing.current === true && billTableData[rowIndex]?.isFromChallan) return;
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

      newGridData.map(async (data: any) => {
        const item = itemValue?.find((item: any) => item.id === data.columns.itemId.value);
        const isStateInOut = company.find((comp: any) => comp.company_id === item?.compId)?.stateInOut;

        if (isStateInOut === 'Within State') {
          data.columns.cgst = Number(item.saleAccount.cgst);
          data.columns.sgst = Number(item.saleAccount.sgst);
        }
      })
      setGridData(newGridData);
    }
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

    if (schemeValue.scheme1 !== null) setIsNetRateSymbol('Yes');
    setDataFromTable(dataToSend);
  };

  const handleRemainingQty = (rowIndex: number, selectedBatch: any) => {
    let remainingQty = selectedBatch?.currentStock;
    gridData.forEach((data: any, index: number) => {
      if ((data.columns['isFromChallan' as keyof any] === undefined || null) && (data.columns['isSaleBillCreated' as keyof any] === undefined || null)) {
        if (index < rowIndex && data.columns['batchNo']?.value === selectedBatch?.id) {
          if (data.columns['scheme'] !== '' && data.columns['schemeType'].label === 'Pieces') {
            remainingQty = remainingQty - (Number(data.columns['qty']) + Number(data.columns['scheme']));
          } else {
            remainingQty -= Number(data.columns['qty']);
          }
        }
      }
    });
    remainingQty -= (gridData[rowIndex].columns['schemeType'].label === 'Pieces' ? Number(gridData[rowIndex].columns['scheme']) : 0);
    return remainingQty;
  };

  const handleQtyInput = (rowIndex: number, value: any) => {
    const updatedGridData = [...gridData];
    const batch = batches?.find((batch: any) => batch.id === value?.value);
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

  const handleQtyChange = ({ row, colIndex }: any) => {
    if (controlRoomSettings.stockWarning) {
      let sum = 0;
      const selectedBatch = row.columns['batchNo'];
      const batch = batches?.find((batch: any) => batch.id === selectedBatch?.value);
      for (const data of gridData) {
        if (data.columns['batchNo'].value === selectedBatch?.value) {
          if (data.columns['scheme'] !== '' && data.columns['schemeType'].label === 'Pieces') {
            sum = sum + Number(data.columns['qty']) + Number(data.columns['scheme']);
            if (sum > batch?.currentStock) {
              settingPopupState(false, 'No more available stocks. Please select a smaller quantity or scheme.', () => document.getElementById(`cell-${row.id - 1}-${colIndex === 3 ? 3 : 4}`)?.focus());
              break;
            }
          } else {
            sum += Number(data.columns['qty']);
            if (sum > batch?.currentStock) {
              settingPopupState(false, 'Selected quantity exceeds the available stock. Please select a smaller quantity.', () => document.getElementById(`cell-${row.id - 1}-${2}`)?.focus());
              break;
            }
          }
        }
      }
    }
  };

  const handleDeleteRow = (rowIndex: number) => {
    calculateTotals(gridData.filter((_, ind) => ind !== rowIndex))
  }

  return (
    <div className="">
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
        extraQueryParams={popupList.data.extraQueryParams || {}}
      />}
    </div>
  );

};
