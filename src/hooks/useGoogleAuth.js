import { useState, useEffect, useCallback } from 'react';
import {
  initGoogleOAuth,
  requestGoogleAccessToken,
  revokeGoogleToken,
  isTokenValid,
  getStoredToken,
  isGoogleGsiLoaded,
} from '../services/googleAuth';
import { getSavedConfig } from '../config/googleSheets';

export function useGoogleAuth() {
  const [config, setConfig] = useState(() => getSavedConfig());
  const [isGsiReady, setIsGsiReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(() => isTokenValid());
  const [accessToken, setAccessToken] = useState(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Check periodically for GSI library load
  useEffect(() => {
    if (isGoogleGsiLoaded()) {
      setIsGsiReady(true);
      return;
    }

    const interval = setInterval(() => {
      if (isGoogleGsiLoaded()) {
        setIsGsiReady(true);
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Initialize GIS token client when client ID is present & GSI is ready
  useEffect(() => {
    if (!isGsiReady || !config.clientId) return;

    initGoogleOAuth(
      config.clientId,
      ({ accessToken: token }) => {
        setAccessToken(token);
        setIsSignedIn(true);
        setAuthError(null);
        setIsLoading(false);
      },
      (err) => {
        setAuthError(err?.message || err?.error || 'Authentication failed');
        setIsLoading(false);
      }
    );
  }, [isGsiReady, config.clientId]);

  const signIn = useCallback(
    async (promptConsent = false) => {
      setIsLoading(true);
      setAuthError(null);
      try {
        const token = await requestGoogleAccessToken(promptConsent);
        setAccessToken(token);
        setIsSignedIn(true);
        return token;
      } catch (err) {
        const errMsg = err?.message || err?.error || 'Failed to authorize with Google';
        setAuthError(errMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(() => {
    revokeGoogleToken();
    setAccessToken(null);
    setIsSignedIn(false);
    setAuthError(null);
  }, []);

  const refreshConfig = useCallback(() => {
    const updated = getSavedConfig();
    setConfig(updated);
  }, []);

  return {
    isGsiReady,
    isSignedIn,
    accessToken,
    isLoading,
    authError,
    config,
    signIn,
    signOut,
    refreshConfig,
  };
}

