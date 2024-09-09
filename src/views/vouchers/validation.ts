import * as Yup from 'yup';

export const gridDataSchema = Yup.array().of(
    Yup.object().shape({
    partyId: Yup.number().required('Party ID cannot be empty'),
    amount: Yup.number()
        .required('Amount cannot be empty')
        .positive('Amount must be a positive number')
        .test('is-not-nan', 'Amount cannot be NaN', value => !isNaN(value)),
    })
)