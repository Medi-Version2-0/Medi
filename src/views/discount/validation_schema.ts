import * as Yup from 'yup';

export const discountValidationSchema = Yup.object({
  partyId: Yup.number().required('Party name is required'),
  discountType: Yup.string().required('Discount type is required'),
  companyId: Yup.number()
    .when('discountType', {
      is: (discountType: string) =>{
        return !['allCompanies'].includes(discountType)
      },
      then: (schema) => schema.required('Company ID is required for these discount types'),
      otherwise: (schema) => schema.nullable(),
    }),
  discount: Yup.number().min(0, 'Discount must be positive').required('Discount is required'),
});
