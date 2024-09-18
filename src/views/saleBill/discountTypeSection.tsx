import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import Button from '../../components/common/button/Button';
import { Container } from '../../components/common/commonFormFields';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import { useQueryClient } from '@tanstack/react-query';
import useApi from '../../hooks/useApi';

export const DiscountTypeSection = ({ setView, data }: any) => {
    const [focused, setFocused] = useState('');
    const { sendAPIRequest } = useApi();
    const queryClient = useQueryClient();
    const [popupState, setPopupState] = useState({
        isModalOpen: false,
        isAlertOpen: false,
        message: '',
        shouldBack: true
    });
    const [totalValue, setTotalValue] = useState({
        totalAmt: 0.0,
        totalDiscount: 0.0,
        totalGST: 0.0,
        totalCGST: 0.0,
        totalSGST: 0.0,
        isDefault: true
    });

    const settingPopupState = (isModal: boolean, message: string, shouldBack: boolean) => {
        setPopupState({
            ...popupState,
            [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
            message: message,
            shouldBack: shouldBack,
        });
    };

    const handleAlertCloseModal = () => {
        setPopupState({ ...popupState, isAlertOpen: false });
        if (popupState.shouldBack) {
            setView({ type: '', data: {} });
        }
    };

    const handleClosePopup = () => {
        setPopupState({ ...popupState, isModalOpen: false });
    };

    const discountTypeFormik: any = useFormik({
        initialValues: {
            discountType: data?.discountType || '',
            isDiscountAfterSaleTax: data?.isDiscountAfterSaleTax || '',
            discountAmt: data?.discountAmt || '',
            discountPer: data?.discountPer || '',
            transportMode: data?.transportMode || '',
            transportDistance: data?.transportDistance || '',
            transportE: data?.transportE || '',
            transportId: data?.transportId || '',
            transportDocNo: data?.transportDocNo || '',
            dDate: data?.dDate || '',
            vehicle: data?.vehicle || '',
        },
        onSubmit: async (values: any) => {
            try {
                values.total = totalValue.totalAmt;
                values.totalDiscount = totalValue.totalDiscount;
                const finalData = { ...data, ...values }
                if (data.id) {
                    await sendAPIRequest(`/invoiceBill/${data.id}`, { method: 'PUT', body: finalData });
                } else {
                    await sendAPIRequest(`/invoiceBill`, { method: 'POST', body: finalData });
                }
                await queryClient.invalidateQueries({ queryKey: ['get-saleBill'] });
                settingPopupState(true, `Sale Bill ${data.id ? 'updated' : 'created'} successfully`, true);
            } catch (error:any) {
                if (!error?.isErrorHandled) {
                    settingPopupState(false, `Failed to ${data.id ? 'update' : 'create'} Sale Bill`, false);
                }
            }
        },
    });

    useEffect(() => {
        setFocused('discountType');
    }, []);

    const setFinalValues = (finalAmt: any, finalDiscount: any) => {
        parseFloat(Number(finalAmt)?.toFixed(2));
        parseFloat(Number(finalDiscount)?.toFixed(2));
        setTotalValue({
            ...totalValue,
            totalAmt: finalAmt,
            totalDiscount: finalDiscount,
            isDefault: false
        });
    }

    const calculateTotalAmt = () => {
        const { discountType, discountAmt, discountPer, isDiscountAfterSaleTax } = discountTypeFormik.values;
        const { bills, isDiscountGiven } = data;

        let finalAmt = 0;
        let finalDiscount = 0;

        if ((isDiscountGiven && isDiscountAfterSaleTax !== '')) {
            finalDiscount = bills.reduce((acc: any, data: any) => acc + (data.amt * data.disPer) / 100, 0);
            if (isDiscountAfterSaleTax === 'Discount After Sale Tax') {
                finalAmt = bills.reduce((acc: any, data: any) => acc + ((data.amt + ((data.amt * data.gstAmount) / 100)) - ((data.amt * data.disPer) / 100)), 0);
            } else {
                finalAmt = bills.reduce((acc: any, data: any) => acc + ((data.amt - (data.amt * data.disPer) / 100) + ((data.amt - (data.amt * data.disPer) / 100) * data.gstAmount) / 100), 0);
            }            
            setFinalValues(finalAmt, finalDiscount);
        }
        else if (!isDiscountGiven && discountType != '') {
            if (discountType === 'Zero Discount') {
                const amt = bills.reduce((acc: any, data: any) => acc + ((data.amt + ((data.amt * data.gstAmount) / 100))), 0);
                data.total = parseFloat(Number(amt)?.toFixed(2));
                finalAmt = data.total - discountAmt;
                finalDiscount = discountAmt;
                setFinalValues(finalAmt, finalDiscount);
            } else if (discountType === 'Percent Discount') {
                if (isDiscountAfterSaleTax === 'Discount After Sale Tax') {
                    finalAmt = bills.reduce((acc: any, data: any) => acc + ((data.amt + ((data.amt * data.gstAmount) / 100)) - ((data.amt * discountPer) / 100)), 0);
                    finalDiscount = bills.reduce((acc: any, data: any) => acc + ((data.amt * discountPer) / 100), 0);
                    setFinalValues(finalAmt, finalDiscount);
                } else if (isDiscountAfterSaleTax === 'Discount Before Sale Tax') {
                    finalDiscount = bills.reduce((acc: any, data: any) => acc + (data.amt * discountPer) / 100, 0);
                    finalAmt = bills.reduce((acc: any, data: any) => acc + ((data.amt - (data.amt * discountPer) / 100) + (((data.amt - (data.amt * discountPer) / 100) * data.gstAmount) / 100)), 0);
                    data.totalDiscount = finalDiscount;
                    setFinalValues(finalAmt, finalDiscount);
                }
            }
        }
    }

    useEffect(() => {
        calculateTotalAmt();
    }, [discountTypeFormik.values.discountType, discountTypeFormik.values.discountAmt, discountTypeFormik.values.discountPer, discountTypeFormik.values.isDiscountAfterSaleTax]);

    const fieldsArray = [
        ...(data.isDiscountGiven === false ? [
            {
                label: 'Discount Type',
                id: 'discountType',
                name: 'discountType',
                type: 'select',
                disableArrow: false,
                isSearchable: false,
                options: [
                    { value: 'Zero Discount', label: 'Zero Discount' },
                    { value: 'Percent Discount', label: 'Percent Discount' }
                ],
                nextField: discountTypeFormik.values.discountType === 'Zero Discount' ? 'discountAmt' : (discountTypeFormik.values.discountType === 'Percent Discount' ? 'isDiscountAfterSaleTax' : ''),
                autoFocus: data.isDiscountGiven ? false : true,
            },
        ] : []),
        ...(data.isDiscountGiven || (!data.isDiscountGiven && (discountTypeFormik.values.discountType === 'Percent Discount')) ? [
            {
                label: 'Discount After/Before S.T',
                id: 'isDiscountAfterSaleTax',
                name: 'isDiscountAfterSaleTax',
                type: 'select',
                disableArrow: false,
                isSearchable: false,
                options: [
                    { value: 'Discount After Sale Tax', label: 'Discount After Sale Tax' },
                    { value: 'Discount Before Sale Tax', label: 'Discount Before Sale Tax' },
                ],
                nextField: data.isDiscountGiven ? 'transportMode' : (discountTypeFormik.values.discountType === 'Percent Discount' ? 'discountPer' : ''),
                prevField: !data.isDiscountGiven ? 'discountType' : '',
                autoFocus: data.isDiscountGiven ? true : false,
            },
        ] : []),
        ...(!data.isDiscountGiven && discountTypeFormik.values.discountType === 'Percent Discount' && (discountTypeFormik.values.isDiscountAfterSaleTax === 'Discount After Sale Tax' || discountTypeFormik.values.isDiscountAfterSaleTax === 'Discount Before Sale Tax') ? [
            {
                label: 'Discount %',
                id: 'discountPer',
                name: 'discountPer',
                type: 'text',
                nextField: discountTypeFormik.values.discountType === 'Percent Discount' ? 'transportMode' : '',
                prevField: 'isDiscountAfterSaleTax',
            },
        ] : []),
        ...(!data.isDiscountGiven && discountTypeFormik.values.discountType === 'Zero Discount' ? [
            {
                label: 'Discount',
                id: 'discountAmt',
                name: 'discountAmt',
                type: 'text',
                nextField: 'transportMode',
                prevField: data.isDiscountGiven ? 'isDiscountAfterSaleTax' : (discountTypeFormik.values.discountType === 'Zero Discount' ? 'discountType' : (discountTypeFormik.values.discountType === 'Percent Discount' ? 'discountPer' : '')),
            },
        ] : []),
        {
            label: 'Transport Mode',
            id: 'transportMode',
            name: 'transportMode',
            disableArrow: false,
            isSearchable: false,
            type: 'select',
            options: [
                { value: 'Road', label: 'Road' },
                { value: 'Railways', label: 'Railways' },
                { value: 'Air', label: 'Air' },
                { value: 'Ship', label: 'Ship' }
            ],
            nextField: 'transportDistance',
        },
        {
            label: 'Distance',
            id: 'transportDistance',
            name: 'transportDistance',
            type: 'text',
            nextField: 'transportE',
            prevField: 'transportMode',
        },
        {
            label: 'Transport',
            id: 'transportE',
            name: 'transportE',
            type: 'text',
            nextField: 'transportId',
            prevField: 'transportDistance',
        },
        {
            label: 'Transport ID',
            id: 'transportId',
            name: 'transportId',
            type: 'text',
            nextField: 'transportDocNo',
            prevField: 'transportE',
        },
        {
            label: 'DOC. NO.',
            id: 'transportDocNo',
            name: 'transportDocNo',
            type: 'text',
            nextField: 'dDate',
            prevField: 'transportId',
        },
        {
            label: 'D. Date',
            id: 'dDate',
            name: 'dDate',
            type: 'text',
            nextField: 'vehicle',
            prevField: 'transportDocNo',
        },
        {
            label: 'Vehicle',
            id: 'vehicle',
            name: 'vehicle',
            type: 'text',
            nextField: 'submit_all',
            prevField: 'dDate',
        },
    ]

    return (
        <div className="w-full">
            <div className='flex w-full items-center justify-between px-8 py-1'>
                <h1 className='font-bold'>Discount</h1>
                <Button
                    type='highlight'
                    id='saleBill_button'
                    handleOnClick={() => {
                        setView({ type: 'add', data: data })
                    }}
                >
                    Back
                </Button>
            </div>
            <form onSubmit={discountTypeFormik.handleSubmit} className="flex flex-col w-full">
                <div className="flex flex-col px-4 mx-4 py-2 gap-2">
                    <div className='flex flex-col w-[100%] gap-10 mb-4'>
                        <Container
                            fields={fieldsArray}
                            formik={discountTypeFormik}
                            focused={focused}
                            setFocused={setFocused}
                            isDiscountType={true}
                        />
                    </div>
                    <div className='flex gap-12 justify-between'>
                        <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
                            <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Discount Info</span>
                            <span className='flex gap-2 text-base text-gray-900 p-2'>
                                Total Discount :{' '}
                                <span className='min-w-[50px] text-gray-700'>
                                    {parseFloat(Number(totalValue.totalDiscount)?.toFixed(2))}
                                </span>
                            </span>
                        </div>
                        <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
                            <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Quantity Info</span>
                            <span className='flex gap-2 text-base text-gray-900 m-2'>
                                Total Quantity :{' '}
                                <span className='min-w-[50px] text-gray-700'>
                                    {data?.qtyTotal || 0}
                                </span>
                            </span>
                        </div>
                        <div className="border-[1px] border-solid w-[25%] border-gray-400 relative">
                            <span className='absolute top-[-8px] left-2  px-2 w-fit bg-[#fff] text-xs'>Total Info</span>
                            <span className='flex gap-2 text-base text-gray-900 m-2'>
                                Total :{' '}
                                <span className='min-w-[50px] text-gray-700'>
                                    {totalValue.totalAmt >= 0 && !totalValue.isDefault ? parseFloat(Number(totalValue.totalAmt)?.toFixed(2)) : (data?.total || 0)}
                                </span>
                            </span>
                        </div>
                    </div>
                    <div className='w-full flex justify-end p-2'>
                        <Button
                            type='fill'
                            padding='px-4 py-2'
                            id='submit_all'
                            disable={(!discountTypeFormik.isValid)}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </form>
            {(popupState.isModalOpen || popupState.isAlertOpen) && (
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
