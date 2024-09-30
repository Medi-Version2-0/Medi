import { useEffect, useRef, useState, useMemo } from 'react';
import { Popup } from '../../popup/Popup';
import { selectListProps } from '../../../interface/global';
import { useFormik } from 'formik';
import { getNestedValue } from '../../../helper/helper';
import { MdAddCircleOutline } from "react-icons/md";
import useDebounce from '../../../hooks/useDebounce';
import Button from '../button/Button';
import useApi from '../../../hooks/useApi';
import { TabManager } from '../../class/tabManager';

interface DropDownPopupProps extends selectListProps {
    dataKeys?: {
        [key: string]: string;
    };
    apiRoute: string;
    handleNewItem: () => void;
    searchFrom?: string;
    onEsc?: () => void;
    autoClose?: boolean;
    extraQueryParams?: {
        [key: string]: string | number;
    };
}

export const SelectList = ({
    heading,
    className,
    closeList,
    headers,
    footers,
    footerClass,
    apiRoute,
    extraQueryParams,
    handleSelect,
    handleNewItem,
    searchFrom,
    onEsc,
    autoClose = true,
    selectMultiple = false,
}: DropDownPopupProps) => {
    const [focusedRowIndex, setFocusedRowIndex] = useState<number>(0);
    const [focusedRowData, setFocusedRowData] = useState<any>(null);
    const tableRefs = useRef<(HTMLTableRowElement | null)[]>([]);
    const isFirstRender = useRef(true);
    const [tableData, setTableData] = useState<any[]>([]);
    const [page, setPage] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const pageReset = useRef(false);
    const selectedMultipleRowData = useRef<any[]>([]);
    const { sendAPIRequest } = useApi();
    const tabManager = TabManager.getInstance();

    const formik = useFormik({
        initialValues: {
            searchBar: '',
            category: ''
        },
        onSubmit: () => {
            // Handle form submission if needed
        }
    });
    const searchDebounce = useDebounce(formik.values.searchBar, 1000)

    const fetchTableData = async () => {
        try {
            setIsLoading(true);
            const skip = page * 8;
            const limit = 8
            const queryParams = new URLSearchParams({
                skip: skip.toLocaleString(),
                limit: limit.toLocaleString(),
            });
            if (formik.values.searchBar.length > 0 && searchFrom) {
                queryParams.append(searchFrom, formik.values.searchBar);
            }
            if (extraQueryParams && typeof (extraQueryParams) === 'object') {
                for (const [key, value] of Object.entries(extraQueryParams)) {
                    queryParams.append(key, value?.toLocaleString());
                }
            }
            const response = await sendAPIRequest<any>(`${apiRoute}?${queryParams.toString()}`)
            const newData = Array.isArray(response) ? response : [];

            if (newData.length === 0) {
                setHasMore(false);
            } else {
                setTableData((prevData) => [...prevData, ...newData]);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch table data:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(0)
        setHasMore(true)
        setTableData([])
        setFocusedRowIndex(0);
        if (!page) {
            pageReset.current = !pageReset.current
        }
    }, [searchDebounce, heading])

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return; // Skip the first render to protect two api calls as react strict mode call cycles twice
        }
        fetchTableData();
    }, [page, pageReset.current]);

    // Infinite scroll handler
    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore && !isLoading) {
            setPage((prevPage) => prevPage + 1);
        }
    };


    function makeRecordVisibility(recordIndex: number) {
        const container = document.getElementById(`selectListData`)!;
        tableRefs.current[recordIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
        if (recordIndex === 0) {
            container.scrollTo({
                top: -42,
                behavior: 'smooth',
            });
        }
        if (recordIndex === -2) {
            container.scrollTo({
                top: tableData.length * 41,
                behavior: 'smooth',
            });
        }
    }

    useEffect(() => {
        const searchInput = document.getElementById('searchBar');
        if (searchFrom) {
            searchInput?.focus();
        } else {
            const tableContainer = document.getElementById('selectListData');
            tableContainer?.focus()
        }

        setFocusedRowData(tableData[focusedRowIndex]);
    }, [focusedRowIndex, tableData]);


    useEffect(() => {
        if (focusedRowIndex === 0) {
            makeRecordVisibility(0);
        }
        if (focusedRowIndex === tableData.length) {
            makeRecordVisibility(tableData.length - 1);
        }
    }, [focusedRowIndex]);

    useEffect(() => {
        const selectListElement = document.getElementById('selectListData');
        const isVisible = selectListElement && selectListElement.getBoundingClientRect().height > 0;
        if (isVisible) {
            document.body.classList.add('!overflow-hidden');
            const handleClickOutside = (event: Event) => {
                const target = event.target as HTMLElement;
                if (target.id === 'searchBar' || target.tagName === 'SELECT') return;
                const parentElement = target.parentElement;
                if (parentElement?.getAttribute('tabindex') !== '-1') {
                    event.preventDefault();
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.body.classList.remove('!overflow-hidden');
            };
        }
    }, [document.getElementById('selectListData')?.getBoundingClientRect().height]);


    useEffect(() => {
        const currentTabId = tabManager.activeTabId;

        document.getElementById(`${currentTabId}-selectList`)?.addEventListener('keydown', handleKeyDown);
        return () => {
            document.getElementById(`${currentTabId}-selectList`)?.removeEventListener('keydown', handleKeyDown);
        };
    }, [focusedRowData, heading, tableData.length]);

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setFocusedRowIndex((prevIndex) => (prevIndex >= tableData.length - 1 ? prevIndex : prevIndex + 1));
            makeRecordVisibility(focusedRowIndex + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setFocusedRowIndex((prevIndex) => (prevIndex <= 0 ? prevIndex : prevIndex - 1));
            makeRecordVisibility(focusedRowIndex >= 1 ? focusedRowIndex - 2 : -1);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (!selectMultiple) {
                if (!tableData.length) return;
                event.stopPropagation()
                handleSelect(focusedRowData);
                if (autoClose) {
                    closeList();
                }
            } else {
                const focusedELement = document.activeElement;
                if (focusedELement?.tagName != 'BUTTON') {
                    document.getElementById(`multipleSelectCheckbox${focusedRowIndex}`)?.click();
                } else {
                    handleSelect(selectedMultipleRowData.current);
                    closeList();
                }
            }

        } else if (event.key === 'Escape') {
            event.preventDefault();
            if (onEsc) {
                onEsc()
            }
            else if (autoClose) {
                closeList();
            }
        } else if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
            document.getElementById('searchBar')?.focus();
        }
        else if (event.key === 'n' && event.ctrlKey) {
            event.preventDefault();
            handleNewItem()
        } else if (event.key === 'Tab') {
            event.preventDefault();
            document.getElementById('confirmSelectData')?.focus();
        }
    };

    const handleCheckBoxChange = (e: any, rowIndex: number) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            const data = tableData[rowIndex];
            data.rowIndex = rowIndex;
            selectedMultipleRowData.current.push(data);
        } else {
            const data = selectedMultipleRowData.current.filter(d => d.rowIndex !== rowIndex);
            selectedMultipleRowData.current = data;
        }
    }

    return (

        <Popup
            heading={`${heading}`}
            childClass='h-fit w-full min-w-[50vw] !max-h-[100vh] overflow-scroll'
            className={className}
            isSuggestionPopup={true}
            id='selectList'
            onClose={closeList}
            focusChain={[]}
        >
            <div className='flex px-4 mt-4 w-full justify-between items-center'>
                <form className='flex w-full gap-5'>
                    <div className="w-1/3 h-fit">
                        <div className={`flex items-center w-full h-8 text-xs ${!searchFrom && 'hidden'}`}>
                            <input
                                type={'text'}
                                id='searchBar'
                                name={`${searchFrom && 'searchBar'}`}
                                className={`w-full border border-solid border-[#9ca3af] text-[10px] text-gray-800 h-full rounded-sm p-1 appearance-none disabled:text-[#4c4c4c] disabled:bg-[#f5f5f5] focus:rounded-none focus:!outline-yellow-500 focus:bg-[#EAFBFCFF]`}
                                onChange={(e) => formik.setFieldValue('searchBar', e.target.value)}
                                placeholder='Search...'
                                // autoFocus={true}
                            />

                        </div>

                    </div>
                </form>
                {handleNewItem && <div className='flex flex-col cursor-pointer items-center' onClick={handleNewItem}>
                    <MdAddCircleOutline className='text-2xl' />
                    <span className='whitespace-nowrap text-sm'>Add {heading}</span>
                </div>}
            </div>

            <div className='flex flex-col h-[67vh] justify-between'>
                {/* Scrollable Table */}
                <div
                    className='mx-4 h-[50vh] overflow-auto border-[1px] border-gray-400 border-solid my-4 outline-none'
                    id='selectListData'
                    tabIndex={0}
                    onScroll={handleScroll}
                >
                    <table className='table-auto w-full border-collapse'>
                        <thead className='sticky top-0'>
                            <tr>
                                {selectMultiple && (
                                    <th className='w-fit border-[1px] border-solid bg-[#009196FF] border-gray-400 text-left text-white p-2'></th>
                                )}
                                {headers.map((header: any, index: number) => (
                                    <th
                                        key={index}
                                        className='w-fit bg-[#009196FF] text-left text-white p-2'
                                    >
                                        {header.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row: any, rowIndex: number) => (
                                <tr
                                    key={rowIndex}
                                    ref={(el) => (tableRefs.current[rowIndex] = el)}
                                    tabIndex={-1}
                                    id={`row-${rowIndex}`}
                                    onClick={() => { setFocusedRowIndex(rowIndex); }}
                                    className={focusedRowIndex === rowIndex ? 'bg-[#EAFBFCFF] border-t-2 border-b-2 focus:outline-0 !rounded-lg border-solid border-black' : ''}
                                >
                                    {selectMultiple && (
                                        <td className='border border-gray-400 px-1'>
                                            <input type="checkbox" id={`multipleSelectCheckbox${rowIndex}`} onChange={(e) => { handleCheckBoxChange(e, rowIndex) }} className="form-checkbox h-5 w-full text-blue-600 rounded-md focus:ring-2 focus:ring-blue-500" />
                                        </td>
                                    )}
                                    {headers.map((header: any, colIndex: number) => (
                                        <td key={colIndex} className={`border-[1px] border-gray-400 p-2 w-[${header.width}]`}>
                                            {header.auto ? rowIndex + 1 : getNestedValue(row, header.key)
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectMultiple && (
                    <div className='h-[5%] flex justify-end px-4'>
                        <Button type='fill' id='confirmSelectData' handleOnClick={() => {
                            handleSelect(selectedMultipleRowData.current);
                            closeList();
                        }}>
                            Confirm
                        </Button>
                    </div>
                )}

                {/* Footer */}
                <div className={`h-[120px] left-0 mx-4 ${footerClass} overflow-auto`}>
                    <div className={`flex flex-wrap gap-1 h-full w-full text-[.4rem] md:text-[.6rem] xxl:text-[1rem]`}>
                        {footers?.map((f: any, index: number) => (
                            <fieldset key={index} className="border flex-1 min-w-[240px] rounded-sm h-full border-gray-300 px-1 py-1 overflow-scroll">
                                <legend className="font-semibold text-gray-700 px-2">
                                    {f.label}
                                </legend>
                                <ul className='px-2 flex flex-col gap-[2%]'>
                                    {f.data.map((d: any, idx: number) => (
                                        focusedRowData && (
                                            <li key={idx}>
                                                <div className="flex">
                                                    <div className="w-5/12 pr-0 relative after:content-[':'] after:absolute after:-right-1 after:text-black">
                                                        {d.label} <span>{d.key === 'openingBal' && `( ${getNestedValue(focusedRowData, 'openingBalType')} )`}{d.key === 'closingBalance' && `( ${getNestedValue(focusedRowData, 'closingBalanceType')} )`}</span>
                                                    </div>
                                                    <div className="w-7/12 text-right flex justify-end">
                                                        <span className=" whitespace-nowrap">&nbsp;{getNestedValue(focusedRowData, d.key)}</span>
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            </fieldset>
                        ))}
                    </div>
                </div>

                <div className='flex gap-4 mt-2 px-4 flex-wrap'>
                    {/* full forms */}
                    {
                        headers.map((header: any) => (
                            header.fullForm && <div className='text-[12px]'>
                                <span className='text-red-500'>{header.label}</span> = <span>{header.fullForm}</span>
                            </div>
                        ))
                    }
                </div>

            </div>
        </Popup>
    );

};