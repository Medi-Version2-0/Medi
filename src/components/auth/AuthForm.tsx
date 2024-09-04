import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useUser } from '../../UserContext';
import { useNavigate } from 'react-router-dom';
import FormikInputField from '../common/FormikInputField';
import Button from '../common/button/Button';

export const AuthForm = ({ isLogin }: { isLogin: boolean }) => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');
  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Required'),
    password: Yup.string().required('Required')
  });

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const { email, password } = values;
      if (isLogin) {
        const user: any = await login(email, password);
        if (user.UserOrganizations.length) {
          return navigate(`/`)
        }
        if (!user.city) {
          navigate('/user/setup');
          setMessage('Logged in successfully');
        }else{
          navigate('/redirecttocompany')
        }
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {(formik) => (
        <Form className='min-h-screen flex flex-col items-center justify-center bg-gray-100'>
          <div className='w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
            <h1 className='text-2xl font-bold mb-6 text-center'>
              {isLogin ? 'Login' : 'Register'}
            </h1>
            <div className='flex flex-col gap-7'>
              <div className='relative'>
                <FormikInputField
                  label='Email'
                  id='email'
                  name='email'
                  type='email'
                  isTitleCase={false}
                  formik={formik}
                  nextField='password'
                />
              </div>
              <div className='relative'>
                <FormikInputField
                  label='Password'
                  id='password'
                  name='password'
                  type='password'
                  isTitleCase={false}
                  formik={formik}
                  prevField='email'
                  nextField='submit_all'
                />
              </div>
              <Button id='submit_all' type='fill'>Login</Button>
            </div>
            {message && (
              <p className='mt-4 text-center text-red-600'>{message}</p>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};
