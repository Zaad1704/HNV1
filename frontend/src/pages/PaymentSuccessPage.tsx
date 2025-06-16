import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccessPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-green-400 mb-4">Payment Successful!</h1>
        <p className="text-slate-300 text-lg mb-8">Your subscription has been activated. Thank you for your purchase.</p>
        <Link 
          to="/dashboard" 
          className="px-8 py-3 bg-cyan-600 font-semibold rounded-lg hover:bg-cyan-500 transition-all"
        >
          Go to Your Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
