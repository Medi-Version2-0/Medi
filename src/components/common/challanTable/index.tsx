import React, { useState } from 'react';
import CustomSelect from '../../custom_select/CustomSelect';

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
        options?: { label: string, value: string | number, [key: string]: any }[]
        handleFocus?: (rowIndex: number, colIndex: number) => void;
        handleBlur?: (args: { rowIndex: number, row: any, colIndex: number }) => void;
        handleChange?: (args: { selectedOption?: any, row?: any, rowIndex: number, colIndex?: number, header: string, value?: any }) => void;
    };
}

interface ChallanTableProps {
    headers: HeaderConfig[];
    gridData: any;
    setGridData: (data: any[]) => void;
    handleSave: () => void;
    withAddRow?: ()=> void;
}

export const ChallanTable = ({ headers, gridData, setGridData, handleSave , withAddRow }: ChallanTableProps) => {
    const [focused, setFocused] = useState('');
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
        console.log('calling next foucust')
        const nextInput = document.getElementById(`cell-${rowIndex}-${colIndex}`);
        if (colIndex === 4) {
            setFocused(`cell-${rowIndex}-${colIndex}`);
        }
        if (nextInput) {
            nextInput.focus();
        }
    };

    const addRows = (numRows: number) => {
        if(withAddRow){
            withAddRow()
        }
        const newRows: RowData[] = Array.from(
            { length: numRows },
            (_, rowIndex) => ({
                id: gridData.length + rowIndex + 1,
                columns: headers.reduce(
                    (acc, header) => ({ ...acc, [header.key]: ''}),
                    {}
                ),
            })
        );
        setGridData([...gridData, ...newRows]);
    };

    return (
        <div className="flex flex-col h-[30em] overflow-scroll w-full border-[1px] border-solid border-gray-400">
            <div className="flex sticky border-solid border-[1px] border-blue-800 top-0 w-[100vw]">
                {headers.map((header, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 border-[1px] border-solid bg-[#009196FF] border-gray-400 text-center text-white p-2"
                        style={{ width: header.width }}
                    >
                        {header.name}
                    </div>
                ))}
            </div>
            <div className="flex flex-col h-[22rem] w-[100vw]">
                {gridData.map((row: any, rowIndex: number) => (
                    <div key={row.id} className="flex">
                        {headers.map((header, colIndex) => {
                            const columnValue = header.props.label ? row.columns[header.key]?.label || '' : row.columns[header.key] || '';
                            switch (header.type) {
                                case 'customSelect':
                                    return (
                                        <div key={colIndex} style={{ width: header.width }}>
                                            <CustomSelect
                                                isPopupOpen={false}
                                                isSearchable={true}
                                                id={`cell-${rowIndex}-${colIndex}`}
                                                isFocused={focused === `cell-${rowIndex}-${colIndex}`}
                                                options={header.props.options || [{ label: '', value: '' }]}
                                                value={
                                                    columnValue === ''
                                                        ? null
                                                        : {
                                                            label: header.props.options && header.props.options.find((option) => option.value === columnValue.value)?.label,
                                                            value: columnValue,
                                                        }
                                                }
                                                onChange={(selectedOption) => {
                                                    let args = {
                                                        selectedOption, row, rowIndex, colIndex, header: header.key
                                                    }
                                                    if (header.props.handleChange) {
                                                        header.props.handleChange(args)
                                                    }
                                                }}
                                                containerClass="flex-shrink-0 h-[3em] rounded-none w-fit"
                                                className="rounded-none text-lg w-fit !leading-[2rem]"
                                                onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                                                    if (e.key === 'Enter') {
                                                        const dropdown = document.querySelector('.custom-select__menu');
                                                        if (!dropdown) e.preventDefault();
                                                        document.getElementById(`cell-${rowIndex}-${colIndex + 1}`)?.focus();
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
                                                return header.props.handleFocus ? header.props.handleFocus(rowIndex, colIndex) : () => { }
                                            }}
                                            onChange={(e) => {
                                                let args = {
                                                    rowIndex,
                                                    header: header.key,
                                                    value: e.target.value
                                                }
                                                if (header.props.handleChange) {
                                                    header.props.handleChange(args)
                                                }
                                            }}
                                            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                            className={`flex-shrink-0 border-[1px] p-2 ${header.props.inputType === 'number' && 'text-right'} text-xs border-solid border-gray-400`}
                                            style={{ width: header.width }}
                                            disabled={header.props.disable}
                                            onBlur={() => {
                                                let args = {
                                                    row, rowIndex, colIndex
                                                }
                                                if (header.props.handleBlur) {
                                                    header.props.handleBlur(args)
                                                }
                                            }}
                                        />
                                    );

                                default:
                                    return null;
                            }
                        })}
                    </div>
                ))}
            </div>

            <div className="flex justify-end sticky left-0 mt-[2em]">
                <button
                    type="button"
                    className="px-4 py-2 bg-[#009196FF] hover:bg-[#009196e3] font-medium text-white rounded-md border-none focus:border-yellow-500 focus-visible:border-yellow-500"
                    onClick={handleSave}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
};