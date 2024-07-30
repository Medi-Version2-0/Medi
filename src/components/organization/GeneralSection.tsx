import FormikInputField from "../common/FormikInputField"

const GeneralSection = ({ formik }: any) => {
    return (
        <div className="flex flex-col gap-4">
            <FormikInputField
                label='Name'
                id='name'
                name='name'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='address'
                prevField='name'
                autoFocus={true}
                showErrorTooltip={
                    !!(formik.touched.name && formik.errors.name)
                }
            />
            <FormikInputField
                label='Address'
                id='address'
                name='address'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='city'
                prevField='name'
                showErrorTooltip={
                    !!(formik.touched.address && formik.errors.address)
                }
            />
            <FormikInputField
                label='City'
                id='city'
                name='city'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='pinCode'
                prevField='address'
                showErrorTooltip={
                    !!(formik.touched.city && formik.errors.city)
                }
            />
            <FormikInputField
                label='Pin Code'
                id='pinCode'
                name='pinCode'
                type='number'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='jurisdiction'
                prevField='city'
                showErrorTooltip={
                    !!(formik.touched.pinCode && formik.errors.pinCode)
                }
            />
            <FormikInputField
                label='Jurisdiction'
                id='jurisdiction'
                name='jurisdiction'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='next'
                prevField='pinCode'
                showErrorTooltip={
                    !!(formik.touched.jurisdiction && formik.errors.jurisdiction)
                }
            />
        </div>

    )
};

export default GeneralSection;