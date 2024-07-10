import * as Yup from 'yup';

export const phoneRegex = /^[6-9][0-9]{9}$/;
export const gstRegex =
/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}/;

export const getLedgerFormValidationSchema = (isSUNDRY: boolean) =>
  Yup.object({
    // general info VS
    partyName: Yup.string()
      .max(100, 'Party Name must be 100 characters or less')
      .required('Party Name is required'),
    accountGroup: Yup.string().required('Account group is required'),
    address1: Yup.string().max(50, 'Address 1 must be 50 characters or less'),

    address2: Yup.string().max(50, 'Address 2 must be 50 characters or less'),

    address3: Yup.string().max(50, 'Address 3 must be 50 characters or less'),
    mailTo: Yup.string().email('Invalid email'),
    openingBal: Yup.number().positive(
      'Opening Balance must be a positive number'
    ),
    openingBalType: isSUNDRY
      ? Yup.string().required('Opening Balance type is required')
      : Yup.string(),
    // contacts info VS
    phoneNumber: isSUNDRY
      ? Yup.string()
          .matches(phoneRegex, 'Invalid phone number')
          .required('Phone number is required')
      : Yup.string(),
    // gst data VS
    gstIn: isSUNDRY
      ? Yup.string()
          .required('GST number is required')
          .max(15, 'Not a valid GSTIN, Required 15 character')
          .matches(gstRegex, 'GST number is not valid')
          .required('GST number is required')
      : Yup.string(),
    panCard: Yup.string().matches(panRegex, 'Invalid Pan Card Number'),
    // contact info VS
    emailId1: Yup.string().email('Invalid email'),
    emailId2: Yup.string().email('Invalid email'),
    drugLicenceNo1: Yup.string().required('Drug Licence No. 1 is required'),
    drugLicenceNo2: Yup.string().required('Drug Licence No. 2 is required'),
    //license info VS
    // bank details VS
    accountHolderName: Yup.string().max(
      50,
      'Account Holder Name must be 50 characters or less'
    ),
  });