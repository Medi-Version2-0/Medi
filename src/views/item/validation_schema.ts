import * as Yup from 'yup';

export const itemFormValidations = Yup.object({
  name: Yup.string()
    .max(250, 'Item Name must be 100 characters or less')
    .required('Item Name is required'),
  // compId: Yup.number().required('Choose the company.'),
  packing: Yup.string().max(7, 'Packing must be 7 characters or less'),
  shortName: Yup.string().max(8, 'MFG code must be 8 characters or less').nullable(),
  hsnCode: Yup.string().required()
    .min(4, 'HSN code must be at least 4 digits')
    .max(8, 'HSN code must be 8 digits or less'),
  minQty: Yup.number().nullable(),
  maxQty: Yup.number().nullable().max(999999, 'Maximum Quantity must be 6 digits or less')
    .test( 'more-than-min-qty', 'Maximum Quantity must be more than Minimum Quantity',
      function (value) {
        const minQty = this.parent.minQty;
        if (minQty == null || value == null) return true;
        return Number(value) > Number(minQty);
      }
    ),
    itemGroupCode: Yup.string(),
    saleAccId: Yup.string(),
    purAccId: Yup.string(),
    rackNumber: Yup.string().max(50, 'Rack Number must be 50 characters or less'),
});