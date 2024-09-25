import { Option } from '../interface/global';

export const radioValues: Option[] = [
  { id: 1, label: 'select All', value: 'selectAll' },
  { id: 2, label: 'No of Items', value: 'noOfItems' },
  { id: 3, label: 'Select By *', value: 'selectOne' },
  { id: 4, label: 'Select by Challan Number', value: 'choiceByChallanNo' },
  { id: 4, label: 'Start From New', value: 'startFromNew' },
];
export const discoutTypeOptions: Option[] = [
  { id: 1, label: 'Zero Discount', value: 'Zero Discount' },
  { id: 2, label: 'Auto Discount', value: 'Auto Discount' },
  { id: 3, label: 'Percent Discount', value: 'Percent Discount' },
];