/**
 * Google Identity Services (GIS) OAuth 2.0 Service
 * Manages OAuth 2.0 access token flow for Google Sheets API v4
 */

let tokenClient = null;
let currentAccessToken = null;
let tokenExpiresAt = null;

const TOKEN_STORAGE_KEY = 'applied_crm_oauth_token';
const EXPIRY_STORAGE_KEY = 'applied_crm_oauth_expiry';

/**
 * Check if the Google Identity Services SDK is loaded
 */
export function isGoogleGsiLoaded() {
  return typeof window !== 'undefined' && window.google?.accounts?.oauth2 !== undefined;
}

/**
 * Check if current access token exists and is not expired
 */
export function isTokenValid() {
  if (!currentAccessToken) {
    // Check session storage
    const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const expiry = sessionStorage.getItem(EXPIRY_STORAGE_KEY);
    if (stored && expiry && Date.now() < parseInt(expiry, 10)) {
      currentAccessToken = stored;
      tokenExpiresAt = parseInt(expiry, 10);
      return true;
    }
    return false;
  }
  return tokenExpiresAt ? Date.now() < tokenExpiresAt : true;
}

/**
 * Get the current active access token
 */
export function getStoredToken() {
  if (isTokenValid()) {
    return currentAccessToken;
  }
  return null;
}

/**
 * Clear the current stored token
 */
export function clearStoredToken() {
  currentAccessToken = null;
  tokenExpiresAt = null;
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(EXPIRY_STORAGE_KEY);
}

/**
 * Initialize Google Identity Services OAuth 2.0 Token Client
 */
export function initGoogleOAuth(clientId, onTokenSuccess, onTokenError) {
  if (!clientId) {
    console.warn('Google Client ID is not provided');
    return null;
  }

  if (!isGoogleGsiLoaded()) {
    console.warn('Google Identity Services SDK is not yet available');
    return null;
  }

  try {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          console.error('Google OAuth error:', tokenResponse);
          if (onTokenError) onTokenError(tokenResponse);
          return;
        }

        currentAccessToken = tokenResponse.access_token;
        // GIS tokens typically expire in 3600 seconds (1 hour)
        const expiresInSeconds = tokenResponse.expires_in || 3600;
        tokenExpiresAt = Date.now() + (expiresInSeconds - 60) * 1000;

        // Save in sessionStorage (cleared when browser session ends)
        sessionStorage.setItem(TOKEN_STORAGE_KEY, currentAccessToken);
        sessionStorage.setItem(EXPIRY_STORAGE_KEY, tokenExpiresAt.toString());

        if (onTokenSuccess) {
          onTokenSuccess({
            accessToken: currentAccessToken,
            expiresAt: tokenExpiresAt,
          });
        }
      },
      error_callback: (error) => {
        console.error('GIS Error callback:', error);
        if (onTokenError) onTokenError(error);
      },
    });

    return tokenClient;
  } catch (err) {
    console.error('Failed to initialize Google OAuth Token Client:', err);
    if (onTokenError) onTokenError(err);
    return null;
  }
}

/**
 * Trigger Google OAuth Sign-in Popup
 */
export function requestGoogleAccessToken(promptConsent = false) {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('OAuth client not initialized. Please verify your Google Client ID in Settings.'));
      return;
    }

    // Wrap token receipt in promise
    const originalCallback = tokenClient.callback;
    tokenClient.callback = (response) => {
      if (originalCallback) originalCallback(response);
      if (response.error) {
        reject(response);
      } else {
        resolve(response.access_token);
      }
    };

    tokenClient.requestAccessToken({
      prompt: promptConsent ? 'consent' : '',
    });
  });
}

/**
 * Revoke token if needed
 */
export function revokeGoogleToken() {
  if (currentAccessToken && window.google?.accounts?.oauth2?.revoke) {
    try {
      window.google.accounts.oauth2.revoke(currentAccessToken, () => {
        console.log('Google token revoked');
      });
    } catch (err) {
      console.warn('Error revoking token:', err);
    }
  }
  clearStoredToken();
}

