import { useEffect, useRef, useState } from 'react';
import { Popup } from '../../popup/Popup';
import NumberInput from "../../common/numberInput/numberInput"
import useApi from '../../../hooks/useApi';
import { SelectListTableProps } from '../../../interface/global';

export const SelectListTableWithInput: React.FC<SelectListTableProps> = ({ heading, headers, tableData, currentStocks, rowDataDuringUpdation, closeList, setGodownDataDuringCreate }) => {
    const tableRefs = useRef<(HTMLTableRowElement | null)[]>([]);
    const { sendAPIRequest } = useApi();
    const [updatedTableData, setUpdatedTableData] = useState<any[]>(tableData);
    const [totalGodownStocks, setTotalGodownStocks] = useState<number>(0);
    const [isValid, setIsValid] = useState<boolean>(true);

    useEffect(() => { document.getElementById(`inputField-0-1`)?.focus() }, [])

    useEffect(() => {
        const totalStocks = updatedTableData.reduce((acc, row) => acc + Number(row?.stocks || 0), 0);
        setTotalGodownStocks(totalStocks);
    }, [updatedTableData])

    const handleInputChange = (rowIndex: number, value: string) => {
        const updatedData = [...updatedTableData];
        updatedData[rowIndex].stocks = value;
        setUpdatedTableData(updatedData);
    };

    const focusNextInput = (nextRowIndex: number, colIndex: number) => {
        document.getElementById(`inputField-${nextRowIndex}-${colIndex}`)?.focus();
    };

    const handleSaveAndClose = async () => {
        if (!!rowDataDuringUpdation) {
            updatedTableData.forEach((rowData) => {
                rowDataDuringUpdation[`opGodown${rowData.godownCode}`] = Number(rowData?.stocks);
                rowDataDuringUpdation[`clGodown${rowData.godownCode}`] = Number(rowData?.stocks);
            });
            const { itemId, id } = rowDataDuringUpdation;
            await sendAPIRequest(`/item/${itemId}/batch/${id}`, { method: 'PUT', body: rowDataDuringUpdation });
        } else {
            setGodownDataDuringCreate(updatedTableData);
        }
        closeList();
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
        if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
            e.preventDefault();
            e.stopPropagation();
            if (rowIndex < updatedTableData.length - 1) {
                focusNextInput(rowIndex + 1, colIndex);
            }
            else {
                if (totalGodownStocks === currentStocks) {
                    setIsValid(true);
                    await handleSaveAndClose();
                }else if (totalGodownStocks < currentStocks){
                    setIsValid(true);
                    const difference = Number(currentStocks) - Number(totalGodownStocks);
                    updatedTableData.map((data: any) => {
                        if(data.godownCode == 0){
                            data.stocks = Number(data.stocks) + Number(difference);
                        }
                    })
                    await handleSaveAndClose();
                } else {
                    setIsValid(false);
                    return;
                }
            }
        } else if (e.shiftKey && e.key === 'Tab') {
            e.preventDefault();
            e.stopPropagation();
            if (rowIndex > 0) focusNextInput(rowIndex - 1, colIndex);
            else focusNextInput(updatedTableData.length - 1, colIndex);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            closeList();
        }
    };

    return (
        <Popup heading={`${heading}`} isSuggestionPopup={true} id='dropDownPopup' onClose={closeList} childClass='h-fit w-full min-w-[50vw] !max-h-[100vh] overflow-scroll'>
            <div className="w-full relative">
                <div id='selectListData' className='mx-4 h-[60vh] overflow-auto border-[1px] border-gray-400 border-solid my-4 outline-none flex justify-between flex-col'>
                    <table className='table-auto w-full border-collapse'>
                        <thead className='sticky top-0'>
                            <tr>
                                {headers.map((header: any, index: number) => (
                                    <th key={index} className='w-1/2 bg-[#009196FF] text-center text-white p-2'>
                                        {header.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {updatedTableData.map((row: any, rowIndex: number) => (
                                <tr key={rowIndex} id={`row-${rowIndex}`} ref={(el) => (tableRefs.current[rowIndex] = el)} tabIndex={-1}>
                                    {headers.map((header: any, colIndex: number) => (
                                        <td key={colIndex} className={`border-[1px] border-gray-400 px-4 py-2`}>
                                            {header.isInput ? (
                                                <NumberInput
                                                    id={`inputField-${rowIndex}-${colIndex}`}
                                                    name={header.key}
                                                    value={row[header.key]}
                                                    inputClassName='px-2 py-[0.1rem]'
                                                    onChange={(value: any) => handleInputChange(rowIndex, value)}
                                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, rowIndex, colIndex)}
                                                />
                                            ) : header.auto ? (rowIndex + 1) : (row[header.key]
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>

                    </table>
                    <div className="w-full">
                        {!isValid && (
                            <div className="w-full p-4 bg-white text-red-400 font-semibold text-center">Warning : Total stocks Exceeds the Current stocks</div>
                        )}
                        <div className="w-full bg-gray-50 flex justify-between items-center text-center p-4 border-t border-gray-300">
                            <div className="w-1/2 border-r border-gray-300 flex items-center justify-center space-x-4">
                                <span className="text-gray-700 font-semibold">
                                    Current Stocks:
                                </span>
                                <span className="text-gray-600 font-medium">
                                    {currentStocks || 0}
                                </span>
                            </div>
                            <div className="w-1/2 flex items-center justify-center space-x-4">
                                <span className="text-gray-700 font-semibold">
                                    Total:
                                </span>
                                <span className="text-gray-600 font-medium">
                                    {totalGodownStocks || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Popup>
    );
};
