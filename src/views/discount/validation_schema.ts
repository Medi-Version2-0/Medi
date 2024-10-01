import * as Yup from 'yup';
export const decimalRegex = /^\d+(\.\d{0,2})?$/;

export const discountValidationSchema = Yup.object({
  partyId: Yup.string().required('Party name is required'),
  discountType: Yup.string().required('Discount type is required'),
  companyId: Yup.string()
    .when('discountType', {
      is: (discountType: string) =>{
        return !['allCompanies'].includes(discountType)
      },
      then: (schema) => schema.required('Company ID is required for these discount types'),
      otherwise: (schema) => schema.nullable(),
    }),
  discount: Yup.number().min(0, 'Discount must be positive').required('Discount is required'),
});

export const getDiscountFormSchema = Yup.object({

  discount: Yup.number()
    .nullable()
    .test(
      'is-valid',
      'Discount must be a positive number with at most two decimal places',
      value => {
        if (value === undefined || value === null) return true;
        return decimalRegex.test(value.toString()) && value >= 0;
      }
    )
  })