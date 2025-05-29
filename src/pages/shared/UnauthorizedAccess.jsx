import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const UnauthorizedAccess = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Error Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          
          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            You don't have permission to access this page
          </p>
          
          <p className="text-sm text-gray-500 mb-8">
            Please contact your administrator if you believe this is an error, or make sure you're logged in with the correct account type.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700">
            If you're trying to access:
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• <strong>Patient records:</strong> Login as Patient</li>
            <li>• <strong>Record entry:</strong> Login as Management</li>
            <li>• <strong>Record verification:</strong> Login as Doctor</li>
            <li>• <strong>User management:</strong> Login as Admin</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedAccess;