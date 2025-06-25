import React from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // Import useSearchParams

const PaymentCancelPage = () => {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark flex justify-center items-center p-4 transition-colors duration-300">
      <div className="text-center bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-xl border border-border-color dark:border-border-color-dark transition-all duration-200">
        <h1 className="text-5xl font-bold text-brand-orange mb-4">Payment Canceled</h1>
        <p className="text-light-text dark:text-light-text-dark text-lg mb-4">Your payment process was canceled. You have not been charged.</p>
        {invoiceId && <p className="text-light-text dark:text-light-text-dark text-md">Invoice ID: <span className="font-mono">{invoiceId}</span></p>}
        <p className="text-light-text dark:text-light-text-dark text-lg mt-4 mb-8">If you believe this is an error, please try again or contact support.</p>
        <Link 
          to="/dashboard" 
          className="px-8 py-3 bg-light-bg dark:bg-dark-bg/50 border border-border-color dark:border-border-color-dark font-semibold rounded-lg hover:bg-border-color dark:hover:bg-dark-bg/70 transition-all duration-200"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
