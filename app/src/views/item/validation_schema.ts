import * as Yup from 'yup';

export const phoneRegex = /^[6-9][0-9]{9}$/;
export const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const itemFormValidations = () =>
  Yup.object({
    name: Yup.string()
      .max(100, 'Item Name must be 100 characters or less')
      .required('Item Name is required'),
    packing: Yup.string()
      .max(7, 'Packing must be 7 characters or less')
      .required('Packing is required'),
    shortName: Yup.string()
      .max(8, 'MFG code must be 8 characters or less')
      .required('MFG code is required'),
    hsnCode: Yup.number()
      // .max(8, 'HSN code must be 8 characters or less')
      .required('HSN code is required'),
    discountPer: Yup.number().required('Discount Percentage is required'),
    minQty: Yup.number()
      .max(999999, 'Minimum Quantity must be 6 digits or less')
      .required('Minimum Quantity is required'),
    maxQty: Yup.number()
      .max(999999, 'Maximum Quantity must be 6 digits or less')
      .moreThan(
        Yup.ref('minQty'),
        'Maximum Quantity must be more than Minimum Quantity'
      )
      .required('Maximum Quantity is required'),
    location: Yup.string().max(10, 'Location must be 10 characters or less'),
  });
