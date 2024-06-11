import * as Yup from 'yup';

export const phoneRegex = /^[6-9][0-9]{9}$/;
export const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const getLedgerFormValidationSchema = (isSUNDRY: boolean) => Yup.object({
  // general info VS
  partyName: Yup.string()
    .max(100, 'Party Name must be 100 characters or less')
    .required('Party Name is required'),
  accountGroup: Yup.string().required('Account group is required'),
  country: isSUNDRY ? Yup.string().required('Country is required') : Yup.string(),
  state: isSUNDRY ? Yup.string().required('State is required') : Yup.string(),
  stationName: isSUNDRY ? Yup.string().required('Station is required') : Yup.string(),
  mailTo: Yup.string().email('Invalid email'),
  pinCode: isSUNDRY ? Yup.string()
    .matches(/^[0-9]+$/, 'PIN code must be a number')
    .matches(/^[1-9]/, 'PIN code must not start with zero')
    .matches(/^[0-9]{6}$/, 'PIN code must be exactly 6 digits')
    : Yup.string(),
  //balance 
  openingBalType: isSUNDRY ? Yup.string().required("Opening Balance type is required") : Yup.string(),
  // contacts info VS
  phoneNumber: isSUNDRY ? Yup.string()
    .matches(phoneRegex, 'Invalid phone number')
    .required('Phone number is required')
    : Yup.string(),
  // gst data VS
  gstIn: isSUNDRY ? Yup.string()
    .required('GST number is required')
    .max(15, 'Not a valid GSTIN, Required 15 character')
    // .matches(gstRegex, 'GST number is not valid')
    .required('GST number is required')
    : Yup.string(),
  // contact info VS
  emailId1: Yup.string().email('Invalid email'),
  emailId2: Yup.string().email('Invalid email'),
  //license info VS
  // bank details VS
  accountHolderName: Yup.string().max(
    100,
    'Account Holder Name must be 50 characters or less'
  ),

});
