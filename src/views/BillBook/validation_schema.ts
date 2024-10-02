import * as Yup from 'yup';

export const billBookValidationSchema = (editing: boolean) =>
  Yup.object({
    billName: Yup.string()
      .required('Bill name is required')
      .matches(/[a-zA-Z]/, 'Only Numbers and only special characters are not allowed')
      .matches(
        /^[a-zA-Z0-9\s_.-]*$/,
        'Bill name can contain alphanumeric characters, "-", "_", and spaces only'
      )
      .max(100, 'Station name cannot exceed 100 characters'),
    billBookPrefix: editing
      ? Yup.string()
        .required('Prefix is required')
        .matches(/^[A-Za-z]*$/, 'Only alphabets are allowed')
      : Yup.string()
        .required('Prefix is required')
        .matches(/^[A-Za-z]*$/, 'Only alphabets are allowed'),
    orderOfBill: Yup.string().nullable().matches(
      /^[0-9]*$/,
      'Only numeric values are allowed'
    ),
    company: Yup.string(),
    billType: Yup.string(),
    locked: Yup.string()
  });
