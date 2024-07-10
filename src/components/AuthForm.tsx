import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useUser } from './../UserContext';
import { useNavigate } from 'react-router-dom';
import FormikInputField from './common/FormikInputField';
import CustomSelect from './custom_select/CustomSelect';
import { sendAPIRequest } from '../helper/api';

interface OptionType {
  value: string;
  label: string;
}

const permissionsOptions: OptionType[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
];

export const AuthForm = ({ isLogin }: { isLogin: boolean }) => {
  const { register, login } = useUser();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');
  const [organizationOptions, setOrganizationOptions] = useState<
    OptionType[] | undefined
  >([]);

  const initialValues = {
    email: '',
    password: '',
    permissions: [] as unknown as OptionType,
    organizations: [] as unknown as OptionType,
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const organizations = await sendAPIRequest<
          {
            id: number;
            name: string;
          }[]
        >('/organization', { method: 'get' }, false);

        const options = organizations?.map((e) => ({
          value: String(e.id),
          label: e.name,
        }));

        setOrganizationOptions(options);
      } catch (error) {
        console.error('Failed to fetch organizations', error);
      }
    };

    fetchOrganizations();
  }, []);

  interface OptionType {
    value: string;
    label: string;
  }

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Required'),
    password: Yup.string().required('Required'),
    ...(!isLogin && {
      permissions: Yup.array().min(1, 'At least one permission is required'),
      organizations: Yup.array().min(1, 'At least one permission is required'),
    }),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const { email, password, permissions, organizations } = values;
      const p = permissions as any;
      const o = organizations as any;
      const permissionsString = p?.map(
        (permission: { value: any }) => permission.value
      );
      const organizationIds = o?.map(
        (organization: { value: number }) => +organization.value
      );

      if (isLogin) {
        await login(email, password);
        navigate('/redirecttocompany');
        setMessage('Logged in successfully');
      } else {
        register(email, password, permissionsString, organizationIds);
        setMessage('User registered successfully');
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  if (!organizationOptions) {
    return null;
  }

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
                <Field
                  component={FormikInputField}
                  label='Email'
                  id='email'
                  name='email'
                  type='email'
                  isTitleCase={false}
                  formik={formik}
                />
                <ErrorMessage
                  name='email'
                  component='div'
                  className='absolute top-full left-0 text-red-600 text-xs'
                />
              </div>
              <div className='relative'>
                <Field
                  component={FormikInputField}
                  label='Password'
                  id='password'
                  name='password'
                  type='password'
                  isTitleCase={false}
                  formik={formik}
                />
                <ErrorMessage
                  name='password'
                  component='div'
                  className='absolute top-full left-0 text-red-600 text-xs'
                />
              </div>
              {!isLogin && (
                <div className='flex flex-col gap-7'>
                  <div className='relative'>
                    <Field
                      name='permissions'
                      render={({ form }: { form: any }) => (
                        <CustomSelect
                          id='permissions'
                          name='permissions'
                          label='Permissions'
                          options={permissionsOptions}
                          value={formik.values.permissions}
                          onChange={(selectedOptions) =>
                            form.setFieldValue('permissions', selectedOptions)
                          }
                          placeholder='Select permissions'
                          isMulti
                        />
                      )}
                    />
                    <ErrorMessage
                      name='permissions'
                      component='div'
                      className='absolute top-full left-0 text-red-600'
                    />
                  </div>
                  <div className='relative'>
                    <Field
                      name='organizations'
                      render={({ form }: { form: any }) => (
                        <CustomSelect
                          id='organizations'
                          name='organizations'
                          label='Organizations'
                          options={organizationOptions}
                          value={formik.values.organizations}
                          onChange={(selectedOptions) =>
                            form.setFieldValue('organizations', selectedOptions)
                          }
                          placeholder='Select organizations'
                          isMulti
                        />
                      )}
                    />
                    <ErrorMessage
                      name='organizations'
                      component='div'
                      className='absolute top-full left-0 text-red-600'
                    />
                  </div>
                </div>
              )}
              <button
                type='submit'
                className={`w-full p-2 ${isLogin ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-md hover:${isLogin ? 'bg-green-700' : 'bg-blue-700'}`}
              >
                {isLogin ? 'Login' : 'Register'}
              </button>
            </div>
            <p
              onClick={() => navigate(isLogin ? '/register' : '/login')}
              className='mt-4 text-center text-blue-600 cursor-pointer hover:underline'
            >
              {isLogin
                ? "Don't have an account? Register"
                : 'Already have an account? Login'}
            </p>
            {message && (
              <p className='mt-4 text-center text-red-600'>{message}</p>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};
