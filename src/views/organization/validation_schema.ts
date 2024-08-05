import * as Yup from 'yup';

export const userValidationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
});


export const organizationValidationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    pinCode: Yup.number().typeError('Pin code must be a number').test(
        'len',
        'Pin code must be exactly 6 digits',
        (val) => !val || val.toString().length === 6
    ),
    jurisdiction: Yup.string().required('Jurisdiction is required'),
    phoneNo1: Yup.number().typeError('Phone No 1 must be a number').test(
        'len',
        'Phone No 1 must be exactly 10 digits',
        (val) => !val || val.toString().length === 10
    ),
    phoneNo2: Yup.number().nullable().typeError('Phone No 2 must be a number').test(
        'len',
        'Phone No 2 must be exactly 10 digits',
        (val) => !val || val.toString().length === 10
    ),
    phoneNo3: Yup.number().nullable().typeError('Phone No 3 must be a number').test(
        'len',
        'Phone No 3 must be exactly 10 digits',
        (val) => !val || val.toString().length === 10
    ),
    contactEmail: Yup.string().matches(/^[a-zA-Z0-9._%]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/, 'Invalid email format'),
    drugLicenseNo20B: Yup.string().matches(/^[a-zA-Z]{2}-\d{6}-\d{5}-[a-zA-Z]{2}$/, 'Invalid Drug License Number format'),
    drugLicenseNo21B: Yup.string().matches(/^\d{2}-\d{6}-[a-zA-Z]$/, 'Invalid Drug License Number format'),
    gstNumber: Yup.string().matches(/^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z][a-zA-Z0-9]{1}[Z][a-zA-Z0-9]{1}$/, 'Invalid GST number format'),
    fssaiNumber: Yup.string().matches(/^(?:[a-zA-Z]{2}\.\d{6}\/?\d{0,4}\/?[a-zA-Z\d]{0,2})$/, 'Invalid FSSAI Number format'),
    CIN: Yup.string().matches(/^([LUu]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$/, 'Invalid  Company Identification Number format'),
    panNumber: Yup.string().matches(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]$/, 'Invalid PAN Card Number format'),
    tdsTanNumber: Yup.string().matches(/^[a-zA-Z]{4}\d{5}[a-zA-Z]$/, 'Invalid TAN Number format')
});