import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { View } from '../../interface/global';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Button from '../../components/common/button/Button';
import CreateVouchers from './createVoucher';
import usePermission from '../../hooks/useRole';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';

const Vouchers = () => {
    const [view, setView] = useState<View>({ type: '', data: {} });
    const [selectedVoucherType, setSelectedVoucherType] = useState<string>(''); // State for selected voucher type
    const [filterDate, setFilterDate] = useState<string>(''); // State for selected date filter
    const { createAccess, updateAccess, deleteAccess } = usePermission('voucher');

    const handleDelete = (oldData: any) => {
        // settingPopupState(true, 'Are you sure you want to delete the selected record ?');
    };

    const colDefs: any[] = [
        { headerName: 'Date', field: 'date' },
        { headerName: 'Voucher Number', field: 'voucherNumber' },
        { headerName: 'Party', field: 'party' },
        { headerName: 'Station', field: 'station' },
        { headerName: 'Inst Type', field: 'instType' },
        { headerName: 'Amount (₹)', field: 'amount', type: 'rightAligned' },
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
                    {updateAccess && (
                        <FaEdit
                            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
                            onClick={() => {
                                setView({ type: 'add', data: params.data });
                            }}
                        />
                    )}
                    {deleteAccess && (
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
        suppressMovable: true,
        editable: false,
        floatingFilter: true,
    };

    // Placeholder options for the custom select dropdown
    const voucherTypes = [
        { label: 'Cash Receipt', value: 'CR' },
        { label: 'Cash Deposit', value: 'DR' },
        { label: 'Journal', value: 'JOUR' },
        { label: 'Bank Deposit', value: 'BD' },
        { label: 'Bank Withdraw', value: 'BW' },
    ];

    const handleVoucherTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVoucherType(event.target.value);
        setFilterDate(''); // Clear the date when a new voucher type is selected
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterDate(event.target.value);
    };

    const voucher = () => {
        return (
            <>
                {/* Voucher Heading */}
                <h1 className='text-2xl font-bold px-8 py-2'>
                    {selectedVoucherType ? `${voucherTypes.find((type) => type.value === selectedVoucherType)?.label} ` : ''}
                    Voucher
                </h1>

                {/* Container for Voucher Type Dropdown and Add Voucher Button */}
                <div className='flex items-start px-8 py-1'>
                    {/* Container for Dropdown and Date Input */}
                    <div className='flex flex-col mr-4'>
                        {/* Voucher Type Dropdown */}
                        <select
                            value={selectedVoucherType}
                            onChange={handleVoucherTypeChange}
                            className='p-2 border border-gray-300 rounded mb-2'
                        >
                            <option value=''>Select Voucher Type</option>
                            {voucherTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>

                        {/* Date Filter Input */}
                        {selectedVoucherType && (
                            <input
                                type='date'
                                value={filterDate}
                                onChange={handleDateChange}
                                className='p-2 border border-gray-300 rounded'
                            />
                        )}
                    </div>

                    {/* Add Voucher Button */}
                    {true && (
                        <div className='flex items-center'>
                            <Button
                                type='highlight'
                                handleOnClick={() => {
                                    setView({ type: 'add', data: {} });
                                }}
                            >
                                Add Voucher
                            </Button>
                        </div>
                    )}
                </div>

                {/* Show AgGrid only if date is selected */}
                {filterDate && (
                    <div id='account_table' className='ag-theme-quartz'>
                        <AgGridReact
                            // rowData={tableData} // You can filter data based on the selected date and voucher type
                            columnDefs={colDefs}
                            defaultColDef={defaultColDef}
                        />
                    </div>
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
