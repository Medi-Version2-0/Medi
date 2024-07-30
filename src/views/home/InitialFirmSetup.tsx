import { useState } from 'react';
import { useFormik } from 'formik';
import { organizationValidationSchema } from '../organization/validation_schema';
import Button from '../../components/common/button/Button';
import { createOrganization } from '../../api/organizationApi';
import useToastManager from '../../helper/toastManager';
import ContactSection from '../../components/organization/ContactSection';
import GeneralSection from '../../components/organization/GeneralSection';
import LicencseSection from '../../components/organization/LicenceSection';
import { useUser } from '../../UserContext';
import { useNavigate } from 'react-router-dom';

const Step1 = ({ formik }: any) => (
    <div>
        <h2 className='text-lg font-bold mb-4'>Organization Details</h2>
        <GeneralSection formik={formik} />
    </div>
);

const Step2 = ({ formik }: any) => (
    <div>
        <h2 className='text-lg font-bold mb-4'>Contact Information</h2>
        <ContactSection formik={formik} />
    </div>
);

const Step3 = ({ formik }: any) => (
    <div>
        <h2 className='text-lg font-bold mb-4'>License and Identification Information</h2>
        <LicencseSection formik={formik} />
    </div>
);

const InitialFirmSetup = () => {
    const [step, setStep] = useState(1);
    const { user } = useUser();
    const navigate = useNavigate();
    const { successToast } = useToastManager();

    const formik = useFormik({
        initialValues: {
            name: '',
            address: '',
            city: '',
            pinCode: '',
            jurisdiction: '',
            phoneNo1: '',
            phoneNo2: '',
            phoneNo3: '',
            contactEmail: '',
            drugLicenseNo20B: '',
            drugLicenseNo21B: '',
            macCode: '',
            gstNumber: '',
            fssaiNumber: '',
            corporateIdNumber: '',
            panNumber: '',
            tdsTanNumber: ''
        },
        validationSchema: organizationValidationSchema,
        onSubmit: async (values) => {
            try {
                if (user?.id) {
                    const organization: any = await createOrganization(values, user.id);
                    successToast('Firm setup has been completed.Happy Accounting!');
                    navigate(`/${organization.id}`);
                } else {
                    navigate('/not-authorized');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        },
    });

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = () => {
        formik.handleSubmit();
    };

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
            <div className='bg-white p-8 rounded shadow-lg max-w-lg w-full'>
                <form onSubmit={formik.handleSubmit}>
                    {step === 1 && <Step1 formik={formik} />}
                    {step === 2 && <Step2 formik={formik} />}
                    {step === 3 && <Step3 formik={formik} />}

                    <div className='flex justify-between mt-4'>
                        {step > 1 && (
                            <Button type='highlight' btnType='button' handleOnClick={handleBack} >
                                Back
                            </Button>
                        )}
                        <div>
                            {step < 3 ? (
                                <Button type='highlight' btnType='button' id='next' handleOnClick={handleNext}                                >
                                    Next
                                </Button>
                            ) : (
                                <Button id='submit_all' type='fill' btnType='button' handleOnClick={handleSubmit}  >
                                    Submit
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InitialFirmSetup;
