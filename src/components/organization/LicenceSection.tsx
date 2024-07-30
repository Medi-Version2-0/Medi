import FormikInputField from '../common/FormikInputField';

const LicencseSection = ({ formik }: any) => {
    return (
        <div className='flex flex-col gap-4'>
            <FormikInputField
                autoFocus={true}
                label='Drug License No 20B'
                id='drugLicenseNo20B'
                name='drugLicenseNo20B'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='drugLicenseNo21B'
                prevField='contactEmail'
                showErrorTooltip={
                    !!(formik.touched.drugLicenseNo20B && formik.errors.drugLicenseNo20B)
                }
            />
            <FormikInputField
                label='Drug License No 21B'
                id='drugLicenseNo21B'
                name='drugLicenseNo21B'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='gstNumber'
                prevField='drugLicenseNo20B'
                showErrorTooltip={
                    !!(formik.touched.drugLicenseNo21B && formik.errors.drugLicenseNo21B)
                }
            />
            <FormikInputField
                label='GST Number'
                id='gstNumber'
                name='gstNumber'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='fssaiNumber'
                prevField='drugLicenseNo21B'
                showErrorTooltip={
                    !!(formik.touched.gstNumber && formik.errors.gstNumber)
                }
            />
            <FormikInputField
                label='FSSAI Number'
                id='fssaiNumber'
                name='fssaiNumber'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='corporateIdNumber'
                prevField='gstNumber'
                isUpperCase={true}
                isTitleCase={false}
                showErrorTooltip={
                    !!(formik.touched.fssaiNumber && formik.errors.fssaiNumber)
                }
            />
            <FormikInputField
                label='Corporate ID Number'
                id='corporateIdNumber'
                name='corporateIdNumber'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='panNumber'
                prevField='fssaiNumber'
                showErrorTooltip={
                    !!(formik.touched.corporateIdNumber && formik.errors.name)
                }
            />
            <FormikInputField
                label='PAN Number'
                id='panNumber'
                name='panNumber'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='tdsTanNumber'
                prevField='corporateIdNumber'
                showErrorTooltip={
                    !!(formik.touched.panNumber && formik.errors.panNumber)
                }
            />
            <FormikInputField
                label='TDS/TAN Number'
                id='tdsTanNumber'
                name='tdsTanNumber'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                prevField='panNumber'
                nextField='submit_all'
                showErrorTooltip={
                    !!(formik.touched.tdsTanNumber && formik.errors.tdsTanNumber)
                }
            />
        </div>
    )
};

export default LicencseSection;