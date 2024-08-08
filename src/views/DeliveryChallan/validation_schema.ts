import * as Yup from 'yup';

export const saleChallanFormValidations = Yup.object({
    oneStation: Yup.string()
        .required('Please select whether a challan is for one station or for all stations'),
    stationId: Yup.string().required('Select a station first...'),
    partyId: Yup.string().required('Choose the party...'),
});

export const dateSchema = Yup.string()
    .matches(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Expiry date must be valid with format MM/YYYY')
    .test('future-date', 'Expiry date must be greater than current date', (value) => {
        if (!value) return true;
        const [month, year] = value.split('/').map(Number);
        return new Date(year, month - 1) > new Date();
    })