import axios, { AxiosError } from 'axios';
import { APIURL } from '../helper/api';
import { useGlobal } from '../GlobalContext';

const useApi = () => {
  const { showLoginPopup, showAlert } = useGlobal();
  const sendAPIRequest = async <T>(
    subUrl: string,
    init?: any,
  ) => {
    const url = `${APIURL}${subUrl}`;
    const headers = {
      'Content-type': 'application/json',
    };

    try {
      if ((init?.body instanceof FormData)) {
        headers['Content-type'] = 'multipart/form-data';
      }
      const response: any = await axios.request<T>({
        url,
        method: init?.method || 'GET',
        data: init?.method !== 'GET' ? init?.body : undefined,
        headers: { ...(init?.headers || {}), ...headers },
        withCredentials: true,
      });

      return response?.data?.data || response?.data || response;

    } catch (error:any) {
      // error with status code 401 and 403 will be handled by sendAPIRequest and show appropriate popup
      const isErrorHandled = error?.response?.status === 401 || error?.response?.status === 403;
      error.isErrorHandled = isErrorHandled;  // adding isErrorHandled in error object
      if (error?.response?.status === 401){
        error.method = init?.method || 'GET';
        showLoginPopup();  // show login popup
      }
      if (error?.response?.status === 403){
        showAlert(error.response.data.message);  // show unauthorized alert popup
      }
      throw error;
    }
  };

  return { sendAPIRequest };
};

export default useApi;