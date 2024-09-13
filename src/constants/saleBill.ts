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

export const partyFooterData:any[] = [
  {
    label: 'Address',
    data: [
      {
        label: 'Party Name',
        key: 'partyName'
      },
      {
        label: 'Address 1',
        key: 'address1'
      },
      {
        label: 'Address 2',
        key: 'address2'
      },
      {
        label: 'Address 3',
        key: 'address3'
      },
    ]
  },
  {
    label: 'License Info',
    data: [
      {
        label: 'Party Name',
        key: 'partyName'
      },
    ]
  },
  {
    label: 'OtherInfo',
    data: [
      {
        label: 'Party Name',
        key: 'partyName'
      },
      {
        label: 'Country',
        key: 'country'
      },
      {
        label: 'PinCode',
        key: 'pinCode'
      },
      {
        label: 'Station Name',
        key: 'station_name'
      },
    ]
  },
  {
    label: 'Current Status',
    data: [
      {
        label: 'Opening',
        key: 'openingBalType'
      },
      {
        label: 'Credit',
        key: 'openingBalType'
      },
      {
        label: 'Debit',
        key: 'openingBalType'
      },
      {
        label: 'Balance',
        key: 'openingBalType'
      },
    ]
  },
];