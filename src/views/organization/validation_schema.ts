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
    // phoneNo1: Yup.number().required('Phone No 1 is required').typeError('Phone No 1 must be a number').test(
    //     'len',
    //     'Phone No 1 must be exactly 10 digits',
    //     (val) => !val || val.toString().length === 10
    // ),
    // phoneNo2: Yup.number().nullable().typeError('Phone No 2 must be a number').test(
    //     'len',
    //     'Phone No 2 must be exactly 10 digits',
    //     (val) => !val || val.toString().length === 10
    // ),
    // phoneNo3: Yup.number().nullable().typeError('Phone No 3 must be a number').test(
    //     'len',
    //     'Phone No 3 must be exactly 10 digits',
    //     (val) => !val || val.toString().length === 10
    // ),
    // contactEmail: Yup.string().email('Invalid email format').required('Contact Email is required'),
    // drugLicenseNo20B: Yup.string().nullable().test(
    //     'len',
    //     'Drug License No 20B must be exactly 20 characters',
    //     (val) => !val || val.length === 20
    // ),
    // drugLicenseNo21B: Yup.string().nullable().test(
    //     'len',
    //     'Drug License No 21B must be exactly 20 characters',
    //     (val) => !val || val.length === 20
    // ),
    // gstNumber: Yup.string().nullable().test(
    //     'len',
    //     'GST Number must be exactly 15 characters',
    //     (val) => !val || val.length === 15
    // ),
    // fssaiNumber: Yup.string().nullable().test(
    //     'len',
    //     'FSSAI Number must be exactly 14 characters',
    //     (val) => !val || val.length === 14
    // ),
    // corporateIdNumber: Yup.string().nullable(),
    // panNumber: Yup.string().nullable().test(
    //     'len',
    //     'PAN Number must be exactly 10 characters',
    //     (val) => !val || val.length === 10
    // ),
    // tdsTanNumber: Yup.string().nullable().test(
    //     'len',
    //     'TDS TAN Number must be exactly 10 characters',
    //     (val) => !val || val.length === 10
    // )
});