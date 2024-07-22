import React, { useEffect, useState } from 'react';
import { Option } from '../../interface/global';
import { useParams } from 'react-router-dom';
import { sendAPIRequest } from '../../helper/api';
import CustomSelect from '../../components/custom_select/CustomSelect';

interface RowData {
  id: number;
  columns: {
    [key: string]: string;
  };
}

const headersName = [
  'Item name',
  'Batch no',
  'Qty',
  'Scheme',
  'Scheme type',
  'Rate',
  'Dis.%',
  'Amt',
  'MRP',
  'Exp. Date',
  'Tax type',
];
const headers = [
  'itemName',
  'batchNo',
  'qty',
  'scheme',
  'schemeType',
  'rate',
  'disPer',
  'amt',
  'mrp',
  'expDate',
  'taxType',
];

const initialRows: RowData[] = Array.from({ length: 1 }, (_, rowIndex) => ({
  id: rowIndex + 1,
  columns: headers.reduce((acc, header) => ({ ...acc, [header]: '' }), {}),
}));

export const CreateDeliveryChallanTable = ({setDataFromTable}:any) => {
  const { organizationId } = useParams();
  const [gridData, setGridData] = useState<RowData[]>(initialRows);
  const [itemOptions, setItemOptions] = useState<Option[]>([]);
  const [itemValue, setItemValue] = useState<any[]>([]);
  const [batchOptions, setBatchOptions] = useState<Option[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const schemeTypeOptions = [
    { label: 'Pieces', value: 'P' },
    { label: 'Percent', value: '%' },
    { label: 'Rupees', value: 'R' },
    { label: 'Rupees / PC', value: '/' },
  ]

  const fetchItems = async () => {
    const items = await sendAPIRequest<any>(`/${organizationId}/item`);
    // console.log('items:', items);
    setItemValue(items);
    setItemOptions(
      items.map((item: any) => ({
        label: item.name,
        value: item.id,
      }))
    );
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleInputChange = (rowIndex: number, header: string, value: any) => {
    const newGridData = [...gridData];
    if(header === 'itemName'){
        newGridData[rowIndex].columns[header] = value.label;
    } else {
      newGridData[rowIndex].columns[header] = value;
    } 
    setGridData(newGridData);
  };

  const handleSelectChange = (
    selectedOption: Option | any,
    rowIndex: number,
    rowName: string
  ) => {
    if (selectedOption) {
      handleInputChange(
        rowIndex,
        rowName,
        selectedOption ? selectedOption : {}
      );
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const isLastColumn = colIndex === headers.length - 1;
      const isLastRow = rowIndex === gridData.length - 1;

      if (isLastColumn && isLastRow) {
        addRows(1);
        setTimeout(() => focusNextCell(rowIndex + 1, 0), 0);
      } else if (isLastColumn) {
        focusNextCell(rowIndex + 1, 0);
      } else {
        focusNextCell(rowIndex, colIndex + 1);
      }
    }
    if(e.key === 'Escape'){
        e.preventDefault();
        const isLastColumn = colIndex === headers.length - 1;
      const isLastRow = rowIndex === gridData.length - 1;

      if(isLastColumn && isLastRow){
        handleSave();
      }
    }
  };

  const focusNextCell = (rowIndex: number, colIndex: number) => {
    const nextInput = document.querySelector<HTMLInputElement>(
      `#cell-${rowIndex}-${colIndex}`
    );
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
          (acc, header) => ({ ...acc, [header]: '' }),
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

    console.log('Data to send:', dataToSend);
    setDataFromTable(dataToSend);
  };

  const handleBachOptions = (row: any) => {
    // console.log('##### inside handle bacthc option row', row);
    if (row.columns) {
      const itemName = row.columns['itemName'];
    //   console.log('Itemname is ', itemName);
      const selectedItem = itemValue.find(
        (item: any) => item.name === itemName
      );
    //   console.log('selected item ', selectedItem.ItemBatches);
      setBatches(selectedItem.ItemBatches);
      if (selectedItem) {
        // console.log('greid 234234 ---------------_> ', gridData);
        const options = selectedItem.ItemBatches.map((batch: any) => {
          return {
            label: batch.batchNo,
            value: batch.id,
          };
        });
        setBatchOptions(options);
        // }
      } else {
        setBatchOptions([]);
      }
    }
  };

  const handleQtyInput = (row: any, rowIndex: number) => {
    const selectedBatch = row.columns['batchNo'];
    const batch = batches.find(
      (batch: any) => batch.batchNo === selectedBatch.label
    );
    const updatedGridData = [...gridData];
    updatedGridData[rowIndex] = {
      ...updatedGridData[rowIndex],
      columns: {
        ...updatedGridData[rowIndex].columns,
        qty: batch.stock,
      },
    };
    setGridData(updatedGridData);
  };

  const columnWidths = [
    'w-[16.67vw]',
    'w-[15.28vw]',
    'w-[5.56vw]',
    'w-[5.56vw]',
    'w-[11.11vw]',
    'w-[4.44vw]',
    'w-[5.56vw]',
    'w-[4.44vw]',
    'w-[4.44vw]',
    'w-[8.89vw]',
    'w-[13.33vw]',
  ];

  return (
    <div className='flex flex-col border-[1px] border-solid border-gray-400 w-[100%] max-h-[400px] mx-auto overflow-auto'>
      <div className='flex sticky top-0'>
        {headersName.map((header, index) => (
          <div
            key={index}
            className={`flex-shrink-0 border-[1px] border-solid bg-[#009196FF] border-gray-400 p-2 text-center text-white ${columnWidths[index]}`}
          >
            {header}
          </div>
        ))}
      </div>
      {gridData.map((row, rowIndex) => (
        <div key={row.id} className='flex'>
          {headers.map((header, colIndex) =>
            colIndex === 0 ? (
              <div
                className={`flex-shrink-0 h-[3rem] border-[1px] border-solid border-gray-400 rounded-none ${columnWidths[colIndex]}`}
              >
                <CustomSelect
                  isPopupOpen={false}
                  key={colIndex}
                  isSearchable={true}
                  id={`cell-${rowIndex}-${colIndex}`}
                  options={itemOptions}
                  value={
                    itemOptions.find(
                      (option) => option.label === row.columns[header]
                    ) || null
                  }
                  onChange={(selectedOption) =>
                    handleSelectChange(selectedOption, rowIndex, 'itemName')
                  }
                  className={`flex-shrink-0 h-[3rem] border-[1px] border-solid border-gray-400 rounded-none ${columnWidths[colIndex]}`}
                />
              </div>
            ) : colIndex === 1 ? (
              <div
                onFocus={() => handleBachOptions(row)}
                className={`flex-shrink-0 h-[3rem] border-[1px] border-solid border-gray-400 rounded-none ${columnWidths[colIndex]}`}
              >
                <CustomSelect
                  isPopupOpen={false}
                  key={colIndex}
                  isSearchable={true}
                  id={`cell-${rowIndex}-${colIndex}`}
                  options={batchOptions}
                  value={{
                    label: (row.columns['batchNo'] as any).label,
                    value: (row.columns['batchNo'] as any).value,
                  }}
                  onChange={(selectedOption) => {
                    handleSelectChange(selectedOption, rowIndex, 'batchNo');
                    handleQtyInput(row, rowIndex);
                  }}
                  className={`flex-shrink-0 h-[3rem] border-[1px] border-solid border-gray-400 rounded-none ${columnWidths[colIndex]}`}
                />
              </div>
            ) : colIndex === 2 ? (
              <input
                key={colIndex}
                id={`cell-${rowIndex}-${colIndex}`}
                type='text'
                value={row.columns[header]}
                onChange={(e) => {
                  handleInputChange(rowIndex, header, e.target.value);
                }}
                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                className={`flex-shrink-0 p-2 border-[1px] border-solid border-gray-400 ${columnWidths[colIndex]}`}
              />
            ) : colIndex === 4 ? (
              <CustomSelect
                isPopupOpen={false}
                key={colIndex}
                isSearchable={true}
                id={`cell-${rowIndex}-${colIndex}`}
                options={schemeTypeOptions}
                value={{
                  label: (row.columns['schemeType'] as any).value,
                  value: (row.columns['schemeType'] as any).value,
                }}
                onChange={(selectedOption) => {
                  handleSelectChange(selectedOption, rowIndex, 'schemeType');
                }}
                className={`flex-shrink-0 h-[3rem] border-[1px] border-solid border-gray-400 rounded-none ${columnWidths[colIndex]}`}
              />
            ) : (
              <input
                key={colIndex}
                id={`cell-${rowIndex}-${colIndex}`}
                type='text'
                value={row.columns[header]}
                onChange={(e) =>
                  handleInputChange(rowIndex, header, e.target.value)
                }
                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                className={`flex-shrink-0 p-2 border-[1px] border-solid border-gray-400 ${columnWidths[colIndex]}`}
              />
            )
          )}
        </div>
      ))}
      {/* <button onClick={handleSave} className='mt-4 p-2 bg-blue-500 text-white'>
        Save
      </button> */}
    </div>
  );
};
