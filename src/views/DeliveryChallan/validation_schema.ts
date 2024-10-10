import * as Yup from 'yup';


type CustomStringSchema = Yup.StringSchema<string | undefined, Yup.AnyObject>;

export const saleChallanFormValidations = Yup.object({
    oneStation: Yup.string()
        .required('Please select whether a challan is for one station or for all stations'),
    stationId: Yup.string().when('oneStation', {
        is: (value: any) => value === 'One Station', 
        then: (schema) => schema.required('Select a station first...') as CustomStringSchema,
        otherwise: (schema) => schema.nullable() as CustomStringSchema,
    }),
    partyId: Yup.string().required('Choose the party...'),
    challanNumber: Yup.string()
    .required('Please write the Challan Number.')
    .matches(/^[A-Za-z]{2}[0-9]{6}$/, 'Challan Number must start with 2 characters followed by 6 digits')
    .length(8, 'Challan Number must contain exactly 8 characters'),
});
export const dateSchema = Yup.string()
    .matches(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Expiry date must be valid with format MM/YYYY')
    .test('future-date', 'Expiry date must be greater than current date', (value) => {
        if (!value) return true;
        const [month, year] = value.split('/').map(Number);
        return new Date(year, month - 1) > new Date();
    })