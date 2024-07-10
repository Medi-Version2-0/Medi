import * as Yup from 'yup';

export const phoneRegex = /^[6-9][0-9]{9}$/;
export const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}/;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const getCompanyFormSchema = () => Yup.object({
  // general info
  companyName: Yup.string()
    .max(100, 'Company Name must be 100 characters or less')
    .required('Company Name is required'),

  shortName: Yup.string()
  .max(8, 'MFG code must be 8 characters or less')
  .required('MFG code is required'),

  address1: Yup.string()
    .max(50, 'Address 1 must be 50 characters or less'),

  address2: Yup.string()
    .max(50, 'Address 2 must be 50 characters or less'),

  address3: Yup.string()
    .max(50, 'Address 3 must be 50 characters or less'),

  openingBal: Yup.number()
    .positive('Opening Balance must be a positive number'),

  discPercent: Yup.number()
    .positive('Discount Percent must be a positive number'),

  gstIn: Yup.string()
    .matches(gstRegex, 'Invalid GSTIN')
    .required('GSTIN is required'),

  drugLicenceNo1: Yup.string()
    .required('Drug Licence No. 1 is required'),

  phoneNumber: Yup.string()
    .matches(phoneRegex, 'Invalid Phone Number'),
    
  panNumber: Yup.string()
  .matches(panRegex, 'Invalid Pan Card Number'),

  emailId1: Yup.string()
    .email('Invalid Email ID')
    .max(25, 'Email ID 1 must be 25 characters or less'),

  emailId2: Yup.string()
    .email('Invalid Email ID')
    .max(25, 'Email ID 2 must be 25 characters or less'),

  emailId3: Yup.string()
    .email('Invalid Email ID')
    .max(25, 'Email ID 3 must be 25 characters or less'),
});