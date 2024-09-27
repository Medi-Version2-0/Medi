import FormikInputField from '../common/FormikInputField';
interface FssaiNumberProps {
  formik?: any;
}
export const FssaiNumber: React.FC<FssaiNumberProps> = ({
  formik,
}) => {

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const validValue = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = validValue;
    formik.setFieldValue(e.target.name,validValue);
  }

  return (
    <div className='flex flex-col gap-x-4 gap-y-2 w-1/2 px-2 m-2 text-xs leading-3 text-gray-600'>
      <FormikInputField
        isPopupOpen={false}
        labelClassName='min-w-[90px]'
        label='FSSAI Number'
        id='fssaiNumber'
        name='fssaiNumber'
        onChange={handleChange}
        maxLength={14}
        formik={formik}
        prevField='FSSAI_Number'
        nextField={formik.isValid ? "submit_all" : "partyName"}
      />
    </div>
  );
};