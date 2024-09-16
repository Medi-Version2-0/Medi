import axios, { AxiosError } from 'axios';

export const APIURL = process.env.REACT_APP_API_URL;

export const sendAPIRequest = async <T>(
  subUrl: string,
  init?: any,
  requireToken = true
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
    console.log('Error in sendAPIResponse ==> ', error);
    throw error;
  }
};