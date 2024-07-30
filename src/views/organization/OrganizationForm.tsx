import React from 'react';
import { useFormik } from 'formik';
import { organizationValidationSchema } from './validation_schema';
import FormikInputField from '../../components/common/FormikInputField';
import { OrganizationI, OrganizationFormProps } from './types';
import Button from '../../components/common/button/Button';
import { createOrganization, getOrganizations, updateOrganization } from '../../api/organizationApi';
import useToastManager from '../../helper/toastManager';
import { setOrganization } from '../../store/action/globalAction';
import { useDispatch } from 'react-redux';
import { useUser } from '../../UserContext';

const OrganizationForm: React.FC<OrganizationFormProps> = ({ data, setEditing }) => {
  const { successToast } = useToastManager();
  const dispatch = useDispatch();
  const { user } = useUser();

  const initialValues: OrganizationI = {
    name: data?.name || '',
    address: data?.address || '',
    city: data?.city || '',
    pinCode: data?.pinCode || '',
    jurisdiction: data?.jurisdiction || '',
    phoneNo1: data?.phoneNo1 || '',
    phoneNo2: data?.phoneNo2 || '',
    phoneNo3: data?.phoneNo3 || '',
    contactEmail: data?.contactEmail || '',
    drugLicenseNo20B: data?.drugLicenseNo20B || '',
    drugLicenseNo21B: data?.drugLicenseNo21B || '',
    macCode: data?.macCode || '',
    gstNumber: data?.gstNumber || '',
    fssaiNumber: data?.fssaiNumber || '',
    corporateIdNumber: data?.corporateIdNumber || '',
    panNumber: data?.panNumber || '',
    tdsTanNumber: data?.tdsTanNumber || '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: organizationValidationSchema,
    onSubmit: async (values) => {
      try {
        if (data?.id) {
          await updateOrganization(data.id, values);
        } else {
          user?.id && await createOrganization(values, user.id);
        }
        setEditing && setEditing(null);
        successToast(`Company has been successfully ${data?.id ? 'updated' : 'created'}`);
        const organizations = user?.id && await getOrganizations(user.id);
        dispatch(setOrganization(organizations || []));
      } catch (error) {
        console.error('Error:-', error);
      }
    },
  });

  return (
    <div className='flex flex-col items-center w-full px-4'>
      <span className='font-semibold text-2xl'>Create Company</span>
      <form onSubmit={formik.handleSubmit} className='flex flex-col gap-4 w-full px-4 bg-white rounded-md'>
        {/* Organization Details Section */}
        <fieldset className='border border-gray-500 border-solid w-full p-4'>
          <legend className='text-md font-medium bg-white px-2 ml-4 border border-gray-500 border-solid'>Organization Details</legend>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
              nextField='phoneNo1'
              prevField='pinCode'
              showErrorTooltip={
                !!(formik.touched.jurisdiction && formik.errors.jurisdiction)
              }
            />
          </div>
        </fieldset>

        {/* Contact Information Section */}
        <fieldset className='border border-gray-500 border-solid w-full p-4'>
          <legend className='text-md font-medium bg-white px-2 ml-4 border border-gray-500 border-solid'>Contact Information</legend>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <FormikInputField
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
              nextField='drugLicenseNo20B'
              prevField='phoneNo3'
              showErrorTooltip={
                !!(formik.touched.contactEmail && formik.errors.contactEmail)
              }
            />
          </div>
        </fieldset>

        {/* Licencse and identificatin information Section */}
        <fieldset className='border border-gray-500 border-solid w-full p-4'>
          <legend className='text-md font-medium bg-white px-2 ml-4 border border-gray-500 border-solid'>License and Identification Information</legend>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <FormikInputField
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
        </fieldset>
        <div className='flex justify-end gap-4'>
          {setEditing && <Button id='cancel_button' btnType='button' type='fog' handleOnClick={() => setEditing(null)}>
            Cancel
          </Button>
          }
          <Button id='submit_all' type='fill' btnType='submit'
            handleOnKeyDown={(e) => {
              if (e.key === 'Tab' || (!formik.isValid && e.key === 'Enter')) {
                document.getElementById('name')?.focus();
                e.preventDefault();
              }
              if (e.key === 'ArrowUp' || (e.shiftKey && e.key === 'Tab')) {
                document.getElementById('cancel_button')?.focus();
              }
            }}>
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationForm;
