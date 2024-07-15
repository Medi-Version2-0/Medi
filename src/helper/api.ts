import { USER_LS_KEY } from '../UserContext';
import { getAccessToken, refreshToken } from '../auth';

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export const APIURL = process.env.REACT_APP_API_URL;

async function callApi(
  url: string,
  token: string,
  init: RequestInit | undefined = undefined,
  requireToken: boolean
) {
  let headers = init?.headers || {};
  headers = {
    ...headers,
    'Content-type': 'application/json',
    ...(requireToken && { Authorization: 'Bearer ' + token }),
  };

  try {
    const response = await fetch(url, { ...init, headers });

    if (!response.ok) {
      if (response.status === 401) {
        throw new AuthError('Unauthorized access - token may be expired');
      } else {
        const errorText = await response.text();
        throw new ApiError(`API Error: ${response.status} ${errorText}`);
      }
    }

    return response;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new NetworkError('Network error - could not reach server');
    }
    throw error;
  }
}

interface RequestInitWithBody extends RequestInit {
  body?: any;
}

export const sendAPIRequest = async <T>(
  subUrl: string,
  init: RequestInitWithBody | undefined = undefined,
  requireToken: boolean = true
): Promise<T> => {
  const token = requireToken ? getAccessToken() : '';
  if (init?.body) {
    init.body = JSON.stringify(init.body) as string;
  }

  const url = `${APIURL}${subUrl}`;

  try {
    const response = await callApi(url, token, init, requireToken);
    return (await response.json().then((e) => {
      if (e.error) {
        throw new ApiError(e.error);
      }
      return e.data;
    })) as Promise<T>;
  } catch (error) {
    if (error instanceof AuthError) {
      const getLocalUser = localStorage.getItem(USER_LS_KEY);
      const getPassword = localStorage.getItem('password');

      if (!getLocalUser || !getPassword) {
        throw new AuthError('User credentials not found in local storage');
      }

      const parsedUser = JSON.parse(getLocalUser);

      console.error('Access Token has expired, attempting to refresh');

      return refreshToken({
        password: getPassword,
        email: parsedUser.email,
      })
        .then((token) => callApi(url, token, init, requireToken))
        .then((o) => o.json() as Promise<T>)
        .catch((err) => {
          throw new AuthError('Failed to refresh token: ' + err.message);
        });
    } else if (error instanceof NetworkError) {
      throw new NetworkError('Network error occurred: ' + error.message);
    } else if (error instanceof ApiError) {
      throw new ApiError('API error occurred: ' + error.message);
    } else {
      const e = error as Error;
      throw new Error('An unexpected error occurred: ' + e.message);
    }
  }
};
