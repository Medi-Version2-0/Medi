export const mediAccessToken = 'medi-access-token';

const apiUrl = process.env.REACT_APP_API_URL;

export const getAccessToken = () => {
  const token = localStorage.getItem(mediAccessToken);
  if (!token) {
    throw Error('No access token.');
  }

  return token;
};

const saveToken = (token: string) => {
  localStorage.setItem(mediAccessToken, token);
};

export const refreshToken = async (user: {
  email: string;
  password: string;
}) => {
  const fetchQ = fetch(apiUrl + `/login`, {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ email: user.email, password: user.password }),
  }).then((o) => o.json());

  const { access_token } = await fetchQ;
  saveToken(access_token);
  return access_token;
};
