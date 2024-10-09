import React, { useEffect, useRef, useState } from 'react';
import CustomSelect from '../../custom_select/CustomSelect';
import { dateSchema } from '../../../views/DeliveryChallan/validation_schema';
import Confirm_Alert_Popup from '../../popup/Confirm_Alert_Popup';
import { BsTrash } from 'react-icons/bs';
import NumberInput from '../numberInput/numberInput';
import { TabManager } from '../../class/tabManager';

interface RowData {
  id: number;
  columns: {
    [key: string]: string | number | any;
  };
}

interface HeaderConfig {
  name: string;
  key: string;
  width: string;
  type: string;
  props: {
    inputType?: string;
    label?: boolean;
    disable?: boolean;
    required?: boolean;
    allowDecimal?: boolean;
    options?: { label: string; value: string | number; [key: string]: any }[];
    handleFocus?: (rowIndex: number, colIndex: number) => void;
    handleClick?: (args: {rowIndex: number, colIndex: number}) => void;
    handleBlur?: (args: {
      rowIndex: number;
      row: any;
      colIndex: number;
    }) => void;
    handleChange?: (args: {
      selectedOption?: any;
      row?: any;
      rowIndex: number;
      colIndex?: number;
      header: string;
      value?: any;
    }) => void;
  };
}

interface ChallanTableProps {
  headers: HeaderConfig[];
  gridData: any;
  setGridData: (data: any[]) => void;
  handleSave?: any;
  withAddRow?: () => void;
  rowDeleteCallback?: (rowIndex: number, data: any) => void;
  newRowTrigger: number;
  skipIndexes?: number[];
  stikyColumn?: number[];
  isFromSaleBill?: boolean;
  required?: any;
  widthRequired?: any;
  f9Function?: (args: {rowIndex: number, colIndex: number}) => void;
}
export const ChallanTable = ({
  headers,
  gridData,
  setGridData,
  handleSave,
  withAddRow,
  rowDeleteCallback,
  newRowTrigger,
  skipIndexes,
  stikyColumn,
  widthRequired = '100vw',
  f9Function
}: ChallanTableProps) => {
  const [focused, setFocused] = useState('');
  const tabManager = TabManager.getInstance()
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement> | any,
    rowIndex: number,
    colIndex: number
  ) => {
    const indexInput = headers[colIndex]
    if (indexInput.key === 'debitOrCredit' && e.key === "Backspace" && e.target && e.target.value) {
      e.target.value = ''
    }

    if (e.key === '-' || e.key === '+' ) {   // || e.key === 'E' || e.key === 'e'
      e.preventDefault();
      return;
    }
    if (e.key === 'F9' && f9Function) {   // || e.key === 'E' || e.key === 'e'
      e.preventDefault();
      f9Function({rowIndex, colIndex})
    }
    if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
      if(e.key === 'Enter'){
        e.preventDefault()
        const header = headers[colIndex];
        const handelClick = header?.props?.handleClick;
        if (typeof handelClick === 'function') {
            return handelClick({ rowIndex, colIndex });
        }
      }
      const shouldAddRow = colIndex === newRowTrigger;
      const isLastRow = rowIndex === gridData.length - 1;
      const isLastColumn = colIndex === headers.length - 1;

      const header = headers[colIndex];
      const cellValue = gridData[rowIndex].columns[header.key];

      if (header.props?.required && !cellValue) {
        setPopupState({
          ...popupState,
          isAlertOpen: true,
          message: `The ${header.name} field is required.`,
        });
        return;
      }

      if (e.key === 'Tab') {
        if (isLastRow && isLastColumn) {
          return;
        }
      } else {
        if (shouldAddRow && isLastRow) {
          addRows(1);
          setTimeout(() => focusNextCell(rowIndex + 1, 0), 0);
        } else if (shouldAddRow) {
          focusNextCell(rowIndex + 1, 0);
        } else {
          if (!skipIndexes && colIndex === 6) {
            focusNextCell(rowIndex, colIndex + 2);
          } else {
            focusNextCell(rowIndex, colIndex + 1);
          }
        }
        
      }
    }
    else if (e.key === 'Escape') {
      e.preventDefault();
     if(handleSave){
      handleSave();
     }
      document.getElementById('nextButton')?.focus();
  }
  };

  const focusNextCell = async (rowIndex: number, colIndex: number) => {
    if (skipIndexes?.includes(colIndex)) {
      focusNextCell(rowIndex, colIndex + 1);
      return;
    }
    const nextInput = document.getElementById(`cell-${rowIndex}-${colIndex}`);
    if (colIndex === 4) {
      setFocused(`cell-${rowIndex}-${colIndex}`);
    }
    if (nextInput) {
      nextInput.focus();
    }
  };

  const addRows = async (numRows: number) => {
    try {
      await dateSchema.validate(gridData[gridData.length - 1].columns.expDate);
      if (withAddRow) {
        withAddRow();
      }
      const newRows: RowData[] = Array.from(
        { length: numRows },
        (_, rowIndex) => ({
          id: gridData.length + rowIndex + 1,
          columns: headers.reduce(
            (acc, header) => ({ ...acc, [header.key]: header.props?.inputType === 'number' ? null : '' }),
            {}
          ),
        })
      );
      setGridData([...gridData, ...newRows]);
    } catch (e: any) {
      setPopupState({
        ...popupState,
        isAlertOpen: true,
        message: e.message,
      });
    }
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };
  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
  };
  const deleteRow = (rowIndex: number, row: any) => {
    const updatedGridData = gridData.filter(
      (_: any, index: number) => index !== rowIndex
    );
    setGridData(updatedGridData);
    if(rowIndex) {
      document.getElementById(`cell-${rowIndex-1}-${newRowTrigger}`)?.focus()
    }
    else{
      document.getElementById(`cell-0-0`)?.focus()
    }
    if (rowDeleteCallback) {
      rowDeleteCallback(rowIndex, row);
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      <div
        id='tableContainer'
        className={`flex flex-col h-[30em] border-[1px] border-solid border-gray-400 overflow-auto`}
      >
        <div className={`flex sticky border-solid w-[${widthRequired}] top-0 z-[1]`}>
        <div
            className={`flex-shrink-0 border-[1px] border-solid bg-[#009196FF] border-gray-400 text-center text-white p-2 w-16`}
          >
            Sr.No
          </div>
          {headers.map((header, index) => (
            <div
              key={index}
              className={`flex-shrink-0 border-[1px] border-solid bg-[#009196FF] border-gray-400 text-left text-white p-2 ${stikyColumn?.includes(index) ? 'sticky left-0' : ''}`}
              style={{ width: header.width }}
            >
              {header.name}
            </div>
          ))}
          <div
            className={`flex-shrink-0 border-[1px] border-solid bg-[#009196FF] border-gray-400 text-center text-white p-2 w-24`}
          >
            Actions
          </div>
        </div>
        <div className={`flex flex-col w-[${widthRequired}] h-[22rem]`}>
          {gridData &&
            gridData.map((row: any, rowIndex: number) => (
              <div key={row.id} className='flex relative'>
                <div className='border-[1px] border-solid border-gray-400 px-2 flex flex-shrink-0 items-center w-16'>
                 {rowIndex + 1}
                </div>
                {headers.map((header, colIndex) => {
                  const columnValue = header.props.label
                    ? row.columns[header.key]?.label || ''
                    : row.columns[header.key];
                  switch (header.type) {
                    case 'customSelect':
                      return (
                        <div
                          key={colIndex}
                          style={{ minWidth: header.width }}
                          className={`${stikyColumn?.includes(colIndex) ? 'sticky left-0 z-[1]' : 'z-[0]'}`}
                        >
                          <CustomSelect
                            isPopupOpen={false}
                            isSearchable={true}
                            disableArrow={false}
                            id={`cell-${rowIndex}-${colIndex}`}
                            isFocused={
                              focused === `cell-${rowIndex}-${colIndex}`
                            }
                            options={
                              header.props.options || [{ label: '', value: '' }]
                            }
                            value={
                              columnValue === ''
                                ? null
                                : {
                                    label:
                                      header.props.options &&
                                      header.props.options.find(
                                        (option) =>
                                          option.value === columnValue.value
                                      )?.label,
                                    value: columnValue,
                                  }
                            }
                            onChange={(selectedOption) => {
                              const args = {selectedOption,row,rowIndex,colIndex,header: header.key,setFocused};
                              if (header.props.handleChange) {
                                header.props.handleChange(args);
                              }
                            }}
                            onBlur={() => {
                              const args = {row,rowIndex,colIndex,setFocused};
                              if (header.props.handleBlur) {
                                header.props.handleBlur(args);
                              }
                            }}
                            containerClass='flex-shrink-0 h-[3em] rounded-none w-fit'
                            className='rounded-none text-lg w-fit !leading-[2rem]'
                            onKeyDown={(
                              e: React.KeyboardEvent<HTMLSelectElement>
                            ) => {
                              if (e.key === 'Enter') {
                                const dropdown = document.querySelector(
                                  '.custom-select__menu'
                                );
                                if (!dropdown) {
                                  e.preventDefault();
                                  document
                                    .getElementById(
                                      `cell-${rowIndex}-${colIndex + 1}`
                                    )
                                    ?.focus();
                                }
                              }
                            }}
                          />
                        </div>
                      );

                    case 'input':
                      return header.props.inputType === 'number' ? (
                        <div style={{ minWidth: header.width }}>
                          <NumberInput
                            name={`cell-${rowIndex}-${colIndex}`}
                            allowDecimal={header.props.allowDecimal !== undefined ? header.props.allowDecimal : true}
                            key={colIndex}
                            id={`cell-${rowIndex}-${colIndex}`}
                            value={columnValue}
                            onFocus={() => {
                              return header.props.handleFocus
                                ? header.props.handleFocus(rowIndex, colIndex)
                                : () => { };
                            }}
                            onChange={(value) => {
                              const args = {
                                rowIndex,
                                header: header.key,
                                value: value === '' ? null : value,
                              };
                              if (header.props.handleChange) {
                                header.props.handleChange(args);
                              }
                            }}
                            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                            className={`flex-shrink-0 text-xs ${stikyColumn?.includes(colIndex) ? 'sticky left-0 z-[1]' : 'z-[0]'
                              }`}
                            inputClassName={`p-2`}
                            isDisabled={header.props.disable}
                            onBlur={() => {
                              const args = { row, rowIndex, colIndex, setFocused };
                              if (header.props.handleBlur) {
                                header.props.handleBlur(args);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <input
                          key={colIndex}
                          id={`cell-${rowIndex}-${colIndex}`}
                          value={columnValue}
                          type={header.props.inputType || 'text'}
                          autoComplete='off'
                          onFocus={() => {
                            tabManager.setLastFocusedElementId(`cell-${rowIndex}-${colIndex}`)

                            return header.props.handleFocus
                              ? header.props.handleFocus(rowIndex, colIndex)
                              : () => { };
                          }}
                          onChange={(e) => {
                            const args = {
                              rowIndex,
                              header: header.key,
                              value: e.target.value,
                            };
                            if (header.props.handleChange) {
                              header.props.handleChange(args);
                            }
                          }}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                          className={`flex-shrink-0 border-[1px] p-2 text-xs border-solid border-gray-400 ${stikyColumn?.includes(colIndex) ? 'sticky left-0 z-[1]' : 'z-[0]'
                            }`}
                          style={{ width: header.width }}
                          disabled={header.props.disable}
                          onBlur={() => {
                            const args = { row, rowIndex, colIndex, setFocused };
                            if (header.props.handleBlur) {
                              header.props.handleBlur(args);
                            }
                          }}
                          onClick={()=>{
                            if(header.props.handleClick){
                              header.props.handleClick({rowIndex , colIndex})
                            }
                          }}
                        />
                      );

                    default:
                      return null;
                  }
                })}
                <div className='border-[1px] border-solid border-gray-400 min-w-24 flex items-center'>
                  {
                    <BsTrash
                      className='text-xl cursor-pointer w-full'
                      onClick={() => {
                        deleteRow(rowIndex, row);
                      }}
                    />
                  }
                </div>
              </div>
            ))}
        </div>
      </div>

        {popupState.isAlertOpen && (
          <Confirm_Alert_Popup
            id='challanTableAlert'
            onClose={handleClosePopup}
            onConfirm={handleAlertCloseModal}
            message={popupState.message}
            isAlert={popupState.isAlertOpen}
          />
        )}
      </div>
  );
};
