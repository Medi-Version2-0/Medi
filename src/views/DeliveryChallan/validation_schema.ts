import * as Yup from 'yup';

export const saleChallanFormValidations = Yup.object({
    oneStation: Yup.string()
    .required('Please select whether a challan is for one station or for all stations'),
    stationId: Yup.string().required('Select a station first...'),
    partyId: Yup.string().required('Choose the party...'),
});
