import { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { View } from '../../interface/global';
import type { Voucher } from '../../interface/global';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Button from '../../components/common/button/Button';
import CreateVouchers from './createVoucher';
import usePermission from '../../hooks/useRole';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import { sendAPIRequest } from '../../helper/api';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';

const Vouchers = () => {
    const [view, setView] = useState<View>({ type: '', data: {} });
    const [selectedVoucherType, setSelectedVoucherType] = useState<string>(''); // State for selected voucher type
    const [filterDate, setFilterDate] = useState<string>(getTodayDate(new Date())); // State for selected date filter
    const { createAccess, updateAccess, deleteAccess } = usePermission('voucher');
    const [tableData, setTableData] = useState<Voucher | any>([]);
    const voucherNumber = useRef<string>('');
    const voucherDate = useRef<string>('');
    const voucherType = useRef<string>('');
    const [originalTableData, setOriginalTableData] = useState<Voucher[]>([]);


    const [popupState, setPopupState] = useState({
        isModalOpen: false,
        isAlertOpen: false,
        message: '',
    });

    const settingPopupState = (isModal: boolean, message: string) => {
        setPopupState({
            ...popupState,
            [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
            message: message,
        });
    };

    const getVoucherData = async () => {
        const url = `/voucher/?voucherDate=${filterDate}&voucherType=${selectedVoucherType}`;

        try {
            const response = await sendAPIRequest(url, {
                method: 'GET',
            });

            if (!Array.isArray(response)) {
                return;
            }

            const uniqueVoucherArray: any = [];
            const seenVoucherNumbers = new Set();

            response.forEach((item) => {
                if (item.voucherType === selectedVoucherType) {
                    if (!seenVoucherNumbers.has(item.voucherNumber)) {
                        seenVoucherNumbers.add(item.voucherNumber);
                        uniqueVoucherArray.push(item);
                    }
                }
            });

            setTableData(uniqueVoucherArray);
            setOriginalTableData(response);
            return uniqueVoucherArray;

        } catch (error) {
            console.error("Error fetching voucher data:", error);
        }
    };

    const handleEditClick = (rowData: any) => {
        const voucherGridData: any = originalTableData.filter(
            (item) => item.voucherNumber === rowData.voucherNumber
        );
        setView({
            type: 'add',
            data: {
                rowData,
                voucherGridData,
            },
        });
    };

    const handleAlertCloseModal = () => {
        setPopupState({ ...popupState, isAlertOpen: false });
    };

    const handleClosePopup = () => {
        setPopupState({ ...popupState, isModalOpen: false });
    };

    const handleConfirmPopup = async () => {
        setPopupState({ ...popupState, isModalOpen: false });
        const url = `/voucher/${voucherNumber.current}?voucherDate=${voucherDate.current}&voucherType=${voucherType.current}`;
        await sendAPIRequest(url, {
            method: 'DELETE',
        });
        await getVoucherData();
    };

    const handleDelete = (oldData: any) => {
        settingPopupState(true, 'Are you sure you want to delete the selected record ?');
        voucherNumber.current = oldData.voucherNumber;
        voucherDate.current = oldData.voucherDate;
        voucherType.current = oldData.voucherType;
    };

    useEffect(() => {
        getVoucherData();
    }, [filterDate, view, selectedVoucherType]);

    function getTodayDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    }

    function dateFormatter(params: { value: string }): string {
        return new Date(params.value).toLocaleDateString();
    }


    const colDefs: any[] = [
        {
            headerName: 'Date',
            field: 'voucherDate',
            valueFormatter: dateFormatter,
        },
        { headerName: 'Voucher Number', field: 'voucherNumber' },
        { headerName: 'Amount (₹)', field: 'amount' },
        { headerName: 'Party', field: 'partyName' },
        { headerName: 'Discount', field: 'discount' },
        { headerName: 'Dr/Cr', field: 'debitOrCredit' },
        {
            headerName: 'Actions',
            headerClass: 'custom-header-class custom-header',
            sortable: false,
            editable: false,
            cellStyle: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            },
            cellRenderer: (params: { data: any }) => (
                <div className='table_edit_buttons'>
                    {/* put access updateAccess  */}
                    {true && (
                        <FaEdit
                            id='editButton'
                            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
                            onClick={() => {
                                onCellClicked(params, true)
                            }}
                        />
                    )}
                    {/* put access deleteAccess  */}
                    {true && (
                        <MdDeleteForever
                            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                            onClick={() => handleDelete(params.data)}
                        />
                    )}
                </div>
            ),
        },
    ];

    const defaultColDef = {
        flex: 1,
        filter: true,
        sortable: true,
        suppressMovable: false,
        editable: false,
        floatingFilter: true,
        headerClass: 'custom-header',
    };

    const voucherTypes = [
        { label: 'Cash Receipt', value: 'CR' },
        { label: 'Cash Payment', value: 'CP' },
        { label: 'Journal', value: 'JOUR' },
        { label: 'Bank Deposit', value: 'BD' },
        { label: 'Bank Withdraw', value: 'BW' },
    ];

    const handleVoucherTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVoucherType(event.target.value);
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterDate(event.target.value);
    };
    const onCellClicked = (params: any, isEditButton: boolean = false) => {
        if (params?.column?.colId === 'voucherDate' || isEditButton) {
            if (params.data) {
                handleEditClick(params.data);
            } else {
                console.error("No data available for this cell click event.");
            }
        }
    };

    const voucher = () => {
        return (
            <>
                <div className='flex flex-col gap-2'>
                    <div className='flex justify-between'>
                        <h1 className='text-2xl font-bold px-8 py-2'>
                            {selectedVoucherType ? `${voucherTypes.find((type) => type.value === selectedVoucherType)?.label} ` : ''}
                            Vouchers
                        </h1>
                        {true && (
                            <div className='flex items-center'>
                                <Button
                                    type='highlight'
                                    handleOnClick={() => {
                                        setView({ type: 'add', data: {} });
                                    }}
                                >
                                    Create Voucher
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className='flex ps-8 gap-4'>
                        <select
                            value={selectedVoucherType}
                            onChange={handleVoucherTypeChange}
                            className='p-2 border border-gray-300 rounded'
                        >
                            <option value=''>Select Voucher Type</option>
                            {voucherTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <input
                            type='date'
                            value={filterDate}
                            onChange={handleDateChange}
                            className='p-2 border border-gray-300 rounded'
                        />
                    </div>
                </div>

                {/* Show AgGrid only if date is selected */}
                {true && (
                    <div id='account_table' className='ag-theme-quartz'>
                        <AgGridReact
                            rowData={tableData}
                            columnDefs={colDefs}
                            defaultColDef={defaultColDef}
                            onCellClicked={onCellClicked}
                        />
                    </div>
                )}
                {(popupState.isModalOpen || popupState.isAlertOpen) && (
                    <Confirm_Alert_Popup
                        onClose={handleClosePopup}
                        onConfirm={
                            popupState.isAlertOpen
                                ? handleAlertCloseModal
                                : handleConfirmPopup
                        }
                        message={popupState.message}
                        isAlert={popupState.isAlertOpen}
                    />
                )}
            </>
        );
    };

    const renderView = () => {
        switch (view.type) {
            case 'add':
                return <CreateVouchers setView={setView} data={view.data} />;
            default:
                return voucher();
        }
    };

    return <div className='w-full'>{renderView()}</div>;
};

export default Vouchers;
