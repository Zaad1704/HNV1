import React from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // Import useSearchParams

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  const transactionId = searchParams.get('transactionId');

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark flex justify-center items-center p-4 transition-colors duration-300">
      <div className="text-center bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-xl border border-border-color dark:border-border-color-dark transition-all duration-200">
        <h1 className="text-5xl font-bold text-green-400 mb-4">Payment Successful!</h1>
        <p className="text-light-text dark:text-light-text-dark text-lg mb-4">Your payment has been successfully processed.</p>
        {invoiceId && <p className="text-light-text dark:text-light-text-dark text-md">Invoice ID: <span className="font-mono">{invoiceId}</span></p>}
        {transactionId && <p className="text-light-text dark:text-light-text-dark text-md">Transaction ID: <span className="font-mono">{transactionId}</span></p>}
        <p className="text-light-text dark:text-light-text-dark text-lg mt-4 mb-8">Your subscription has been activated. Thank you for your purchase.</p>
        <Link 
          to="/dashboard" 
          className="px-8 py-3 bg-brand-primary font-semibold rounded-lg hover:bg-brand-secondary transition-all duration-200"
        >
          Go to Your Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
