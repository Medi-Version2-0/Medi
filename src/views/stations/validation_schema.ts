import * as Yup from 'yup';

export const stationValidationSchema = Yup.object({
  station_name: Yup.string()
    .required('Station name is required')
    .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
    .matches(
      /^[a-zA-Z0-9\s_.-]*$/,
      'Station name can contain alphanumeric characters, "-", "_", and spaces only'
    )
    .max(100, 'Station name cannot exceeds 100 characters'),
  state_code: Yup.string().required('Station state is required'),
  station_pinCode: Yup.string()
    .required('Station pincode is required')
    .matches(/^[0-9]+$/, 'Station pincode must contain only numbers')
    .min(6, 'Station pincode must be at least 6 characters long')
    .max(6, 'Station pincode cannot exceed 6 characters'),
});
