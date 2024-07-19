import * as Yup from 'yup';

export const storeValidationSchema = Yup.object({
  store_name: Yup.string()
    .required('Store name is required')
    .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
    .matches(
      /^[a-zA-Z0-9\s_.-]*$/,
      'Store name can contain alphanumeric characters, "-", "_", and spaces only'
    )
    .max(100, 'Store name cannot exceeds 100 characters'),
});
