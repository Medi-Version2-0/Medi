import FormikInputField from "../common/FormikInputField"

const ContactSection = ({ formik }: any) => {
    return (
        <div className="flex flex-col gap-4">
            <FormikInputField
                autoFocus={true}
                label='Phone No 1'
                id='phoneNo1'
                name='phoneNo1'
                type='number'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='phoneNo2'
                prevField='jurisdiction'
                showErrorTooltip={
                    !!(formik.touched.phoneNo1 && formik.errors.phoneNo1)
                }
            />
            <FormikInputField
                label='Phone No 2'
                id='phoneNo2'
                name='phoneNo2'
                type='number'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='phoneNo3'
                prevField='phoneNo1'
                showErrorTooltip={
                    !!(formik.touched.phoneNo2 && formik.errors.phoneNo2)
                }
            />
            <FormikInputField
                label='Phone No 3'
                id='phoneNo3'
                name='phoneNo3'
                type='number'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                nextField='contactEmail'
                prevField='phoneNo2'
                showErrorTooltip={
                    !!(formik.touched.phoneNo3 && formik.errors.phoneNo3)
                }
            />
            <FormikInputField
                label='Contact Email'
                id='contactEmail'
                name='contactEmail'
                type='email'
                className='!mb-0'
                labelClassName='font-semibold text-gray-600 min-w-[10vw]'
                inputClassName='bg-[#d8ddde54]'
                formik={formik}
                isPopupOpen={false}
                isTitleCase={false}
                nextField='next'
                prevField='phoneNo3'
                showErrorTooltip={
                    !!(formik.touched.contactEmail && formik.errors.contactEmail)
                }
            />
        </div>
    )
};

export default ContactSection;