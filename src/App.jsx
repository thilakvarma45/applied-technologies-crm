import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import AllCustomers from './pages/AllCustomers';
import AddCustomer from './pages/AddCustomer';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import Payments from './pages/Payments';
import Settings from './pages/Settings';

function AppContent() {
  const { activePage } = useApp();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'all-jobs':
        return <AllCustomers key="all-jobs" defaultStatus="all" />;
      case 'pending':
        return <AllCustomers key="pending" defaultStatus="Pending" />;
      case 'completed':
        return <AllCustomers key="completed" defaultStatus="Completed" />;
      case 'add-customer':
        return <AddCustomer />;
      case 'details':
        return <CustomerDetailsPage />;
      case 'payments':
        return <Payments />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return <MainLayout>{renderPage()}</MainLayout>;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

