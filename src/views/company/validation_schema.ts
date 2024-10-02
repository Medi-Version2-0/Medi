import * as Yup from 'yup';
import { gstRegex } from '../ledger/validation_schema';

export const phoneRegex = /^[6-9][0-9]{9}$/;
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}/;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const decimalRegex = /^\d+(\.\d{0,2})?$/;

export const getCompanyFormSchema = Yup.object({
  // general info
  companyName: Yup.string()
    .max(100, 'Company Name must be 100 characters or less')
    .required('Company Name is required'),

  shortName: Yup.string().max(8, 'MFG code must be 8 characters or less'),

  address1: Yup.string().max(50, 'Address 1 must be 50 characters or less'),

  address2: Yup.string().max(50, 'Address 2 must be 50 characters or less'),

  address3: Yup.string().max(50, 'Address 3 must be 50 characters or less'),

  stationId: Yup.string().required(),
  stateInOut: Yup.string().required(),

  openingBal: Yup.number()
    .nullable()
    .test(
      'is-valid',
      'Opening Balance must be a positive number with at most two decimal places',
      value => {
        if (value === undefined || value === null) return true;
        return decimalRegex.test(value.toString()) && value >= 0;
      }
    )
    .min(0, 'Opening Balance must be at least 0'),

  openingBalType: Yup.string()
  .oneOf(['Dr', 'Cr'], 'Opening Balance Type must be either "Dr" or "Cr"'),

  discPercent: Yup.number()
    .nullable()
    .test(
      'is-valid',
      'Discount Percent must be a positive number with at most two decimal places',
      value => {
        if (value === null || value === undefined) return true;
        return decimalRegex.test(value.toString()) && value >= 0;
      }
    ),

  gstIn: Yup.string().matches(gstRegex,'Invalid GST Identification Number'),

  phoneNumber: Yup.string().matches(phoneRegex, 'Invalid Phone Number'),

  panNumber: Yup.string().matches(panRegex, 'Invalid Pan Card Number'),

  salesId: Yup.string().required('Sales Account is required'),

  purchaseId: Yup.string().required('Purchase Account is required'),

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
