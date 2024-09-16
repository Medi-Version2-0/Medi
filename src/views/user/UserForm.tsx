import React from 'react';
import { useFormik } from 'formik';
import FormikInputField from '../../components/common/FormikInputField';
import Button from '../../components/common/button/Button';
import { useUser } from '../../UserContext';
import { userValidationSchema } from './validation_schema';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';

const UserForm = () => {
    const { user } = useUser();
    const { sendAPIRequest } = useApi();
    const navigate = useNavigate();
    const initialValues = {
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: '',
        altPhoneNumber: '',
        address: '',
        city: '',
        pinCode: '',
        aadharNumber: '',
    };

    const formik = useFormik({
        initialValues,
        validationSchema: userValidationSchema,
        onSubmit: async (values) => {
            try {
                const { email, ...user } = values;
                await sendAPIRequest(`/user`, {
                    method: 'PUT',
                    body: user,
                });
                navigate('/redirecttocompany')
                console.log("User created successfully with email", email);
            } catch (error) {
                console.error('Error:', error);
            }
        },
    });

    return (
        <div className='flex flex-col items-center justify-center h-screen w-full px-4'>
            <div className='flex flex-col gap-4  bg-white h-fit'>
                <span className='font-semibold text-2xl p-4 '>Tell Us More About Yourself!</span>
                <form onSubmit={formik.handleSubmit} className='flex flex-col gap-4 w-full p-4 bg-white rounded-md'>
                    <FormikInputField
                        label='Name'
                        id='name'
                        name='name'
                        formik={formik}
                        isRequired={true}
                        nextField='phoneNumber'
                        autoFocus={true}
                        showErrorTooltip={
                            !!(formik.touched.name && formik.errors.name)
                        }
                    />
                    <FormikInputField
                        label='Email'
                        id='email'
                        name='email'
                        formik={formik}
                        isDisabled={true}
                        isRequired={true}
                        prevField='name'
                        nextField='phoneNumber'
                    />
                    <FormikInputField
                        label='Phone Number'
                        id='phoneNumber'
                        type='number'
                        name='phoneNumber'
                        isRequired={true}
                        formik={formik}
                        prevField='email'
                        nextField='altPhoneNumber'
                        showErrorTooltip={
                            !!(formik.touched.phoneNumber && formik.errors.phoneNumber)
                        }
                    />
                    <FormikInputField
                        label='Alternate Phone Number'
                        id='altPhoneNumber'
                        type='number'
                        name='altPhoneNumber'
                        formik={formik}
                        prevField='phoneNumber'
                        nextField='address'
                        showErrorTooltip={
                            !!(formik.touched.altPhoneNumber && formik.errors.altPhoneNumber)
                        }
                    />
                    <FormikInputField
                        label='Address'
                        id='address'
                        name='address'
                        formik={formik}
                        prevField='altPhoneNumber'
                        nextField='city'
                    />
                    <FormikInputField
                        label='City'
                        id='city'
                        name='city'
                        formik={formik}
                        prevField='address'
                        nextField='pinCode'
                        isRequired={true}
                        showErrorTooltip={
                            !!(formik.touched.city && formik.errors.city)
                        }
                    />
                    <FormikInputField
                        label='Pin Code'
                        id='pinCode'
                        name='pinCode'
                        formik={formik}
                        prevField='city'
                        nextField='aadharNumber'
                        showErrorTooltip={
                            !!(formik.touched.pinCode && formik.errors.pinCode)
                        }
                    />
                    <FormikInputField
                        label='Aadhar Number'
                        id='aadharNumber'
                        name='aadharNumber'
                        type='number'
                        formik={formik}
                        prevField='pinCode'
                        nextField='submit_all'
                        showErrorTooltip={
                            !!(formik.touched.aadharNumber && formik.errors.aadharNumber)
                        }
                    />
                    <div className='flex justify-end gap-4'>
                        <Button
                            id='submit_all'
                            type='fill'
                            btnType='submit'
                            handleOnKeyDown={(e) => {
                                if (e.key === 'Tab' || (!formik.isValid && e.key === 'Enter')) {
                                    document.getElementById('name')?.focus();
                                    e.preventDefault();
                                }
                            }}
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
