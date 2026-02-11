const tokenState = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  updatedAt: null
};

export const saveTokens = ({ accessToken, refreshToken, expiresIn }) => {
  tokenState.accessToken = accessToken;
  tokenState.refreshToken = refreshToken;
  tokenState.expiresIn = expiresIn;
  tokenState.updatedAt = new Date().toISOString();

  return { ...tokenState };
};

export const getTokens = () => ({ ...tokenState });

export const clearTokens = () => {
  tokenState.accessToken = null;
  tokenState.refreshToken = null;
  tokenState.expiresIn = null;
  tokenState.updatedAt = null;
};
