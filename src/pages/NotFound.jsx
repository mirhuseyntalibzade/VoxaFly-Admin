import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <h2 className="text-4xl font-medium text-gray-600 mt-4">Page Not Found</h2>
        <p className="text-gray-500 mt-4 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 