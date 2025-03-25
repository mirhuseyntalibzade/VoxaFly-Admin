import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const CountriesContent = () => {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    isoCode: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  const fetchCountries = async () => {
    try {
      const response = await axios.get('https://localhost:7085/api/Countries');
      setCountries(response.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch countries');
      setIsLoading(false);
    }
  };

  const fetchCountryDetails = async (id) => {
    try {
      const response = await axios.get(`https://localhost:7085/api/Countries/${id}`);
      setSelectedCountry(response.data);
    } catch (err) {
      console.error('Error fetching country details:', err);
      setError('Failed to fetch country details');
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (showDetails && selectedCountry) {
      fetchCountryDetails(selectedCountry.id);
    }
  }, [showDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    try {
      if (editingCountry) {
        await axios.put(`https://localhost:7085/api/Countries/${editingCountry.id}`, formData);
      } else {
        await axios.post('https://localhost:7085/api/Countries', formData);
      }
      setIsModalOpen(false);
      setEditingCountry(null);
      setFormData({ name: '', isoCode: '' });
      fetchCountries();
    } catch (err) {
      console.log('Error response:', err.response?.data);

      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      } else if (err.response?.data?.title) {
        setError(err.response.data.title);
      } else {
        setError('Failed to save country');
      }
    }
  };

  const handleDeleteClick = (country, type) => {
    setSelectedCountry(country);
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      if (deleteType === 'soft') {
        await axios.patch(`https://localhost:7085/api/Countries/${selectedCountry.id}/soft-delete`);
      } else {
        await axios.delete(`https://localhost:7085/api/Countries/${selectedCountry.id}`);
      }
      setShowDeleteModal(false);
      setSelectedCountry(null);
      fetchCountries();
    } catch (err) {
      setError(err.response?.data || 'Failed to delete country');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Countries Management</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your system's countries</p>
          </div>
          <button
            onClick={() => {
              setEditingCountry(null);
              setFormData({ name: '', isoCode: '' });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Country
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Updated Countries Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISO Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {countries.map((country) => (
                <tr key={country.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {country.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {country.isoCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${country.isDeleted
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {country.isDeleted ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                    <button
                      onClick={() => {
                        setEditingCountry(country);
                        setFormData({
                          name: country.name,
                          isoCode: country.isoCode
                        });
                        setValidationErrors({});
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (country.isDeleted) {
                            await axios.patch(`https://localhost:7085/api/Countries/${country.id}/revert`);
                          } else {
                            await axios.patch(`https://localhost:7085/api/Countries/${country.id}/soft-delete`);
                          }
                          fetchCountries();
                        } catch (err) {
                          setError('Failed to update country status');
                        }
                      }}
                      className={`${country.isDeleted ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'} font-medium`}
                    >
                      {country.isDeleted ? 'Revert' : 'Soft Delete'}
                    </button>
                    <button
                      onClick={async () => {
                        setSelectedCountry(country);
                        setShowDetails(true);
                      }}
                      className="text-purple-600 hover:text-purple-900 font-medium"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleDeleteClick(country, 'hard')}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="flex items-start mt-3 text-center sm:mt-0 sm:text-left">
                    <div className="flex-shrink-0">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Country
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this country?
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {deleteType === 'soft' ? 'Deactivate' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCountry(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedCountry && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="relative bg-white rounded-lg max-w-6xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Country Details: {selectedCountry.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedCountry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">ISO Code</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedCountry.isoCode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                      ${selectedCountry.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                    >
                      {selectedCountry.isDeleted ? 'Deleted' : 'Active'}
                    </span>
                  </div>
                </div>

                {/* Airlines Section */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Airlines</h4>
                  {selectedCountry.airlines && selectedCountry.airlines.length > 0 ? (
                    <div className="mt-2 ring-1 ring-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IATA</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ICAO</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedCountry.airlines.map((airline) => (
                            <tr key={airline.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{airline.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{airline.iata}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{airline.icao}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${airline.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                                >
                                  {airline.isDeleted ? 'Deleted' : 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No airlines registered in this country</p>
                  )}
                </div>

                {/* Audit Information */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Audit Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created By</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedCountry.createdBy}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created Date</p>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCountry.createdDate)}</p>
                    </div>
                    {selectedCountry.updatedBy && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Updated By</p>
                          <p className="mt-1 text-sm text-gray-900">{selectedCountry.updatedBy}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Updated Date</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedCountry.updatedDate ? formatDate(selectedCountry.updatedDate) : '-'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {error && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {editingCountry ? 'Edit Country' : 'Add Country'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.Name ? 'border-red-300' : 'border-gray-300'
                        }`}
                    />
                    {validationErrors.Name && validationErrors.Name.map((error, index) => (
                      <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ISO Code
                    </label>
                    <input
                      type="text"
                      value={formData.isoCode}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().slice(0, 3);
                        setFormData({ ...formData, isoCode: value });
                      }}
                      maxLength={3}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.ISOCode ? 'border-red-300' : 'border-gray-300'
                        }`}
                    />
                    {validationErrors.ISOCode && validationErrors.ISOCode.map((error, index) => (
                      <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                    >
                      {editingCountry ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setValidationErrors({});
                        setError(null);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountriesContent; 