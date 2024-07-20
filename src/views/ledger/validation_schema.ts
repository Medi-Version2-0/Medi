import * as Yup from 'yup';

export const phoneRegex = /^[6-9][0-9]{9}$/;
export const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}/;

export const getLedgerFormValidationSchema = Yup.object({
  // general info VS
  partyName: Yup.string()
    .max(100, 'Party Name must be 100 characters or less')
    .required('Party Name is required')
    .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
    .matches(
      /^[a-zA-Z0-9\s_.-]*$/,
      'Station name can contain alphanumeric characters, "-", "_", and spaces only'
    ),
  accountGroup: Yup.string().required('Account group is required'),
  address1: Yup.string().max(50, 'Address 1 must be 50 characters or less'),

  address2: Yup.string().max(50, 'Address 2 must be 50 characters or less'),

  address3: Yup.string().max(50, 'Address 3 must be 50 characters or less'),
  mailTo: Yup.string().email('Invalid email'),
  openingBal: Yup.number().positive(
    'Opening Balance must be a positive number'
  ),
  openingBalType: Yup.string(),
  // contacts info VS
  phoneNumber: Yup.string(),
  // gst data VS
  gstIn: Yup.string().matches(gstRegex, 'Invalid GSTIN'),
  panCard: Yup.string().matches(panRegex, 'Invalid Pan Card Number'),
  // contact info VS
  emailId1: Yup.string().email('Invalid email'),
  emailId2: Yup.string().email('Invalid email'),
  drugLicenceNo1: Yup.string(),
  drugLicenceNo2: Yup.string(),
  //license info VS
  // bank details VS
  accountHolderName: Yup.string().max(
    50,
    'Account Holder Name must be 50 characters or less'
  ),
});
