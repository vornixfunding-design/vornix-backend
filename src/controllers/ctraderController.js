import { exchangeCodeForToken, getOAuthLoginUrl } from '../services/ctrader/oauthService.js';
import { saveTokens } from '../services/ctrader/tokenStore.js';

export const redirectToCTraderLogin = (_req, res) => {
  try {
    const loginUrl = getOAuthLoginUrl();
    return res.redirect(loginUrl);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate cTrader OAuth login URL.',
      error: error.message
    });
  }
};

export const handleCTraderCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Missing authorization code in callback request.'
    });
  }

  try {
    const tokens = await exchangeCodeForToken(code);
    const saved = saveTokens(tokens);

    return res.status(200).json({
      success: true,
      message: 'cTrader OAuth completed successfully. Tokens have been stored in-memory.',
      tokenMeta: {
        expiresIn: saved.expiresIn,
        updatedAt: saved.updatedAt
      }
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: 'Failed to exchange authorization code for cTrader tokens.',
      error: error.response?.data ?? error.message
    });
  }
};
