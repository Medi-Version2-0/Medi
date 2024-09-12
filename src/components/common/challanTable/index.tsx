import React, { useEffect, useRef, useState } from 'react';
import CustomSelect from '../../custom_select/CustomSelect';
import { dateSchema } from '../../../views/DeliveryChallan/validation_schema';
import Confirm_Alert_Popup from '../../popup/Confirm_Alert_Popup';
import { BsTrash } from 'react-icons/bs';

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
    options?: { label: string; value: string | number; [key: string]: any }[];
    handleFocus?: (rowIndex: number, colIndex: number) => void;
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
  handleSave?: () => void;
  withAddRow?: () => void;
  rowDeleteCallback?: (rowIndex: number, data: any) => void;
  newRowTrigger: number;
  skipIndexes?: number[];
  stikyColumn?: number[];
  required?: any;
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
  required,
}: ChallanTableProps) => {
  const [focused, setFocused] = useState('');
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

    if (e.key === '-' || e.key === '+' || e.key === 'E' || e.key === 'e') {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
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
            (acc, header) => ({ ...acc, [header.key]: '' }),
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
    if (rowDeleteCallback) {
      rowDeleteCallback(rowIndex, row);
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      <div
        id='tableContainer'
        className='flex flex-col h-[30em] overflow-auto border-[1px] border-solid border-gray-400'
      >
        <div className={`flex sticky border-solid w-[100vw] top-0 z-[1]`}>
          {headers.map((header, index) => (
            <div
              key={index}
              className={`flex-shrink-0 border-[1px] border-solid bg-[#009196FF] border-gray-400 text-center text-white p-2 ${stikyColumn?.includes(index) ? 'sticky left-0' : ''}`}
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
        <div className='flex flex-col w-[100vw] h-[22rem]'>
          {gridData &&
            gridData.map((row: any, rowIndex: number) => (
              <div key={row.id} className='flex relative'>
                {headers.map((header, colIndex) => {
                  const columnValue = header.props.label
                    ? row.columns[header.key]?.label || ''
                    : row.columns[header.key] || '';
                  switch (header.type) {
                    case 'customSelect':
                      return (
                        <div
                          key={colIndex}
                          style={{ minWidth: header.width }}
                          className={`${stikyColumn?.includes(colIndex) ? 'sticky left-0' : ''}`}
                        >
                          <CustomSelect
                            isPopupOpen={false}
                            isSearchable={true}
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
                              const args = {
                                selectedOption,
                                row,
                                rowIndex,
                                colIndex,
                                header: header.key,
                              };
                              if (header.props.handleChange) {
                                header.props.handleChange(args);
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
                                if (!dropdown) e.preventDefault();
                                document
                                  .getElementById(
                                    `cell-${rowIndex}-${colIndex + 1}`
                                  )
                                  ?.focus();
                              }
                            }}
                          />
                        </div>
                      );

                    case 'input':
                      return (
                        <input
                          key={colIndex}
                          id={`cell-${rowIndex}-${colIndex}`}
                          type={header.props.inputType}
                          value={columnValue}
                          onFocus={() => {
                            return header.props.handleFocus
                              ? header.props.handleFocus(rowIndex, colIndex)
                              : () => {};
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
                          onKeyDown={(e) =>
                            handleKeyDown(e, rowIndex, colIndex)
                          }
                          className={`flex-shrink-0 border-[1px] p-2 ${header.props.inputType === 'number' && 'text-right'} text-xs border-solid border-gray-400 ${stikyColumn?.includes(colIndex) ? 'sticky left-0' : ''}`}
                          style={{ width: header.width }}
                          disabled={header.props.disable}
                          onBlur={() => {
                            const args = {
                              row,
                              rowIndex,
                              colIndex,
                            };
                            if (header.props.handleBlur) {
                              header.props.handleBlur(args);
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

        {popupState.isAlertOpen && (
          <Confirm_Alert_Popup
            onClose={handleClosePopup}
            onConfirm={handleAlertCloseModal}
            message={popupState.message}
            isAlert={popupState.isAlertOpen}
          />
        )}
      </div>
      {handleSave && (
        <div className='flex justify-end'>
          <button
            type='button'
            className='px-4 py-2 bg-[#009196FF] hover:bg-[#009196e3] font-medium text-white rounded-md border-none focus:border-yellow-500 focus-visible:border-yellow-500'
            onClick={handleSave}
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
};
