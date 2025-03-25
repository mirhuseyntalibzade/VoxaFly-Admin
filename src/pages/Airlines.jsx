import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTimes, 
  faExclamationCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AirlinesContent = () => {
  const [airlines, setAirlines] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAirline, setEditingAirline] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [apiErrors, setApiErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    iata: '',
    icao: '',
    countryId: '',
    logo: null
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [airlineToDelete, setAirlineToDelete] = useState(null);

  const fetchAirlines = async () => {
    try {
      const response = await axios.get('https://localhost:7085/api/Airlines');
      setAirlines(response.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch airlines');
      setIsLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get('https://localhost:7085/api/Countries');
      setCountries(response.data.filter(country => !country.isDeleted));
    } catch (err) {
      setError('Failed to fetch countries');
    }
  };

  const fetchAirlineDetails = async (id) => {
    try {
      const response = await axios.get(`https://localhost:7085/api/Airlines/${id}`);
      setSelectedAirline(response.data);
    } catch (err) {
      console.error('Error fetching airline details:', err);
      setError('Failed to fetch airline details');
    }
  };

  useEffect(() => {
    fetchAirlines();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (showDetails && selectedAirline) {
      fetchAirlineDetails(selectedAirline.id);
    }
  }, [showDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErrors({});
    setError(null);

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('iata', formData.iata);
    formDataToSend.append('icao', formData.icao);
    formDataToSend.append('countryId', formData.countryId);
    if (formData.logo) {
      formDataToSend.append('logo', formData.logo);
    }

    try {
      if (editingAirline) {
        await axios.put(`https://localhost:7085/api/Airlines/${editingAirline.id}`, formDataToSend);
      } else {
        await axios.post('https://localhost:7085/api/Airlines', formDataToSend);
      }
      setIsModalOpen(false);
      setEditingAirline(null);
      setFormData({ name: '', iata: '', icao: '', countryId: '', logo: null });
      fetchAirlines();
    } catch (err) {
      if (err.response?.data?.errors) {
        setApiErrors(err.response.data.errors);
      } else {
        setError('Failed to save airline');
      }
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://localhost:7085/api/Airlines/${airlineToDelete.id}`);
      setShowDeleteModal(false);
      setAirlineToDelete(null);
      fetchAirlines();
    } catch (err) {
      setError('Failed to delete airline');
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, logo: e.target.files[0] });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Airlines Management</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your system's airlines</p>
          </div>
          <button
            onClick={() => {
              setEditingAirline(null);
              setFormData({ name: '', iata: '', icao: '', countryId: '', logo: null });
              setApiErrors({});
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
            Add Airline
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IATA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ICAO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {airlines.map((airline) => (
                  <tr key={airline.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={`https://localhost:7085/uploads/${airline.logoUrl}`} 
                        alt={airline.name}
                        className="h-8 w-8 object-contain"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/32?text=NA';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {airline.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {airline.iata}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {airline.icao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${airline.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                      >
                        {airline.isDeleted ? 'Deleted' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                    <button
                        onClick={() => {
                          setEditingAirline(airline);
                          setFormData({
                            name: airline.name,
                            iata: airline.iata,
                            icao: airline.icao,
                            countryId: airline.countryId,
                            logo: null
                          });
                          setApiErrors({});
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            if (airline.isDeleted) {
                              await axios.patch(`https://localhost:7085/api/Airlines/${airline.id}/revert`);
                            } else {
                              await axios.patch(`https://localhost:7085/api/Airlines/${airline.id}/soft-delete`);
                            }
                            fetchAirlines();
                          } catch (err) {
                            setError('Failed to update airline status');
                          }
                        }}
                        className={`${airline.isDeleted ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'} font-medium`}
                      >
                        {airline.isDeleted ? 'Revert' : 'Soft Delete'}
                      </button>
                      <button
                        onClick={async () => {
                          await fetchAirlineDetails(airline.id);
                          setShowDetails(true);
                        }}
                        className="text-purple-600 hover:text-purple-900 font-medium"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          setAirlineToDelete(airline);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {editingAirline ? 'Edit Airline' : 'Add New Airline'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Airline Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        {apiErrors?.Name && (
                          <p className="mt-1 text-sm text-red-600">{apiErrors.Name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <select
                          value={formData.countryId}
                          onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select a country</option>
                          {countries.map((country) => (
                            <option key={country.id} value={country.id}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                        {apiErrors?.CountryId && (
                          <p className="mt-1 text-sm text-red-600">{apiErrors.CountryId}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            IATA Code
                          </label>
                          <input
                            type="text"
                            value={formData.iata}
                            onChange={(e) => setFormData({ ...formData, iata: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            maxLength="2"
                            required
                          />
                          {apiErrors?.IATA && (
                            <p className="mt-1 text-sm text-red-600">{apiErrors.IATA}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ICAO Code
                          </label>
                          <input
                            type="text"
                            value={formData.icao}
                            onChange={(e) => setFormData({ ...formData, icao: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            maxLength="3"
                            required
                          />
                          {apiErrors?.ICAO && (
                            <p className="mt-1 text-sm text-red-600">{apiErrors.ICAO}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo
                        </label>
                        <div className="mt-1 flex items-center">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="sr-only"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Choose File
                          </label>
                          <span className="ml-3 text-sm text-gray-500">
                            {formData.logo ? formData.logo.name : 'No file chosen'}
                          </span>
                        </div>
                        {apiErrors?.Logo && (
                          <p className="mt-1 text-sm text-red-600">{apiErrors.Logo}</p>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editingAirline ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedAirline && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="relative bg-white rounded-lg max-w-6xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <img
                      src={`https://localhost:7085/uploads/${selectedAirline.logoUrl}`}
                      alt={selectedAirline.name}
                      className="h-12 w-12 object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/48?text=NA';
                      }}
                    />
                    <h3 className="text-lg font-medium text-gray-900">
                      Airline Details: {selectedAirline.name}
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
                    <p className="mt-1 text-sm text-gray-900">{selectedAirline.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Country</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedAirline.country?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">IATA Code</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedAirline.iata}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">ICAO Code</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedAirline.icao}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                      ${selectedAirline.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                    >
                      {selectedAirline.isDeleted ? 'Deleted' : 'Active'}
                    </span>
                  </div>
                </div>

                {/* Aircraft Section */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Aircraft Fleet</h4>
                  {selectedAirline.aircrafts && selectedAirline.aircrafts.length > 0 ? (
                    <div className="mt-2 ring-1 ring-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedAirline.aircrafts.map((aircraft) => (
                            <tr key={aircraft.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{aircraft.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{aircraft.manufacturer}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{aircraft.capacity}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${aircraft.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                                >
                                  {aircraft.isDeleted ? 'Deleted' : 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No aircraft registered for this airline</p>
                  )}
                </div>

                {/* Flights Section */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Flights</h4>
                  {selectedAirline.flights && selectedAirline.flights.length > 0 ? (
                    <div className="mt-2 ring-1 ring-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flight Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aircraft</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedAirline.flights.map((flight) => (
                            <tr key={flight.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{flight.flightNumber}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {flight.origin} → {flight.destination}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(flight.departureTime).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {flight.aircraft?.name || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${flight.price}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${flight.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                                >
                                  {flight.isDeleted ? 'Deleted' : 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No flights scheduled for this airline</p>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Audit Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created By</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedAirline.createdBy}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created Date</p>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedAirline.createdDate)}</p>
                    </div>
                    {selectedAirline.updatedBy && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Updated By</p>
                          <p className="mt-1 text-sm text-gray-900">{selectedAirline.updatedBy}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Updated Date</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedAirline.updatedDate ? formatDate(selectedAirline.updatedDate) : '-'}
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

      {/* Delete Modal */}
      {showDeleteModal && airlineToDelete && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="relative bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Delete Airline</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete airline {airlineToDelete.name}? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirlinesContent; 