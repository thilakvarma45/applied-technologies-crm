import React from 'react';
import CustomerForm from '../components/customers/CustomerForm';
import { useApp } from '../context/AppContext';

export default function AddCustomer() {
  const { editingCustomer, setEditingCustomer, navigateTo } = useApp();

  const handleComplete = () => {
    setEditingCustomer(null);
    navigateTo('all-jobs');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CustomerForm
        initialData={editingCustomer}
        isEditMode={Boolean(editingCustomer)}
        onComplete={handleComplete}
      />
    </div>
  );
}

