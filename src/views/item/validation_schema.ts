import * as Yup from 'yup';

export const phoneRegex = /^[6-9][0-9]{9}$/;
export const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const itemFormValidations = Yup.object({
  name: Yup.string()
    .max(100, 'Item Name must be 100 characters or less')
    .required('Item Name is required'),
  compId: Yup.number().required('Choose the compnay.'),
  packing: Yup.string().max(7, 'Packing must be 7 characters or less'),
  shortName: Yup.string().max(8, 'MFG code must be 8 characters or less').nullable(),
  hsnCode: Yup.string().max(8, 'HSN code must be 8 characters or less'),
  minQty: Yup.number().nullable(),
  maxQty: Yup.number()
    .nullable()
    .max(999999, 'Maximum Quantity must be 6 digits or less')
    .test(
      'more-than-min-qty',
      'Maximum Quantity must be more than Minimum Quantity',
      function (value) {
        const minQty = this.parent.minQty;
        if (minQty == null || value == null) {
          return true;
        }
        return Number(value) > Number(minQty);
      }
    ),
  itemGroupCode: Yup.string(),
  saleAccId: Yup.string(),
  purAccId: Yup.string()
});
