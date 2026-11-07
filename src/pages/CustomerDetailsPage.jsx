import React from 'react';
import CustomerDetails from '../components/customers/CustomerDetails';
import { useApp } from '../context/AppContext';

export default function CustomerDetailsPage() {
  const { customers, selectedCustomerId, navigateTo } = useApp();

  const customer = customers.find(
    (c) => c.jobId === selectedCustomerId || c.rowNumber === selectedCustomerId
  );

  return (
    <div className="max-w-4xl mx-auto">
      <CustomerDetails
        customer={customer}
        onBack={() => navigateTo('all-jobs')}
      />
    </div>
  );
}

