import axios from 'axios';

const OAUTH_AUTHORIZE_URL = 'https://connect.spotware.com/apps/auth';
const OAUTH_TOKEN_URL = 'https://connect.spotware.com/apps/token';

const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const getOAuthLoginUrl = () => {
  const clientId = getRequiredEnv('CTRADER_CLIENT_ID');
  const redirectUri = getRequiredEnv('CTRADER_REDIRECT_URI');

  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'trade',
    response_type: 'code'
  });

  return `${OAUTH_AUTHORIZE_URL}?${query.toString()}`;
};

export const exchangeCodeForToken = async (code) => {
  if (!code) {
    throw new Error('OAuth authorization code is required');
  }

  const clientId = getRequiredEnv('CTRADER_CLIENT_ID');
  const clientSecret = getRequiredEnv('CTRADER_CLIENT_SECRET');
  const redirectUri = getRequiredEnv('CTRADER_REDIRECT_URI');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri
  });

  const response = await axios.post(OAUTH_TOKEN_URL, body.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    timeout: 10000
  });

  const { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn } = response.data;

  if (!accessToken || !refreshToken || typeof expiresIn === 'undefined') {
    throw new Error('Token endpoint returned an incomplete token payload');
  }

  return { accessToken, refreshToken, expiresIn };
};
