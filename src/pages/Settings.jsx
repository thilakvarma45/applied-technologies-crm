import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ExternalLink,
  Save,
  HelpCircle,
  Database,
  Table,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EXPECTED_HEADERS } from '../config/googleSheets';
import { testSpreadsheetConnection, extractCleanSpreadsheetId } from '../services/googleSheetsService';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function Settings() {
  const {
    config,
    updateAppConfig,
    auth,
    refreshData,
    initializeHeaders,
    isLiveGoogleSheet,
    showToast,
  } = useApp();

  const [formData, setFormData] = useState({
    clientId: config.clientId || '',
    spreadsheetId: config.spreadsheetId || '',
    sheetName: config.sheetName || 'Sheet1',
  });

  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let val = value.trim();
    if (name === 'spreadsheetId') {
      val = extractCleanSpreadsheetId(val);
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const cleanId = extractCleanSpreadsheetId(formData.spreadsheetId);
    updateAppConfig({
      ...config,
      clientId: formData.clientId.trim(),
      spreadsheetId: cleanId,
      sheetName: formData.sheetName.trim(),
    });
    setFormData((prev) => ({ ...prev, spreadsheetId: cleanId }));
    setTestResult(null);
  };

  const handleGoogleSignIn = async () => {
    try {
      await auth.signIn(true);
      showToast('Google account authorized successfully!', 'success');
      // After sign in, attempt test if spreadsheet ID is filled
      if (formData.spreadsheetId) {
        handleTestConnection();
      }
    } catch (err) {
      // Handled in auth
    }
  };

  const handleGoogleSignOut = () => {
    auth.signOut();
    setTestResult(null);
    showToast('Signed out from Google Account', 'info');
  };

  const handleTestConnection = async () => {
    if (!auth.accessToken) {
      showToast('Please sign in with Google first', 'error');
      return;
    }
    if (!formData.spreadsheetId) {
      showToast('Please provide your Google Spreadsheet ID', 'error');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSpreadsheetConnection(
        formData.spreadsheetId,
        formData.sheetName,
        auth.accessToken
      );
      setTestResult(res);
      if (res.success) {
        showToast('Connection verified successfully!', 'success');
        refreshData();
      } else {
        showToast(res.error || 'Connection failed', 'error');
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
      showToast(err.message || 'Test failed', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          System &amp; Spreadsheet Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your Google Cloud OAuth 2.0 credentials and Google Sheets connection
        </p>
      </div>

      {/* Connection Status Card */}
      <div
        className={`p-6 rounded-2xl border shadow-xs transition-all ${
          isLiveGoogleSheet
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-xl ${
                isLiveGoogleSheet ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isLiveGoogleSheet ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isLiveGoogleSheet
                  ? 'Active Live Google Sheets Connection'
                  : 'Currently in Preview Mode'}
              </h3>
              <p className="text-xs mt-1 opacity-90 leading-relaxed">
                {isLiveGoogleSheet
                  ? 'Your CRM is directly connected to Google Sheets API v4. All customer registrations, status updates, and payments are stored live.'
                  : 'You are viewing realistic workshop data. Authorize your Google account and enter your Spreadsheet ID below to sync live.'}
              </p>
            </div>
          </div>

          <div>
            {auth.isSignedIn ? (
              <button
                type="button"
                onClick={handleGoogleSignOut}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold hover:bg-rose-50 shadow-xs transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={auth.isLoading || !formData.clientId}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                <span>{auth.isLoading ? 'Authorizing...' : 'Authorize with Google'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Form Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-800">Spreadsheet Parameters</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify your Google Cloud OAuth Client ID and destination Google Sheet
            </p>
          </div>

          <div className="space-y-5">
            {/* Google Client ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Google OAuth 2.0 Client ID (Web Application)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  placeholder="e.g. 1234567890-abcdefgh.apps.googleusercontent.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Create a Web OAuth Client ID in Google Cloud Console with your application origin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Spreadsheet ID */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Google Spreadsheet ID
                </label>
                <div className="relative">
                  <FileSpreadsheet className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="spreadsheetId"
                    value={formData.spreadsheetId}
                    onChange={handleInputChange}
                    placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Found in your spreadsheet URL between <code className="bg-slate-100 px-1 py-0.5 rounded">/d/</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">/edit</code>.
                </p>
              </div>

              {/* Sheet Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sheet / Tab Name
                </label>
                <input
                  type="text"
                  name="sheetName"
                  value={formData.sheetName}
                  onChange={handleInputChange}
                  placeholder="Sheet1"
                  className="w-full px-3 py-2.5 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Default is <span className="font-semibold">Sheet1</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !auth.isSignedIn}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowInitModal(true)}
                disabled={!auth.isSignedIn || !formData.spreadsheetId}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
                title="Initialize row 1 headers if spreadsheet is blank"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Initialize Sheet Headers</span>
              </button>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>

        {/* Test Result Feedback Box */}
        {testResult && (
          <div
            className={`mt-6 p-4 rounded-xl border text-xs ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{testResult.success ? 'Connection Successful' : 'Connection Error'}</span>
            </div>
            {testResult.success ? (
              <div className="space-y-1 mt-2 text-slate-700">
                <p><strong>Title:</strong> {testResult.title}</p>
                <p><strong>Available Tabs:</strong> {testResult.sheets?.join(', ')}</p>
                <p><strong>Current Records Found:</strong> {testResult.recordCount} rows</p>
                {testResult.missingHeaders && testResult.missingHeaders.length > 0 && (
                  <p className="text-amber-800 font-semibold mt-1">
                    Note: Missing headers in row 1: {testResult.missingHeaders.join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-1 font-mono">{testResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Expected Headers Reference Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Authoritative Spreadsheet Column Layout (A through M)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">13 Columns</span>
        </div>

        <p className="text-xs text-slate-500">
          This CRM matches the exact column structure from your workshop log (<code className="font-mono text-blue-600 font-semibold">2026 Log In .XLSX</code>):
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
          {EXPECTED_HEADERS.map((header, idx) => (
            <div
              key={header}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 font-mono"
            >
              <span className="block text-[10px] text-slate-400 font-bold">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-bold text-slate-700 truncate block mt-0.5">
                {header}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Setup Guide */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3>Quick Google Cloud Setup Instructions</h3>
        </div>

        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <p>
            <strong>Step 1:</strong> Go to the{' '}
            <a
              href="https://console.cloud.google.com/apis/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-0.5"
            >
              Google Cloud Console <ExternalLink className="w-3 h-3" />
            </a>{' '}
            and select or create a project (e.g. <em>Applied-Technologies-CRM</em>).
          </p>
          <p>
            <strong>Step 2:</strong> Navigate to <strong>APIs &amp; Services &gt; Library</strong>, search for{' '}
            <strong>Google Sheets API</strong>, and click <strong>Enable</strong>.
          </p>
          <p>
            <strong>Step 3:</strong> Go to <strong>APIs &amp; Services &gt; Credentials &gt; Create Credentials &gt; OAuth client ID</strong>.
            Choose <em>Application type: Web application</em>.
          </p>
          <p>
            <strong>Step 4:</strong> Under <em>Authorized JavaScript origins</em>, add your frontend URL (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded">http://localhost:3000</code> for development and your production Vercel URL).
          </p>
          <p>
            <strong>Step 5:</strong> Copy the generated <strong>Client ID</strong> and paste it into the field above (or in your <code className="bg-slate-100 px-1 py-0.5 rounded">.env</code> file).
          </p>
          <p>
            <strong>Step 6:</strong> Open your Google Sheet, copy the Spreadsheet ID from the browser address bar, paste it above, and click <strong>Authorize with Google</strong>!
          </p>
        </div>
      </div>

      {/* Confirmation Dialog for Header Init */}
      <ConfirmDialog
        isOpen={showInitModal}
        title="Initialize Spreadsheet Headers"
        message="This will write the standard 13 headers (DATE, JOB ID, NAME, CONTACT, DEVICE, PROBLEM REPORT, STATUS, ESTIMATE, PAID, RETURNED, BAG/ADP, REMARKS, ORDERS) to row 1 of your spreadsheet. Existing rows 2 onwards will not be modified."
        confirmText="Initialize Headers"
        onConfirm={async () => {
          setShowInitModal(false);
          await initializeHeaders();
        }}
        onCancel={() => setShowInitModal(false)}
      />
    </div>
  );
}

