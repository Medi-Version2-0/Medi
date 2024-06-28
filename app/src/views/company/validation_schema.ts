import * as Yup from 'yup';

export const phoneRegex = /^[6-9][0-9]{9}$/;
export const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const getCompanyFormSchema = () =>
  Yup.object({
    // general info VS
    companyName: Yup.string()
      .max(100, 'Company Name must be 100 characters or less')
      .required('Company Name is required'),
  });
