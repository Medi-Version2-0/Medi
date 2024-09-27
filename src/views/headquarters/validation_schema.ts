import * as Yup from 'yup';

export const headQuarterValidationSchema = Yup.object({
  station_id: Yup.string().required('Station name is required.'),
  station_headQuarter: Yup.string().required('Station HeadQuarter is required.'),
});