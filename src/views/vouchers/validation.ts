import * as Yup from 'yup';

export const gridDataSchema = Yup.array().of(
    Yup.object().shape({
    partyId: Yup.number().required('Party ID cannot be empty'),
    amount: Yup.number()
        .required('Amount cannot be empty')
        .positive('Amount must be a positive number')
        .test('is-not-nan', 'Amount cannot be NaN', value => !isNaN(value)),
    })
)

export const validateValue = (value: string, decimalPlaces: number, settingPopupState: (state: boolean, message: string) => void) => {
    if (!value.startsWith('0.') && !value.includes('.')) {
      value = value.replace(/^0+(?=\d)/, '');
    }
    const validAmount = new RegExp(`^[0-9]*\\.?[0-9]{0,${decimalPlaces}}$`);
  
    if (!validAmount.test(value)) {
      settingPopupState(false, `Error: Value can only contain numbers and up to ${decimalPlaces} decimal places.`);
      return false;
    }
  
    return true;
  };