import React from 'react';
// We are not importing any hooks or other libraries for this test.

const LoginPage = () => {
  // This is a simplified version with no state or logic.
  // It only returns the visual JSX to see if the component itself can be rendered.
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Login Page</h1>
          <p className="text-gray-500 mt-2">This is a test to see if the page renders.</p>
        </div>

        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" id="email" required className="mt-1 block w-full px-4 py-3 bg-gray-100 rounded-lg"/>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" id="password" required className="mt-1 block w-full px-4 py-3 bg-gray-100 rounded-lg"/>
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border rounded-lg text-white bg-indigo-600">
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
