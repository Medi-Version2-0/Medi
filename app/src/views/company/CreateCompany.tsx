import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormikProps, useFormik } from 'formik';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import FormikInputField from '../../components/common/FormikInputField';
import { getCompanyFormSchema } from './validation_schema';
import { CompanyFormData, Option } from '../../interface/global';
import CustomSelect from '../../components/custom_select/CustomSelect';
import onKeyDown from '../../utilities/formKeyDown';

export const CreateCompany = () => {
    const electronAPI = (window as any).electronAPI;
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state || {};
    const [stationOptions, setStationOptions] = useState<Option[]>([]);
    const [salesOptions, setSalesOptions] = useState<Option[]>([]);
    const [purchaseOptions, setPurchaseOptions] = useState<Option[]>([]);
    const [focused, setFocused] = useState('');
    // const [stateOptions, setStateOptions] = useState<Option[]>([]);
    const [popupState, setPopupState] = useState({
        isModalOpen: false,
        isAlertOpen: false,
        message: '',
    });

    const formik: any = useFormik({
        initialValues: {
            //general
            companyName: data?.companyName || '',
            shortName: data?.shortName || '',
            //address
            address1: data?.address1 || '',
            address2: data?.address2 || '',
            address3: data?.address3 || '',
            stationName: data?.stationName || '',
            //balance
            openingBal: data?.openingBal || '0.00',
            openingBalType: data?.openingBalType || 'DR',
            sales: data?.sales || '',
            purchase: data?.purchase || '',
            discPercent: data?.discPercent || '',
            isDiscountPercent: data?.isDiscountPercent || '',
            //tax
            vatNumber: data?.vatNumber || '',
            gstIn: data?.gstIn || '',
            drugLicenceNo1: data?.drugLicenceNo1 || '',

            stateInout: data?.stateInout || '',
            //personal
            phoneNumber: data?.phoneNumber || '',
            mobileNumber: data?.mobileNumber || '',
            panNumber: data?.panNumber || '',
            emailId1: data?.emailId1 || '',
            emailId2: data?.emailId2 || '',
            emailId3: data?.emailId3 || '',

            purSaleAc: data?.purSaleAc || '',
        },
        validationSchema: getCompanyFormSchema(),
        onSubmit: (values) => {
            const allData = { ...values };
            console.log(allData);

            if (data.company_id) {
                electronAPI.updatecompany(data.company_id, allData);
            } else {
                electronAPI.addcompany(allData);
            }
        },
    });


    const fetchAllData = () => {
        const stateList = electronAPI.getAllStations('', 'station_name', '', '', '');
        const salesList = electronAPI.getSalesPurchase('', '', '', 'Sales');
        const purchaseList = electronAPI.getSalesPurchase('', '', '', 'Purchase');
        setStationOptions(stateList.map((station: any) => ({
            value: station.station_name,
            label: station.station_name.toLowerCase(),
        })));
        setSalesOptions(salesList.map((sales: any) => ({
            value: sales.spType,
            label: sales.spType
        })));
        setPurchaseOptions(purchaseList.map((purchase: any) => ({
            value: purchase.spType,
            label: purchase.spType,
        })));
    };

    useEffect(() => {
        fetchAllData();
        document.getElementById('partyName')?.focus();
    }, []);

    const handleAlertCloseModal = () => {
        setPopupState({ ...popupState, isAlertOpen: false });
        return navigate('/company_table');
    };

    const handleClosePopup = () => {
        setPopupState({ ...popupState, isModalOpen: false });
    };

    const handleFieldChange = (option: Option | null, id: string) => {
        formik.setFieldValue(id, option?.value);
    };

    const handleOpeningBalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            formik.setFieldValue('openingBal', value);
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, formik?: FormikProps<CompanyFormData>, radioField?: any) => {
        onKeyDown({
            e,
            formik: formik,
            radioField: radioField,
            focusedSetter: (field: string) => {
                setFocused(field);
            },
        });
    };

    return (
        <div className='w-full'>
            <div className='flex w-full items-center justify-between px-8 py-1'>
                <h1 className='font-bold'>
                    {!!data.company_id ? 'Update company' : 'Create company'}
                </h1>
                <Button
                    type='highlight'
                    id='company_button'
                    handleOnClick={() => {
                        return navigate(`/company_table`);
                    }}
                >
                    Back
                </Button>
            </div>
            <form onSubmit={formik.handleSubmit} className='flex flex-col w-full'>
                <div className='flex flex-row px-4 mx-4 py-2 gap-2'>
                    <div className='relative border w-full h-full pt-4 border-solid border-gray-400'>
                        <div className='absolute top-[-14px] left-2  px-2 w-max bg-[#f3f3f3]'>Company</div>
                        <div className='flex flex-col gap-1 w-full px-4 py-2 text-xs leading-3 text-gray-600'>
                            <FormikInputField
                                label='Company Name'
                                id='companyName'
                                name='companyName'
                                formik={formik}
                                className='!mb-0'
                                labelClassName='min-w-[110px]'
                                isRequired={true}
                                nextField='shortName'
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                                showErrorTooltip={(formik.touched.companyName && !!formik.errors.companyName)}
                            />
                            <FormikInputField
                                label='MFG Code'
                                id='shortName'
                                name='shortName'
                                formik={formik}
                                className='!mb-0'
                                labelClassName='min-w-[110px]'
                                isRequired={true}
                                prevField='companyName'
                                nextField='address1'
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                            />
                            <div className='flex items-center m-[1px]'>
                                <label htmlFor='address1' className='min-w-[110px]'>
                                    Address
                                </label>
                                <div className='flex flex-col gap-0 w-full'>
                                    <FormikInputField
                                        label=''
                                        id='address1'
                                        name='address1'
                                        formik={formik}
                                        className='!mb-0'
                                        prevField='shortName'
                                        nextField='address2'
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                                    />
                                    <FormikInputField
                                        label=''
                                        id='address2'
                                        name='address2'
                                        formik={formik}
                                        className='!mb-0'
                                        prevField='address1'
                                        nextField='address3'
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                                    />
                                    <FormikInputField
                                        label=''
                                        id='address3'
                                        name='address3'
                                        formik={formik}
                                        className='!mb-0'
                                        prevField='address2'
                                        nextField='stationName'
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                                    />
                                </div>
                            </div>
                            <div className='flex items-center'>
                                <CustomSelect
                                    label='Station'
                                    id='stationName'
                                    labelClass='min-w-[110px]'
                                    isFocused={focused === "stationName"}
                                    value={formik.values.stationName === '' ? null : { label: formik.values.stationName, value: formik.values.stationName }}
                                    onChange={handleFieldChange}
                                    options={stationOptions}
                                    isSearchable={true}
                                    placeholder="Station Name"
                                    disableArrow={true}
                                    hidePlaceholder={false}
                                    className="!h-6 rounded-sm"
                                    isRequired={true}
                                    error={formik.errors.stationName}
                                    isTouched={formik.touched.stationName}
                                    showErrorTooltip={true}
                                    onBlur={() => { formik.setFieldTouched('stationName', true); setFocused(""); }}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                                        const dropdown = document.querySelector('.custom-select__menu');
                                        if (e.key === 'Enter') {
                                            (!dropdown) && e.preventDefault();
                                            document.getElementById('openingBal')?.focus();
                                        }
                                    }}
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='flex gap-2'>
                                    <FormikInputField
                                        label={`Opening Balance ₹`}
                                        id='openingBal'
                                        name='openingBal'
                                        formik={formik}
                                        onChange={handleOpeningBalInput}
                                        placeholder='0.00'
                                        className='!mb-0'
                                        inputClassName='h-9 text-right'
                                        labelClassName='min-w-[110px]'
                                        prevField='stationName'
                                        nextField='openingBalType'
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                                    />
                                    <CustomSelect
                                        value={
                                            formik.values.openingBalType === '' ? null : {
                                                label: formik.values.openingBalType, value: formik.values.openingBalType,
                                            }
                                        }
                                        id='openingBalType'
                                        onChange={handleFieldChange}
                                        options={[
                                            { value: 'CR', label: 'CR' },
                                            { value: 'DR', label: 'DR' },
                                        ]}
                                        isSearchable={false}
                                        placeholder='Op. Balance Type'
                                        disableArrow={false}
                                        hidePlaceholder={false}
                                        containerClass='!w-1/4'
                                        className='!rounded-none !h-6'
                                        isFocused={focused === "openingBalType"}
                                        onBlur={() => { formik.setFieldTouched('openingBalType', true); setFocused(""); }}
                                        onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                                            const dropdown = document.querySelector('.custom-select__menu');
                                            if (e.key === 'Enter') {
                                                (!dropdown) && e.preventDefault();
                                                setFocused('sales');
                                            }
                                        }}
                                    />
                                </div>
                                <CustomSelect
                                    label='Sales'
                                    id='sales'
                                    labelClass='min-w-[80px]'
                                    isFocused={focused === "sales"}
                                    value={formik.values.sales === '' ? null : { label: formik.values.sales, value: formik.values.sales }}
                                    onChange={handleFieldChange}
                                    options={salesOptions}
                                    isSearchable={true}
                                    placeholder="Sales"
                                    disableArrow={true}
                                    hidePlaceholder={false}
                                    className="!h-6 rounded-sm"
                                    isRequired={true}
                                    error={formik.errors.sales}
                                    isTouched={formik.touched.sales}
                                    showErrorTooltip={true}
                                    onBlur={() => { formik.setFieldTouched('sales', true); setFocused(""); }}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                                        const dropdown = document.querySelector('.custom-select__menu');
                                        if (e.key === 'Enter') {
                                            (!dropdown) && e.preventDefault();
                                            document.getElementById('purchase')?.focus();
                                            setFocused('purchase');
                                        }
                                    }}
                                />
                            </div>
                            <div className='flex gap-4 '>
                                <CustomSelect
                                    label='Purchase'
                                    id='purchase'
                                    labelClass='min-w-[110px]'
                                    isFocused={focused === "purchase"}
                                    value={formik.values.purchase === '' ? null : { label: formik.values.purchase, value: formik.values.purchase }}
                                    onChange={handleFieldChange}
                                    options={purchaseOptions}
                                    isSearchable={true}
                                    placeholder="Purchase"
                                    disableArrow={true}
                                    hidePlaceholder={false}
                                    className="!h-6 rounded-sm"
                                    isRequired={true}
                                    error={formik.errors.purchase}
                                    isTouched={formik.touched.purchase}
                                    showErrorTooltip={true}
                                    onBlur={() => { formik.setFieldTouched('purchase', true); setFocused(""); }}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                                        const dropdown = document.querySelector('.custom-select__menu');
                                        if (e.key === 'Enter') {
                                            (!dropdown) && e.preventDefault();
                                            document.getElementById('discPercent')?.focus();
                                        }
                                    }}
                                />
                            </div>
                            <div className='flex gap-4'>
                                <FormikInputField
                                    label='CD% CUSD'
                                    id='discPercent'
                                    name='discPercent'
                                    formik={formik}
                                    className='!mb-0'
                                    labelClassName='min-w-[110px]'
                                    isRequired={true}
                                    prevField='purchase'
                                    nextField='isDiscountPercent'
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                                />
                                <CustomSelect
                                    id='isDiscountPercent'
                                    label='Is discount Percentage'
                                    onChange={handleFieldChange}
                                    options={[
                                        { value: 'No', label: 'No' },
                                        { value: 'Yes', label: 'Yes' },
                                    ]}
                                    value={
                                        formik.values.isDiscountPercent === '' ? null : {
                                            label: formik.values.isDiscountPercent, value: formik.values.isDiscountPercent,
                                        }
                                    }
                                    isSearchable={false}
                                    disableArrow={false}
                                    hidePlaceholder={false}
                                    labelClass='max-w-[80px]'
                                    containerClass=''
                                    className='!rounded-none !h-6'
                                    isFocused={focused === "isDiscountPercent"}
                                    onBlur={() => { formik.setFieldTouched('isDiscountPercent', true); setFocused(""); }}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                                        const dropdown = document.querySelector('.custom-select__menu');
                                        if (e.key === 'Enter') {
                                            (!dropdown) && e.preventDefault();
                                            document.getElementById('vatNumber')?.focus();
                                        }
                                    }}
                                />
                            </div>
                            <div className='flex gap-4'>
                                <FormikInputField
                                    label='Vat Number'
                                    id='vatNumber'
                                    name='vatNumber'
                                    formik={formik}
                                    className='!mb-0'
                                    labelClassName='min-w-[110px]'
                                    isRequired={true}
                                    prevField='isDiscountPercent'
                                    nextField='gstIn'
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                                />
                                <FormikInputField
                                    label='GST In'
                                    id='gstIn'
                                    name='gstIn'
                                    formik={formik}
                                    className='!mb-0'
                                    labelClassName='min-w-[80px]'
                                    isRequired={true}
                                    prevField='vatNumber'
                                    nextField='drugLicenceNo1'
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                                />
                            </div>
                            <FormikInputField
                                label='Drug Licence'
                                id='drugLicenceNo1'
                                name='drugLicenceNo1'
                                formik={formik}
                                className='!mb-0'
                                labelClassName='min-w-[110px]'
                                isRequired={true}
                                prevField='gstIn'
                                nextField='stateInout'
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                            />
                            <CustomSelect
                                label='State In Out'
                                id='stateInout'
                                labelClass='starlabel min-w-[110px]'
                                value={formik.values.stateInout === '' ? null : { label: formik.values.stateInout, value: formik.values.stateInout }}
                                onChange={handleFieldChange}
                                options={[
                                    { value: 'Within state', label: 'Within state' },
                                    { value: 'Out of state', label: 'Out of state' },
                                ]}
                                isSearchable={false}
                                placeholder="Select an option"
                                disableArrow={false}
                                hidePlaceholder={false}
                                className="!h-6 rounded-sm"
                                isFocused={focused === "stateInout"}
                                onBlur={() => { formik.setFieldTouched('stateInout', true); setFocused(""); }}
                                onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                                    const dropdown = document.querySelector('.custom-select__menu');
                                    if (e.key === 'Enter') {
                                        (!dropdown) && e.preventDefault();
                                        document.getElementById('phoneNumber')?.focus();
                                    }
                                }}
                            />
                            <div className='flex gap-4'>
                                <FormikInputField
                                    label='Phone Number'
                                    id='phoneNumber'
                                    name='phoneNumber'
                                    maxLength={10}
                                    formik={formik}
                                    inputClassName=' border-l-0'
                                    labelClassName='min-w-[118px]'
                                    className='!gap-0 text-xs text-gray-600'
                                    isRequired={true}
                                    children={<span className='border border-solid border-gray-400 bg-gray-100 p-1 h-full select-none'>+91</span>}
                                    prevField='stateInout'
                                    nextField='mobileNumber'
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                                />
                                <FormikInputField
                                    label='Mobile Number'
                                    id='mobileNumber'
                                    name='mobileNumber'
                                    maxLength={10}
                                    formik={formik}
                                    inputClassName='!ml-0 border-l-0'
                                    labelClassName='min-w-[80px] mr-3'
                                    className='!gap-0 text-xs text-gray-600'
                                    isRequired={true}
                                    children={<span className='border border-solid border-gray-400 bg-gray-100 p-1 h-full select-none'>+91</span>}
                                    prevField='phoneNumber'
                                    nextField='panNumber'
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                                />
                            </div>
                            <FormikInputField
                                label='PAN Number'
                                id='panNumber'
                                name='panNumber'
                                formik={formik}
                                className='!mb-0'
                                labelClassName='min-w-[110px]'
                                isRequired={true}
                                prevField='mobileNumber'
                                nextField='emailId1'
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                            />
                            <FormikInputField
                                labelClassName='min-w-[110px] text-nowrap'
                                label='Email ID 1'
                                id='emailId1'
                                name='emailId1'
                                placeholder='abc@example.com'
                                formik={formik}
                                showErrorTooltip={formik.touched.emailId1 && formik.errors.emailId1}
                                prevField='panNumber'
                                nextField='emailId2'
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                            />
                            <FormikInputField
                                labelClassName='min-w-[110px] text-nowrap'
                                label='Email ID 2'
                                id='emailId2'
                                name='emailId2'
                                placeholder='abc@example.com'
                                formik={formik}
                                showErrorTooltip={formik.touched.emailId2 && formik.errors.emailId2}
                                prevField='emailId1'
                                nextField='emailId3'
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                            />
                            <FormikInputField
                                labelClassName='min-w-[110px] text-nowrap'
                                label='Email ID 3'
                                id='emailId3'
                                name='emailId3'
                                placeholder='abc@example.com'
                                formik={formik}
                                showErrorTooltip={formik.touched.emailId3 && formik.errors.emailId3}
                                prevField='emailId2'
                                nextField='purSaleAc'
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                            />
                            <CustomSelect
                                id='purSaleAc'
                                label='PUR/SALE ACC'
                                value={
                                    formik.values.purSaleAc === '' ? null : {
                                        label: formik.values.purSaleAc, value: formik.values.purSaleAc,
                                    }
                                }
                                onChange={handleFieldChange}
                                options={[
                                    { value: 'No', label: 'No' },
                                    { value: 'Yes', label: 'Yes' },
                                ]}
                                isSearchable={false}
                                placeholder=''
                                disableArrow={false}
                                hidePlaceholder={false}
                                labelClass='min-w-[110px]'
                                className='!rounded-none !h-6'
                                isFocused={focused === "purSaleAc"}
                                onBlur={() => { formik.setFieldTouched('purSaleAc', true); setFocused(""); }}
                                onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                                    const dropdown = document.querySelector('.custom-select__menu');
                                    if (e.key === 'Enter') {
                                        (!dropdown) && e.preventDefault();
                                        document.getElementById('submit_company')?.focus();
                                        setFocused('submit_company');
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className='w-full px-8 py-2'>
                    <Button
                        type='fill'
                        padding='px-4 py-2'
                        id='submit_company'
                        btnType='submit'
                        disable={!(formik.isValid && formik.dirty)}
                        // handleOnClick={() => {
                        //     setPopupState({
                        //         ...popupState,
                        //         isAlertOpen: true,
                        //         message: 'Company created successfully',
                        //     });
                        // }}
                        handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                            if (e.key === 'ArrowUp') {
                                e.preventDefault();
                            }
                        }}
                    >
                        {!!data.company_id ? 'Update' : 'Submit'}
                    </Button>
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
