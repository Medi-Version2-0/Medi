import { USER_LS_KEY } from '../UserContext';
import { getAccessToken, refreshToken } from '../auth';
import axios, { AxiosError } from 'axios';

export const APIURL = process.env.REACT_APP_API_URL;

export const sendAPIRequest = async <T>(
  subUrl: string,
  init?: any,
  requireToken = true
): Promise<T> => {
  const token = requireToken ? getAccessToken() : '';
  const url = `${APIURL}${subUrl}`;

  const headers = {
    'Content-type': 'application/json',
    ...(requireToken && { Authorization: 'Bearer ' + token }),
  };

  try {
    if ((init?.body instanceof FormData)) {
      headers['Content-type'] = 'multipart/form-data';
      console.log(headers);
    }
    const response: any = await axios.request<T>({
      url,
      method: init?.method || 'GET',
      data: init?.method !== 'GET' ? init?.body : undefined,
      headers: { ...(init?.headers || {}), ...headers },
    });

    return response.data?.data;

  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response?.status === 401) {
      const storedUser = localStorage.getItem(USER_LS_KEY);
      const storedPassword = localStorage.getItem('password');

      if (!storedUser || !storedPassword) {
        throw new Error('User credentials not found locally');
      }

      const parsedUser = JSON.parse(storedUser);

      try {
        const newToken = await refreshToken({ password: storedPassword, email: parsedUser.email });
        return sendAPIRequest<T>(subUrl, {
          ...init,
          headers: { ...(init?.headers || {}), Authorization: `Bearer ${newToken}` },
        }, requireToken);
      } catch (refreshError) {
        throw new Error('Failed to refresh token: ' + (refreshError as Error).message);
      }
    } else {
      throw error;
    }
  }
};