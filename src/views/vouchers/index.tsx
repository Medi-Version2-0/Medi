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
    const [selectedVoucherType, setSelectedVoucherType] = useState<string>('');
    const [filterDate, setFilterDate] = useState<string>('');
    const { createAccess, updateAccess, deleteAccess } = usePermission('voucher');
    const [tableData, setTableData] = useState<Voucher | any>(null);
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

    // const getVoucherData = async() =>{
    //     console.log("voucherttttttttttttt",selectedVoucherType,filterDate)
    //     const url = `/voucher/?voucherDate=${filterDate}&voucherType=${selectedVoucherType}`;
    //     const response = await sendAPIRequest(url, {
    //         method: 'GET',
    //       });
    //     console.log("response-------->",response)
    //     setTableData(response);
    //     return response
    // } 


    const getVoucherData = async () => {
        console.log("Fetching vouchers for", selectedVoucherType, filterDate);
        const url = `/voucher/?voucherDate=${filterDate}&voucherType=${selectedVoucherType}`;
        
        try {
          const response = await sendAPIRequest(url, {
            method: 'GET',
          });
      
          if (!Array.isArray(response)) {
            console.error("Expected an array, received:", typeof response);
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
      
          console.log("Filtered Data:--------", uniqueVoucherArray);
          setTableData(uniqueVoucherArray);
          setOriginalTableData(response);
          return uniqueVoucherArray;
      
        } catch (error) {
          console.error("Error fetching voucher data:", error);
        }
      };

    const handleEditClick = (rowData: any) => {
        // Filter original data based on voucherNumber
        const voucherGridData: any = originalTableData.filter(
            (item) => item.voucherNumber === rowData.voucherNumber
        );
        setView({
        type: 'add',
        data: {
            rowData, // Object containing the data of the clicked cell
            voucherGridData, // Array containing the filtered data
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
    }, [filterDate, selectedVoucherType]);

    const colDefs: any[] = [
        { headerName: 'Date', field: 'voucherDate' },
        { headerName: 'Voucher Number', field: 'voucherNumber' },
        { headerName: 'Amount (₹)', field: 'amount' },
        { headerName: 'Party', field: 'partyId' },
        { headerName: 'Discount', field: 'discount' },
        { headerName: 'Voucher Type', field: 'voucherType' },
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
                            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
                            onClick={() => { onCellClicked(params.data)
                                console.log("params----->",params)
                                // return setView({ type: 'add', data: params.data });
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
        suppressMovable: true,
        editable: false,
        floatingFilter: true,
        headerClass: 'custom-header',
    };

    // Placeholder options for the custom select dropdown
    const voucherTypes = [
        { label: 'Cash Receipt', value: 'CR' },
        { label: 'Cash Payment', value: 'CP' },
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
    const onCellClicked = (params: any) => {
        if (params.data) {
            handleEditClick(params.data); // Use the handleEditClick function only if data exists
        } else {
            console.error("No data available for this cell click event.");
        }
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

                    {/* Add createAccess below */}
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
                {true && (
                    <div id='account_table' className='ag-theme-quartz'>
                        <AgGridReact
                            rowData={tableData} // You can filter data based on the selected date and voucher type
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
