import * as Yup from 'yup';

export const saleBillFormValidations = Yup.object({
    oneStation: Yup.string()
        .required('Please select whether a challan is for one station or for all stations'),
    stationId: Yup.string().required('Select a station first...'),
    partyId: Yup.string().required('Choose the party...'),
    invoiceNumber: Yup.string()
    .required('Please write the Invoice Number.')
    .matches(/^[A-Za-z]{2}[0-9]{6}$/, 'Invoice Number must start with 2 characters followed by 6 digits')
    .max(8, 'Invoice Number must contain exactly 8 characters')
    .min(8, 'Invoice Number must contain exactly 8 characters')
});

