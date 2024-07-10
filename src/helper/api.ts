import { USER_LS_KEY } from '../UserContext';
import { getAccessToken, refreshToken } from '../auth';

function callApi(
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

  return fetch(url, { ...init, headers });
}

interface RequestInitWithBody extends RequestInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

export const sendAPIRequest = async <T>(
  subUrl: string,
  init: RequestInitWithBody | undefined = undefined,
  requireToken: boolean = true
) => {
  const token = requireToken ? getAccessToken() : '';
  if (init?.body) {
    init.body = JSON.stringify(init.body) as string;
  }

  const url = `${process.env.REACT_APP_API_URL}${subUrl}`;
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await callApi(url, token, init, requireToken);
    if (response.ok) {
      return (await response.json().then((e) => {
        if (e.error) {
          throw e.error;
        }
        return e.data;
      })) as Promise<T>;
    } else {
      if (response.status === 401) {
        const getLocalUser = localStorage.getItem(USER_LS_KEY);
        const getPassword = localStorage.getItem('password');

        if (!getLocalUser || !getPassword) {
          throw new Error('User not found');
        }

        const parsedUser = JSON.parse(getLocalUser);

        if (response.status === 401) {
          console.error('Access Token has been exipred');

          return refreshToken({
            password: getPassword,
            email: parsedUser.email,
          })
            .then((token) => callApi(url, token, init, requireToken))
            .then((o) => o.json() as Promise<T>);
        }
      }

      throw await response.json();
    }
  } catch (error) {
    throw error;
  }
};
