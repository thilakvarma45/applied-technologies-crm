/**
 * Google Sheets & App Configuration
 */

export const GOOGLE_CONFIG_STORAGE_KEY = 'applied_technologies_crm_config';

export const DEFAULT_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  spreadsheetId: import.meta.env.VITE_SPREADSHEET_ID || '1vp6lxbQVzoHDHov37RDtE2yJkgRUlSefV2goheAjVeQ',
  sheetName: import.meta.env.VITE_SHEET_NAME || 'Sheet1',
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
};

export const EXPECTED_HEADERS = [
  'DATE',
  'JOB ID',
  'NAME',
  'CONTACT',
  'DEVICE',
  'PROBLEM REPORT',
  'STATUS',
  'ESTIMATE',
  'PAID',
  'RETURNED',
  'BAG/ADP',
  'REMARKS',
  'ORDERS',
];

// Helper to retrieve user configured overrides from localStorage
export function getSavedConfig() {
  try {
    const saved = localStorage.getItem(GOOGLE_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        clientId: parsed.clientId || DEFAULT_CONFIG.clientId,
        spreadsheetId: parsed.spreadsheetId || DEFAULT_CONFIG.spreadsheetId,
        sheetName: parsed.sheetName || DEFAULT_CONFIG.sheetName,
        scopes: DEFAULT_CONFIG.scopes,
      };
    }
  } catch (err) {
    console.warn('Failed to parse saved config from localStorage:', err);
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(newConfig) {
  try {
    localStorage.setItem(GOOGLE_CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
  } catch (err) {
    console.error('Failed to save config to localStorage:', err);
  }
}

// Status definitions & badges
export const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', color: 'orange', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'In Progress', label: 'In Progress', color: 'blue', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'Completed', label: 'Completed', color: 'green', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'Buy Back', label: 'Buy Back', color: 'purple', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'Cancelled', label: 'Cancelled', color: 'red', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
  { value: 'G/S', label: 'G/S (General Service)', color: 'gray', bg: 'bg-slate-100 text-slate-800 border-slate-300' },
];

export const DEVICE_BRANDS = [
  'HP',
  'Dell',
  'Lenovo',
  'Asus',
  'Acer',
  'Apple',
  'Samsung',
  'Toshiba',
  'MSI',
  'Sony',
  'Other',
];

export const PAYMENT_METHODS = [
  'Cash',
  'PhonePe',
  'Google Pay',
  'UPI',
  'Card',
  'Bank Transfer',
  'Other',
];

