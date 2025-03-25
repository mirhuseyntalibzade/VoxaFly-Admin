import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('https://localhost:7085/api/Auth/login', formData);
      
      console.log('Response:', response);
      console.log('Response data:', response.data);
      
      const token = response.data.token || response.data;
      console.log('Token:', token);

      if (typeof token !== 'string') {
        throw new Error('Invalid token received from server');
      }
      
      const decodedToken = jwtDecode(token);
      console.log('Decoded Token:', decodedToken);

      if (decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] !== 'Admin') {
        setError('Access denied. Admin privileges required.');
        return;
      }

      Cookies.set('jwt_token', token, { 
        expires: formData.rememberMe ? 7 : 1,
        secure: true,
        sameSite: 'strict'
      });

      localStorage.setItem('user', JSON.stringify({
        email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      }));

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login Error:', err);
      if (err.message === 'Invalid token received from server') {
        setError('Authentication failed. Invalid response from server.');
      } else {
        setError(err.response?.data || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              src="/src/assets/images/Voxafly Admin.svg"
              alt="Voxafly Admin"
              className="mx-auto h-16 w-auto"
            />
            <p className="text-center text-sm text-gray-600">
              Please sign in to your account
            </p>
          </div>
          
          <form className="mt-12 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/50 to-purple-600/50 mix-blend-multiply"></div>
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1774&q=80"
          alt="Airplane wing during sunset"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-4">
            <h2 className="text-4xl font-bold">Flight Admin Dashboard</h2>
            <p className="text-xl">Manage your flights and bookings with ease</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 