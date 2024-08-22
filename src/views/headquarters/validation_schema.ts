import * as Yup from 'yup';

export const headQuarterValidationSchema = Yup.object({
  station_name: Yup.string()
    .required('Station name is required')
    .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
    .matches(
      /^[a-zA-Z0-9\s_.-]*$/,
      'Station name can contain alphanumeric characters, "-", "_", and spaces only'
    )
    .max(100, 'Station name cannot exceed 100 characters'),
  station_headQuarter: Yup.string().required(
    'Station HeadQuarter is required.'
  ),
});