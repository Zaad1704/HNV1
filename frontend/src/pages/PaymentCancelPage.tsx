import React from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // Import useSearchParams

const PaymentCancelPage = () => {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');

  return (
    <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-yellow-400 mb-4">Payment Canceled</h1>
        <p className="text-slate-300 text-lg mb-4">Your payment process was canceled. You have not been charged.</p>
        {invoiceId && <p className="text-slate-300 text-md">Invoice ID: <span className="font-mono">{invoiceId}</span></p>}
        <p className="text-slate-300 text-lg mt-4 mb-8">If you believe this is an error, please try again or contact support.</p>
        <Link 
          to="/dashboard" 
          className="px-8 py-3 bg-slate-700 font-semibold rounded-lg hover:bg-slate-600 transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
