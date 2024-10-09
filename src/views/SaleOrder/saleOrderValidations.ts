import * as Yup from 'yup';

// Define the regex for DD/MM/YYYY format
const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

export const saleBillFormValidations = Yup.object({
  date: Yup.string()
    .matches(dateRegex, 'Invalid date format. Expected format: DD/MM/YYYY')
});
