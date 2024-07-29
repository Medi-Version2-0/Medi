import React, { useEffect, useState } from 'react';
import { Option } from '../../interface/global';
import { useParams } from 'react-router-dom';
import { sendAPIRequest } from '../../helper/api';
import CustomSelect from '../../components/custom_select/CustomSelect';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';

interface RowData {
  id: number;
  columns: {
    [key: string]: string | number | any;
  };
}

const headers = [
  { name: 'Item name', key: 'itemId', width: 'w-[15%]' },
  { name: 'Batch no', key: 'batchNo', width: 'w-[15%]' },
  { name: 'Qty', key: 'qty', width: 'w-[5%]' },
  { name: 'Scheme', key: 'scheme', width: 'w-[7%]' },
  { name: 'Scheme type', key: 'schemeType', width: 'w-[10%]' },
  { name: 'Rate', key: 'rate', width: 'w-[5%]' },
  { name: 'Dis.%', key: 'disPer', width: 'w-[5%]' },
  { name: 'Amt', key: 'amt', width: 'w-[5%]' },
  { name: 'MRP', key: 'mrp', width: 'w-[5%]' },
  { name: 'Exp. Date', key: 'expDate', width: 'w-[8%]' },
  { name: 'Tax type', key: 'taxType', width: 'w-[15%]' },
  { name: 'GST', key: 'gstAmount', width: 'w-[5%]' },
];

const schemeTypeOptions = [
  { label: 'Pieces', value: 'P' },
  { label: 'Percent', value: '%' },
  { label: 'Rupees', value: 'R' },
  { label: 'Rupees / PC', value: '/' },
];

export const CreateDeliveryChallanTable = ({
  setDataFromTable,
  setTotalAmt,
  setTotalQty,
  challanTableData,
}: any) => {
  const initialRows: RowData[] = Array.from({ length: 1 }, (_, rowIndex) => ({
    id: rowIndex + 1,
    columns: headers.reduce(
      (acc, header) => ({ ...acc, [header.key]: '' }),
      {}
    ),
  }));
  const { organizationId } = useParams();
  const [gridData, setGridData] = useState<RowData[]>(initialRows);
  const [itemOptions, setItemOptions] = useState<Option[]>([]);
  const [itemValue, setItemValue] = useState<any[]>([]);
  const [batchOptions, setBatchOptions] = useState<Option[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [focused, setFocused] = useState('');
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });

  useEffect(() => {
    fetchItems();
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
                  label: itemValue.find((x) => x.id === rowData[header.key])
                    ?.name,
                  value: rowData[header.key],
                };
              } else if (header.key === 'batchNo') {
                data = {
                  label: (
                    itemValue.find((x) => x.id === rowData['itemId'])
                      ?.ItemBatches || []
                  ).find((x: any) => x.id === rowData[header.key])?.batchNo,
                  value: rowData[header.key],
                };
              } else if (header.key === 'schemeType') {
                data = {
                  label: schemeTypeOptions.find(
                    (x) => x.value === rowData[header.key]
                  )?.label,
                  value: rowData[header.key],
                };
              }
              return {
                ...acc,
                [header.key]: data,
              };
            }, {}),
          };
          handleBatchOptions(obj);
          return obj;
        }
      );
      setGridData(initialRows);
    }
  }, [challanTableData, itemValue]);

  const fetchItems = async () => {
    const items = await sendAPIRequest<any>(`/${organizationId}/item`);
    setItemValue(items);
    setItemOptions(
      items.map((item: any) => ({
        label: item.name,
        value: item.id,
      }))
    );
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

  const handleInputChange = async (
    rowIndex: number,
    header: string,
    value: any
  ) => {
    const newGridData = [...gridData];
    newGridData[rowIndex].columns[header] = value;
    if (header === 'itemId') await updateTaxAndGst(rowIndex, value);
    setGridData(newGridData);
  };

  const updateTaxAndGst = async (rowIndex: number, value: any) => {
    const newGridData = [...gridData];
    const company = await sendAPIRequest<any[]>(`/${organizationId}/company`);
    const selectedItem = value.label;
    const item = itemValue.find((item: any) => item.name === selectedItem);
    const spData = await getSalesPurchaseData();
    const salesPurchaseSelected = spData.find(
      (data: any) => data.sp_id === item.saleAccId
    );
    const taxTypeInitial = salesPurchaseSelected?.sptype;
    const isStateInOut = company.find(
      (comp: any) => comp.company_id === item.compId
    )?.stateInOut;
    newGridData[rowIndex].columns = {
      ...newGridData[rowIndex].columns,
      taxType: taxTypeInitial,
      gstAmount:
        isStateInOut === 'Within State'
          ? Number(salesPurchaseSelected.cgst) +
            Number(salesPurchaseSelected.sgst)
          : isStateInOut === 'Out Of State'
            ? Number(salesPurchaseSelected.igst)
            : 0,
    };
    setGridData(newGridData);
  };

  const handleSelectChange = (
    selectedOption: Option | any,
    rowIndex: number,
    rowName: string
  ) => {
    if (selectedOption)
      handleInputChange(rowIndex, rowName, selectedOption || {});
  };

  const handleTotalAmt = (rowIndex: number) => {
    const newGridData = [...gridData];
    const { qty, scheme, schemeType, rate } = newGridData[rowIndex].columns;
    let total = rate * qty;
    if (schemeType.value === '%') total -= (total * scheme) / 100;
    else if (schemeType.value === 'R') total -= scheme;
    else if (schemeType.value === '/') total -= qty * scheme;
    // total -= (total * disPer) / 100;
    newGridData[rowIndex].columns.amt = total;
    total = parseFloat(total.toFixed(2));
    
    const totalAmt = newGridData.reduce(
      (acc, data) => acc + data.columns.amt + (data.columns.amt * data.columns.gstAmount)/100,
      0
    );
    const totalQty = newGridData.reduce(
      (acc, data) => acc + Number(data.columns.qty) + (data.columns.scheme !== '' && data.columns.schemeType.label === 'Pieces' ? Number(data.columns.scheme) : 0),
      0
    );
    setGridData(newGridData);
    setTotalAmt(totalAmt);
    setTotalQty(totalQty);
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const isThirdLastColumn = colIndex === headers.length - 3;
      const isLastRow = rowIndex === gridData.length - 1;

      if (isThirdLastColumn && isLastRow) {
        addRows(1);
        setTimeout(() => focusNextCell(rowIndex + 1, 0), 0);
      } else if (isThirdLastColumn) {
        focusNextCell(rowIndex + 1, 0);
      } else {
        if (colIndex === 6) {
          focusNextCell(rowIndex, colIndex + 2);
        } else {
          focusNextCell(rowIndex, colIndex + 1);
        }
      }
    }
  };

  const focusNextCell = async (rowIndex: number, colIndex: number) => {
    const nextInput = document.getElementById(`cell-${rowIndex}-${colIndex}`);
    if(colIndex === 0 || colIndex === 4){
      setFocused(`cell-${rowIndex}-${colIndex}`)
    }
    if (nextInput) {
      nextInput.focus();
    }
  };

  const addRows = (numRows: number) => {
    const newRows: RowData[] = Array.from(
      { length: numRows },
      (_, rowIndex) => ({
        id: gridData.length + rowIndex + 1,
        columns: headers.reduce(
          (acc, header) => ({ ...acc, [header.key]: '' }),
          {}
        ),
      })
    );
    setGridData([...gridData, ...newRows]);
  };

  const handleSave = () => {
    const dataToSend = gridData.map((row) => ({
      id: row.id,
      ...row.columns,
    }));

    setDataFromTable(dataToSend);
    setPopupState({
      ...popupState,
      isAlertOpen: true,
      message: 'Table Data saved successfully.',
    });
  };

  const handleBatchOptions = (row: any) => {
    const selectedItem = itemValue.find(
      (item: any) => item.name === row.columns['itemId'].label
    );
    if (selectedItem) {
      setBatches(selectedItem.ItemBatches);
      setBatchOptions(
        selectedItem.ItemBatches.map((batch: any) => ({
          label: batch.batchNo,
          value: batch.id,
        }))
      );
    } else {
      setBatchOptions([]);
    }
  };

  const handleRemainingQty = (rowIndex: number, selectedBatch: any) => {
    let remainingQty = selectedBatch?.currentStock;
    gridData.forEach((data: any, index: number) => {
      if (
        data.columns['batchNo'].label === selectedBatch.batchNo &&
        index < rowIndex
      ) {
        if(data.columns['scheme'] !== '' && data.columns['schemeType'].label === 'Pieces'){
          remainingQty = remainingQty - (Number(data.columns['qty']) + Number(data.columns['scheme']));
        }else{
          remainingQty -= (Number(data.columns['qty']));
        }
      }
    });
    return remainingQty;
  };

  const handleQtyInput = (row: any, rowIndex: number, header: string) => {
    const updatedGridData = [...gridData];
    if (header === 'batchNo') {
      const selectedBatch = row.columns[header];
      const batch = batches?.find(
        (batch: any) => batch.batchNo === selectedBatch.label
      );
      if (rowIndex) {
        const remainingQty = handleRemainingQty(rowIndex, batch);
        updatedGridData[rowIndex].columns.qty = remainingQty;
      } else {
        updatedGridData[rowIndex].columns.qty = batch.currentStock;
      }
      updatedGridData[rowIndex].columns.rate = batch.salePrice;
      updatedGridData[rowIndex].columns.mrp = batch.mrp;
      updatedGridData[rowIndex].columns.expDate = batch.expiryDate;
    }
    setGridData(updatedGridData);
  };

  const handleQtyChange = (row: any, rowIndex: number, colIndex: number) => {
    let sum = 0;
    const selectedBatch = row.columns['batchNo'];
    const batch = batches?.find(
      (batch: any) => batch.batchNo === selectedBatch?.label
    );
    for (const data of gridData) {
      if (data.columns['batchNo'].label === selectedBatch?.label) {
        if(data.columns['scheme'] !== '' && data.columns['schemeType'].label === 'Pieces'){
          sum = sum + Number(data.columns['qty']) + Number(data.columns['scheme']);    
          if (sum > batch?.currentStock) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message:
                'No more available stocks. Please select a smaller quantity or scheme.',
            });
              focusNextCell(rowIndex, colIndex);
            break;
          }      
        }else{
          sum += Number(data.columns['qty']);
          if (sum > batch?.currentStock) {
            setPopupState({
              ...popupState,
              isAlertOpen: true,
              message:
                'Selected quantity exceeds the available stock. Please select a smaller quantity.',
            });
            focusNextCell(rowIndex, colIndex);
            break;
          }
        }
        
      }
    }
  };

  return (
    <div className={`flex flex-col h-[30em] overflow-scroll`}>
      <div className='flex sticky border-solid border-[1px] border-blue-800 top-0 overflow-scroll'>
        {headers.map((header, index) => (
          <div
            key={index}
            className={`flex-shrink-0 border-[1px] border-solid bg-[#009196FF] border-gray-400 text-center text-white p-2 ${header.width}`}
          >
            {header.name}
          </div>
        ))}
      </div>
      <div className='flex flex-col h-[22em] border-[1px] border-solid border-gray-400 overflow-auto'>
        {gridData.map((row, rowIndex) => {
          return (
            <div key={row.id} className='flex'>
              {headers.map((header, colIndex) => {
                return colIndex === 0 ? (
                  <span className={`h-fit ${header.width}`}>
                    <CustomSelect
                      isPopupOpen={false}
                      key={colIndex}
                      isSearchable={true}
                      id={`cell-${rowIndex}-${colIndex}`}
                      isFocused={focused === `cell-${rowIndex}-${colIndex}`}
                      options={itemOptions}
                      value={
                        row.columns[header.key] === ''
                          ? null
                          : {
                              label: itemOptions.find(
                                (option) =>
                                  option.value === row.columns[header.key].value
                              )?.label,
                              value: row.columns[header.key],
                            }
                      }
                      onChange={(selectedOption) => {
                        handleSelectChange(selectedOption, rowIndex, 'itemId');
                        handleBatchOptions(row);
                      }}
                      containerClass={`flex-shrink-0 h-[3em] rounded-none w-fit`}
                      className={`rounded-none text-lg w-fit h-[3em]`}
                      onBlur={() => {
                        setFocused('');
                      }}
                      onKeyDown={(
                        e: React.KeyboardEvent<HTMLSelectElement>
                      ) => {
                        if (e.key === 'Enter') {
                          const dropdown = document.querySelector(
                            '.custom-select__menu'
                          );
                          if (!dropdown) {
                            e.preventDefault();
                          }
                          setFocused(`cell-${rowIndex}-${colIndex + 1}`);
                        }
                      }}
                    />
                  </span>
                ) : colIndex === 1 ? (
                  <span
                    onFocus={() => handleBatchOptions(row)}
                    className={`h-fit ${header.width}`}
                  >
                    <CustomSelect
                      isPopupOpen={false}
                      key={colIndex}
                      isSearchable={true}
                      isFocused={focused === `cell-${rowIndex}-${colIndex}`}
                      id={`cell-${rowIndex}-${colIndex}`}
                      options={batchOptions}
                      value={
                        row.columns[header.key] === ''
                          ? null
                          : {
                              label: (
                                itemValue.find(
                                  (x) => x.id === row.columns['itemId'].value
                                )?.ItemBatches || []
                              ).find(
                                (x: any) =>
                                  x.id === row.columns[header.key].value
                              )?.batchNo,
                              value: row.columns[header.key],
                            }
                      }
                      onChange={(selectedOption) => {
                        handleSelectChange(selectedOption, rowIndex, 'batchNo');
                        handleQtyInput(row, rowIndex, 'batchNo');
                      }}
                      containerClass={`flex-shrink-0 h-[3em]  rounded-none w-fit`}
                      className={`rounded-none text-lg w-fit h-[3em]`}
                      onKeyDown={(
                        e: React.KeyboardEvent<HTMLSelectElement>
                      ) => {
                        if (e.key === 'Enter') {
                          const dropdown = document.querySelector(
                            '.custom-select__menu'
                          );
                          if (!dropdown) {
                            e.preventDefault();
                          }
                          document
                            .getElementById(`cell-${rowIndex}-${colIndex + 1}`)
                            ?.focus();
                        }
                      }}
                    />
                  </span>
                ) : colIndex === 2 || colIndex === 3 ? (
                  <input
                    key={colIndex}
                    id={`cell-${rowIndex}-${colIndex}`}
                    type='text'
                    value={row.columns[header.key]}
                    onChange={(e) => {
                      handleInputChange(rowIndex, header.key, e.target.value);
                      handleTotalAmt(rowIndex);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    className={`flex-shrink-0  border-[1px] p-2 text-xs border-solid border-gray-400 ${header.width}`}
                    onBlur={() => {
                      handleQtyChange(row, rowIndex, colIndex);
                      handleTotalAmt(rowIndex);
                    }}
                  />
                ) : colIndex === 4 ? (
                  <span
                    onFocus={() => handleBatchOptions(row)}
                    className={`h-fit ${header.width}`}
                  >
                    <CustomSelect
                      isPopupOpen={false}
                      key={colIndex}
                      isSearchable={true}
                      id={`cell-${rowIndex}-${colIndex}`}
                      isFocused={focused === `cell-${rowIndex}-${colIndex}`}
                      options={schemeTypeOptions}
                      value={
                        row.columns[header.key] === ''
                          ? null
                          : {
                              label: schemeTypeOptions.find(
                                (option) =>
                                  option.value === row.columns[header.key].value
                              )?.label,
                              value: row.columns[header.key],
                            }
                      }
                      onChange={(selectedOption) => {
                        handleSelectChange(
                          selectedOption,
                          rowIndex,
                          'schemeType'
                        );
                        handleQtyChange(row, rowIndex, colIndex);
                        handleTotalAmt(rowIndex);
                      }}
                      containerClass={`flex-shrink-0 h-[3em] rounded-none w-fit`}
                      className={`rounded-none text-lg w-fit h-[3em]`}
                      onKeyDown={(
                        e: React.KeyboardEvent<HTMLSelectElement>
                      ) => {
                        if (e.key === 'Enter') {
                          const dropdown = document.querySelector(
                            '.custom-select__menu'
                          );
                          if (!dropdown) {
                            e.preventDefault();
                          }
                          document
                            .getElementById(`cell-${rowIndex}-${colIndex + 1}`)
                            ?.focus();
                        }
                      }}
                    />
                  </span>
                ) : (
                  <input
                    key={colIndex}
                    id={`cell-${rowIndex}-${colIndex}`}
                    type='text'
                    value={row.columns[header.key]}
                    onChange={(e) => {
                      handleInputChange(rowIndex, header.key, e.target.value);
                      handleTotalAmt(rowIndex);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    className={`flex-shrink-0 border-[1px] p-2 text-xs  border-solid border-gray-400 ${header.width}`}
                    disabled={
                      colIndex === 11 || colIndex === 10 || colIndex === 7
                        ? true
                        : false
                    }
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      <div className='flex justify-end mt-[2em]'>
        <button
          type='button'
          className='px-4 py-2 bg-[#009196FF] hover:bg-[#009196e3] font-medium text-white rounded-md border-none focus:border-yellow-500 focus-visible:border-yellow-500'
          onClick={handleSave}
        >
          Confirm
        </button>
      </div>
      {popupState.isAlertOpen && (
        <Confirm_Alert_Popup
          onClose={handleClosePopup}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
    </div>
  );
};
