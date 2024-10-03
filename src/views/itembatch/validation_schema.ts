import * as yup from 'yup';

export const batchSchema = yup.object().shape({
    locked: yup
        .string()
        .required('Lock Batch is required')
        .oneOf(['Y', 'N', 'y', 'n'], 'Please enter either "Y" for Yes or "N" for "No" for Locked field.'),
    mrp: yup
        .number()
        .required('MRP is required')
        .test('mrp-valid', 'MRP must be greater than or equal to purchase price', function (value, context) {
            const { salePrice, salePrice2 } = context.parent;
            if (salePrice2 === undefined || salePrice === undefined) return true;
            if (salePrice2 !== null) {
                return value >= salePrice && value >= salePrice2;
            }
            return value >= salePrice;
        }),
    salePrice2: yup
        .number()
        .notRequired()
        .test('sale-price2-valid', 'Sale price 2 must be greater than or equal to purchase price', function (value, context) {
            const purPrice = context.parent.purPrice;
            if (purPrice === undefined || value === undefined || value === null) return true;
            return value >= purPrice;
        }),
    salePrice: yup
        .number()
        .required('Sale price is required')
        .test('sale-price-valid', 'Sale price must be greater than or equal to purchase price', function (value, context) {
            const purPrice = context.parent.purPrice;
            if (purPrice === undefined) return true;
            return value >= purPrice;
        }),
    salePrice3: yup
        .number()
        .notRequired()
        .test('sale-price3-valid', 'Sale price 3 must be greater than or equal to purchase price', function (value, context) {
            const purPrice = context.parent.purPrice;
            if (purPrice === undefined || value === undefined || value === null) return true;
            return value >= purPrice;
        }),
    salePrice4: yup
        .number()
        .notRequired()
        .test('sale-price4-valid', 'Sale price4 must be greater than or equal to purchase price', function (value, context) {
            const purPrice = context.parent.purPrice;
            if (purPrice === undefined || value === undefined || value === null) return true;
            return value >= purPrice;
        }),
    salePrice5: yup
        .number()
        .notRequired()
        .test('sale-price5-valid', 'Sale price 5 must be greater than or equal to purchase price', function (value, context) {
            const purPrice = context.parent.purPrice;
            if (purPrice === undefined || value === undefined || value === null) return true;
            return value >= purPrice;
        }),
    purPrice: yup.number().required('Purchase price is required'),
    opFree: yup.number().notRequired(),
    opBalance: yup.number().required('Opening Stock is required'),
    expiryDate: yup
        .string()
        .required('Expiry date is required')
        .matches(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Expiry date must be valid with format MM/YYYY')
        .test('future-date', 'Expiry date must be greater than current date', (value) => {
            if (!value) return true;
            const [month, year] = value.split('/').map(Number);
            return new Date(year, month - 1) > new Date();
        }),
    mfgCode: yup.string().notRequired(),
    batchNo: yup.string().required('Batch Number is required').max(100, 'Batch number cannot exceed 100 characters'),
    godownStocks: yup.number().notRequired(),
});

export const validatePrices = (newBatch: any) => {
    const { mrp, purPrice, salePrice, salePrice2 } = newBatch;
    if (mrp !== null && purPrice !== null && mrp < purPrice) {
        throw new Error('MRP must be greater than or equal to purchase price');
    }

    if (mrp !== null && purPrice !== null && purPrice > mrp) {
        throw new Error('Purchase price must be less than or equal to mrp');
    }

    if (mrp !== null && salePrice !== null && mrp < salePrice) {
        throw new Error('Sale price must be less than or equal to mrp');
    }

    if (mrp !== null && salePrice2 !== null && mrp < salePrice2) {
        throw new Error('Sale price 2 must be less than or equal to mrp');
    }

    if (salePrice !== null && purPrice !== null && salePrice < purPrice) {
        throw new Error('Sale price must be greater than or equal to purchase price');
    }

    if (salePrice2 !== null && purPrice !== null && salePrice2 < purPrice) {
        throw new Error('Sale price 2 must be greater than or equal to purchase price');
    }
}