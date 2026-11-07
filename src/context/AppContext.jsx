import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import {
  fetchSheetData,
  appendCustomerToSheet,
  updateCustomerInSheet,
  clearCustomerRowInSheet,
  initializeSheetHeaders,
} from '../services/googleSheetsService';
import { INITIAL_REFERENCE_DATA } from '../data/sampleCustomers';
import { getSavedConfig, saveConfig } from '../config/googleSheets';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const auth = useGoogleAuth();
  const [config, setConfig] = useState(() => getSavedConfig());
  const [customers, setCustomers] = useState(() => [...INITIAL_REFERENCE_DATA]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isLiveGoogleSheet, setIsLiveGoogleSheet] = useState(false);

  // Navigation state
  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard' | 'all-jobs' | 'add-customer' | 'pending' | 'completed' | 'payments' | 'settings' | 'details'
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error'|'info', id }

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToast({ message, type, id });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  // Update config
  const updateAppConfig = useCallback((newConfig) => {
    saveConfig(newConfig);
    setConfig(newConfig);
    auth.refreshConfig();
    showToast('Configuration settings updated successfully', 'success');
  }, [auth, showToast]);

  // Load data from Google Sheets when signed in
  const loadDataFromSheet = useCallback(async (token, currentConfig) => {
    const activeToken = token || auth.accessToken;
    const cfg = currentConfig || config;

    if (!activeToken || !cfg.spreadsheetId) {
      setIsLiveGoogleSheet(false);
      return;
    }

    setIsSyncing(true);
    setError(null);
    try {
      const result = await fetchSheetData(cfg.spreadsheetId, cfg.sheetName, activeToken);
      if (result.isEmpty) {
        setCustomers([]);
        showToast('Google Sheet is currently empty. Headers can be initialized in Settings.', 'info');
      } else {
        setCustomers(result.records);
      }
      setIsLiveGoogleSheet(true);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Failed to load data from Google Sheets:', err);
      const errMsg = err.message || 'Error fetching data from Google Sheet';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [auth.accessToken, config, showToast]);

  // Trigger sync on token change
  useEffect(() => {
    if (auth.isSignedIn && auth.accessToken && config.spreadsheetId) {
      loadDataFromSheet(auth.accessToken, config);
    } else {
      setIsLiveGoogleSheet(false);
    }
  }, [auth.isSignedIn, auth.accessToken, config.spreadsheetId, loadDataFromSheet]);

  // Add customer
  const addCustomer = useCallback(async (record) => {
    setIsLoading(true);
    try {
      if (isLiveGoogleSheet && auth.accessToken && config.spreadsheetId) {
        // Direct write to Google Sheet
        await appendCustomerToSheet(
          config.spreadsheetId,
          config.sheetName,
          record,
          auth.accessToken
        );
        // Refresh to guarantee authoritative data and row numbers
        await loadDataFromSheet(auth.accessToken, config);
        showToast(`Job ${record.jobId} saved to Google Sheets successfully!`, 'success');
      } else {
        // Fallback demo/preview mode
        const demoRow = 500 + customers.length + 1;
        const newRecord = { ...record, rowNumber: demoRow };
        setCustomers((prev) => [newRecord, ...prev]);
        showToast(
          `Job ${record.jobId} created in Preview Mode. Connect Google Sheets in Settings to persist live.`,
          'info'
        );
      }
      return true;
    } catch (err) {
      console.error('Add customer failed:', err);
      showToast(err.message || 'Failed to save customer', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isLiveGoogleSheet, auth.accessToken, config, customers.length, loadDataFromSheet, showToast]);

  // Update customer
  const updateCustomer = useCallback(async (rowNumber, updatedRecord) => {
    setIsLoading(true);
    try {
      if (isLiveGoogleSheet && auth.accessToken && config.spreadsheetId) {
        // Direct update to specific row in Google Sheet
        await updateCustomerInSheet(
          config.spreadsheetId,
          config.sheetName,
          rowNumber,
          updatedRecord,
          auth.accessToken
        );
        await loadDataFromSheet(auth.accessToken, config);
        showToast(`Job ${updatedRecord.jobId} updated in Google Sheets!`, 'success');
      } else {
        // Fallback demo update
        setCustomers((prev) =>
          prev.map((item) => (item.jobId === updatedRecord.jobId ? { ...updatedRecord, rowNumber } : item))
        );
        showToast(`Job ${updatedRecord.jobId} updated in Preview Mode.`, 'info');
      }
      return true;
    } catch (err) {
      console.error('Update customer failed:', err);
      showToast(err.message || 'Failed to update record in Google Sheets', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isLiveGoogleSheet, auth.accessToken, config, loadDataFromSheet, showToast]);

  // Delete customer / clear row
  const deleteCustomer = useCallback(async (customer) => {
    setIsLoading(true);
    try {
      if (isLiveGoogleSheet && auth.accessToken && config.spreadsheetId && customer.rowNumber) {
        await clearCustomerRowInSheet(
          config.spreadsheetId,
          config.sheetName,
          customer.rowNumber,
          auth.accessToken
        );
        await loadDataFromSheet(auth.accessToken, config);
        showToast(`Job ${customer.jobId} cleared from Google Sheets`, 'success');
      } else {
        setCustomers((prev) => prev.filter((item) => item.jobId !== customer.jobId));
        showToast(`Job ${customer.jobId} removed in Preview Mode`, 'info');
      }
      return true;
    } catch (err) {
      console.error('Delete customer failed:', err);
      showToast(err.message || 'Failed to delete record', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isLiveGoogleSheet, auth.accessToken, config, loadDataFromSheet, showToast]);

  // Initialize Sheet Headers
  const initializeHeaders = useCallback(async () => {
    if (!auth.accessToken || !config.spreadsheetId) {
      showToast('Please sign in and set your Spreadsheet ID first', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await initializeSheetHeaders(config.spreadsheetId, config.sheetName, auth.accessToken);
      await loadDataFromSheet(auth.accessToken, config);
      showToast('Sheet headers initialized successfully (DATE, JOB ID, NAME...)', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to initialize headers', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [auth.accessToken, config, loadDataFromSheet, showToast]);

  // Navigation helper
  const navigateTo = useCallback((page, contextData = null) => {
    if (page === 'details' && contextData) {
      setSelectedCustomerId(contextData);
    } else if (page === 'edit' && contextData) {
      setEditingCustomer(contextData);
      setActivePage('add-customer');
      return;
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AppContext.Provider
      value={{
        auth,
        config,
        updateAppConfig,
        customers,
        isLoading,
        isSyncing,
        error,
        lastSyncTime,
        isLiveGoogleSheet,
        activePage,
        setActivePage,
        navigateTo,
        selectedCustomerId,
        setSelectedCustomerId,
        editingCustomer,
        setEditingCustomer,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        initializeHeaders,
        refreshData: () => loadDataFromSheet(auth.accessToken, config),
        toast,
        showToast,
        closeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

