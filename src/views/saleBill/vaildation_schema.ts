import * as Yup from 'yup';

export const saleBillFormValidations = Yup.object({
  billBookSeriesId: Yup.string().required('Please select the bill series'),
  oneStation: Yup.string().required('Please select whether a Bill is for one station or for all stations'),
  stationId: Yup.string().when('oneStation', (oneStation: unknown, schema) => {
    return (typeof oneStation === 'string' && oneStation === 'One Station')
      ? schema.required('Choose the station first')
      : schema;
  }),  
  partyId: Yup.string().required('Choose the party...'),
  terms: Yup.string().required('Choose the mode of payment...'),
  invoiceNumber: Yup.string()
    .required('Please write the Invoice Number.')
    .matches(/^[A-Za-z]{2}[0-9]{6}$/, 'Invoice Number must start with 2 characters followed by 6 digits')
    .length(8, 'Invoice Number must contain exactly 8 characters'),
  drugLicenceNo1: Yup.string().length(18, 'Drug License number must be exactly 18 characters'),
  grNo: Yup.string().max(6, 'Gr number doesnot exceeds 6 characters'),
  psNo: Yup.string().max(10, 'Packing slip number doesnot exceeds 10 characters'),
});
