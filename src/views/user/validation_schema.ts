import * as Yup from 'yup';

export const userValidationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    city: Yup.string().required('City is required'),
    pinCode: Yup.string().matches(/^\d{6}$/, 'Pincode number must be exactly 6 digits'),
    phoneNumber: Yup.string()
        .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
        .required('Phone number is required'),
    altPhoneNumber: Yup.string()
        .matches(/^\d{10}$/, 'Alternate phone number must be exactly 10 digits'),
    aadharNumber: Yup.string()
        .matches(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits')
});
