import NumberInput from '../common/numberInput/numberInput';

interface FssaiNumberProps {
  formik?: any;
}
export const FssaiNumber: React.FC<FssaiNumberProps> = ({
  formik,
}) => {
  return (
    <div className='flex flex-col gap-x-4 gap-y-2 w-1/2 px-2 m-2 text-xs leading-3 text-gray-600'>
      <NumberInput
        label='FSSAI Number'
        value={formik.values.fssaiNumber}
        id='fssaiNumber'
        name='fssaiNumber'
        maxLength={14}
        onChange={(value) => formik.setFieldValue('fssaiNumber', value)}
        onBlur={() => {
          formik.setFieldTouched('fssaiNumber', true);
        }}
        error={formik.touched.fssaiNumber && formik.errors?.fssaiNumber}
        isRequired={false}
        labelClassName='min-w-[90px]'
        prevField='FSSAI_Number'
        nextField={formik.isValid ? "submit_all" : "partyName"}
        inputClassName='text-left !text-[10px] px-1'
      />
    </div>
  );
};