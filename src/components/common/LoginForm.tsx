import React, { useState, FormEvent, useRef, useEffect } from 'react';
import Button from './button/Button';
import { useUser } from '../../UserContext';
import { useGlobal } from '../../GlobalContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm: React.FC = () => {
  // State to store email and password
  const [email, setEmail] = useState<string>(''); // email state for email input change
  const [password, setPassword] = useState<string>('');  // password state for password input change
  const [message, setMessage] = useState<string>('');    // used to set the message if there is any error like invalid credentials
  const [visible, setVisibility] = useState<boolean>(false);    // used to show or hide password 
  const emailRef = useRef<HTMLInputElement | null>(null);   // used to focus on email input when component mounted
  const previousActiveElement = useRef<Element | null>(null); // used to focus on previous active element when component unmounted
  const { login } = useUser();   // used for login logic
  const { hidePopup } = useGlobal();   // used for hide the login popup when logged in successfully

  useEffect(() => {
    previousActiveElement.current = document.activeElement;
    emailRef.current?.focus();
    return () => {
      // Ensure the element exists and can be focused
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();  
      }
    };
  },[]);
  // Handler for form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); 
    try {
      const user: any = await login(email, password);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      hidePopup();
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  function toggleVisibility(){
    setVisibility(!visible);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mx-auto w-[500px] p-8 bg-white rounded">
      <div className="flex flex-col gap-1 mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email:
        </label>
        <input
          type="email"
          ref={emailRef}
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
          required
        />
      </div>
      <div className="flex flex-col gap-1 mb-6 relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password:
        </label>
        <input
          type={visible ? 'text' : 'password'}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
          required
        />
        {
          !visible ? (
            <FaEyeSlash className='absolute top-10 right-4 text-lg' onClick={toggleVisibility}/>
          ) : (
              <FaEye className='absolute top-10 right-4 text-lg' onClick={toggleVisibility} />
          )
        }
      </div>
      <Button id='submit_all' type='fill' className='!h-11'>Login</Button>
      {message && (
        <p className='mt-4 text-center text-red-600'>{message}</p>
      )}
    </form>
  );
};

export default LoginForm;
