import * as Yup from 'yup';

export const phoneRegex = /^[6-9][0-9]{9}$/;
export const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}/;
export const decimalRegex = /^\d+(\.\d{0,2})?$/;
export const expiryDate = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
export const drugLicenceNo = /^\d{2,5}\/\d{2,5}$/;

export const getLedgerFormValidationSchema = () =>
  Yup.object({
    partyName: Yup.string()
    .required('Party Name is required')
    .matches(/^(?!\d+$).+/, 'Only Numbers not allowed')
    .max(100, 'Party Name must be 100 characters or less'),
    station_id:Yup.number().required(),
    accountGroup: Yup.string().required('Account group is required'),
    address1: Yup.string().max(50, 'Address 1 must be 50 characters or less'),
    address2: Yup.string().max(50, 'Address 2 must be 50 characters or less'),
    address3: Yup.string().max(50, 'Address 3 must be 50 characters or less'),
    mailTo: Yup.string().email('Invalid email'),
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
    openingBalType: Yup.string(),
    phoneNumber: Yup.string(),
    gstIn: Yup.string().matches(gstRegex,'Invalid GST Identification Number'),
    panCard: Yup.string().matches(panRegex, 'Invalid Pan Card Number'),
    drugLicenceNo1: Yup.string().matches(drugLicenceNo, 'Invalid Drug License Number'),
    licenceExpiry: Yup.string().matches(expiryDate, 'Invalid Expiry Date'),
    emailId1: Yup.string().email('Invalid email'),
    emailId2: Yup.string().email('Invalid email'),
    drugLicenceNo2: Yup.string().matches(drugLicenceNo, 'Invalid Drug License Number'),
    accountHolderName: Yup.string().max(50, 'Account Holder Name must be 50 characters or less'),
  });