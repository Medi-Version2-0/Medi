import * as Yup from 'yup';

export const subgroupValidationSchema = Yup.object({
  group_name: Yup.string()
    .required('Group name is required')
    .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
    .matches(
      /^[a-zA-Z0-9\s_.-]*$/,
      'Group name can contain alphanumeric characters, "-", "_", and spaces only'
    )
    .max(100, 'Group name cannot exceeds 100 characters'),
  parent_code: Yup.string().required('Parent Group is required'),
  igst_sale: Yup.string().oneOf(
    ['yes', 'no'],
    'IGST sale must be either "yes" or "no"'
  ),
});
