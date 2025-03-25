import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const FlightsContent = () => {
  const [flights, setFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [editingFlight, setEditingFlight] = useState(null);
  const [formData, setFormData] = useState({
    airlineId: '',
    aircraftId: '',
    flightNumber: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    price: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [apiErrors, setApiErrors] = useState({});
  const [availableAircrafts, setAvailableAircrafts] = useState([]);

  const fetchFlights = async () => {
    try {
      const response = await axios.get('https://localhost:7085/api/Flights');
      setFlights(response.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch flights');
      setIsLoading(false);
    }
  };

  const fetchAirlines = async () => {
    try {
      const response = await axios.get('https://localhost:7085/api/Airlines');
      setAirlines(response.data.filter(airline => !airline.isDeleted));
    } catch (err) {
      setError('Failed to fetch airlines');
    }
  };

  const fetchAircrafts = async () => {
    try {
      const response = await axios.get('https://localhost:7085/api/Aircrafts');
      setAircrafts(response.data.filter(aircraft => !aircraft.isDeleted));
    } catch (err) {
      setError('Failed to fetch aircrafts');
    }
  };

  const fetchAirlineAircrafts = async (airlineId) => {
    try {
      const response = await axios.get(`https://localhost:7085/api/Airlines/${airlineId}`);
      const airlineData = response.data;
      setAvailableAircrafts(airlineData.aircrafts.filter(aircraft => !aircraft.isDeleted));
    } catch (err) {
      console.error('Error fetching airline aircrafts:', err);
      setError('Failed to fetch aircrafts');
      setAvailableAircrafts([]);
    }
  };

  useEffect(() => {
    fetchFlights();
    fetchAirlines();
    fetchAircrafts();
  }, []);

  useEffect(() => {
    if (editingFlight && editingFlight.airlineId) {
      fetchAirlineAircrafts(editingFlight.airlineId);
    }
  }, [editingFlight]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErrors({});
    
    try {
      if (editingFlight) {
        await axios.put(`https://localhost:7085/api/Flights/${editingFlight.id}`, formData);
      } else {
        await axios.post('https://localhost:7085/api/Flights', formData);
      }
      setIsModalOpen(false);
      setEditingFlight(null);
      setFormData({
        airlineId: '',
        aircraftId: '',
        flightNumber: '',
        origin: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        price: 0
      });
      fetchFlights();
    } catch (err) {
      if (err.response?.data?.errors) {
        setApiErrors(err.response.data.errors);
      } else {
        setError('Failed to save flight');
      }
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://localhost:7085/api/Flights/${flightToDelete.id}`);
      setShowDeleteModal(false);
      setFlightToDelete(null);
      fetchFlights();
    } catch (err) {
      setError('Failed to delete flight');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Flights</h2>
        <button
          onClick={() => {
            setEditingFlight(null);
            setFormData({
              airlineId: '',
              aircraftId: '',
              flightNumber: '',
              origin: '',
              destination: '',
              departureTime: '',
              arrivalTime: '',
              price: 0
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Flight
        </button>
      </div>

      {/* Flights Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Flight Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
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
            {flights.map((flight) => (
              <tr key={flight.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{flight.flightNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {flight.origin} → {flight.destination}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatDateTime(flight.departureTime)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${flight.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${flight.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                  >
                    {flight.isDeleted ? 'Deleted' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <button
                    onClick={() => {
                      setEditingFlight(flight);
                      setFormData({
                        airlineId: flight.airlineId,
                        aircraftId: flight.aircraftId,
                        flightNumber: flight.flightNumber,
                        origin: flight.origin,
                        destination: flight.destination,
                        departureTime: flight.departureTime.slice(0, 16),
                        arrivalTime: flight.arrivalTime.slice(0, 16),
                        price: flight.price
                      });
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        if (flight.isDeleted) {
                          await axios.patch(`https://localhost:7085/api/Flights/${flight.id}/revert`);
                        } else {
                          await axios.patch(`https://localhost:7085/api/Flights/${flight.id}/soft-delete`);
                        }
                        fetchFlights();
                      } catch (err) {
                        console.error('Error updating flight status:', err);
                        setError(err.response?.data?.message || 'Failed to update flight status');
                      }
                    }}
                    className={`${flight.isDeleted ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'} font-medium`}
                  >
                    {flight.isDeleted ? 'Revert' : 'Soft Delete'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFlight(flight);
                      setShowDetails(true);
                    }}
                    className="text-purple-600 hover:text-purple-900 font-medium"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setFlightToDelete(flight);
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

      {/* Add/Edit Flight Modal */}
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
                      {editingFlight ? 'Edit Flight' : 'Add New Flight'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Flight Number
                        </label>
                        <input
                          type="text"
                          value={formData.flightNumber}
                          onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        {apiErrors?.FlightNumber && (
                          <p className="mt-1 text-sm text-red-600">{apiErrors.FlightNumber}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Airline
                          </label>
                          <select
                            value={formData.airlineId}
                            onChange={(e) => {
                              const newAirlineId = parseInt(e.target.value);
                              setFormData({ 
                                ...formData, 
                                airlineId: newAirlineId,
                                aircraftId: '' 
                              });
                              if (newAirlineId) {
                                fetchAirlineAircrafts(newAirlineId);
                              } else {
                                setAvailableAircrafts([]);
                              }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select Airline</option>
                            {airlines.map((airline) => (
                              <option key={airline.id} value={airline.id}>
                                {airline.name}
                              </option>
                            ))}
                          </select>
                          {apiErrors?.AirlineId && (
                            <p className="mt-1 text-sm text-red-600">{apiErrors.AirlineId}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Aircraft
                          </label>
                          <select
                            value={formData.aircraftId}
                            onChange={(e) => setFormData({ ...formData, aircraftId: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={!formData.airlineId}
                          >
                            <option value="">Select Aircraft</option>
                            {availableAircrafts.map((aircraft) => (
                              <option key={aircraft.id} value={aircraft.id}>
                                {aircraft.name} - {aircraft.manufacturer}
                              </option>
                            ))}
                          </select>
                          {!formData.airlineId && (
                            <p className="mt-1 text-sm text-gray-500">Please select an airline first</p>
                          )}
                          {formData.airlineId && availableAircrafts.length === 0 && (
                            <p className="mt-1 text-sm text-orange-500">No aircraft available for this airline</p>
                          )}
                          {apiErrors?.AircraftId && (
                            <p className="mt-1 text-sm text-red-600">{apiErrors.AircraftId}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Origin
                          </label>
                          <input
                            type="text"
                            value={formData.origin}
                            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          {apiErrors?.Origin && (
                            <p className="mt-1 text-sm text-red-600">{apiErrors.Origin}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Destination
                          </label>
                          <input
                            type="text"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          {apiErrors?.Destination && (
                            <p className="mt-1 text-sm text-red-600">{apiErrors.Destination}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Departure Time
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.departureTime}
                            onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          {apiErrors?.DepartureTime && (
                            <p className="mt-1 text-sm text-red-600">{apiErrors.DepartureTime}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Arrival Time
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.arrivalTime}
                            onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          {apiErrors?.ArrivalTime && (
                            <p className="mt-1 text-sm text-red-600">{apiErrors.ArrivalTime}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                          min="0"
                          step="0.01"
                        />
                        {apiErrors?.Price && (
                          <p className="mt-1 text-sm text-red-600">{apiErrors.Price}</p>
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
                  {editingFlight ? 'Update' : 'Add'}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && flightToDelete && (
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
                    <h3 className="text-lg font-medium text-gray-900">Delete Flight</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete flight {flightToDelete.flightNumber}? This action cannot be undone.
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

      {/* Flight Details Modal */}
      {showDetails && selectedFlight && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">
                    Flight Details: {selectedFlight.flightNumber}
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Route</p>
                    <p className="mt-1">{selectedFlight.origin} → {selectedFlight.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="mt-1">{selectedFlight.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Departure</p>
                    <p className="mt-1">{formatDateTime(selectedFlight.departureTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Arrival</p>
                    <p className="mt-1">{formatDateTime(selectedFlight.arrivalTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Price</p>
                    <p className="mt-1">${selectedFlight.price}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                      ${selectedFlight.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                    >
                      {selectedFlight.isDeleted ? 'Deleted' : 'Active'}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Audit Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created By</p>
                      <p className="mt-1">{selectedFlight.createdBy}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created Date</p>
                      <p className="mt-1">{formatDateTime(selectedFlight.createdDate)}</p>
                    </div>
                    {selectedFlight.updatedBy && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Updated By</p>
                          <p className="mt-1">{selectedFlight.updatedBy}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Updated Date</p>
                          <p className="mt-1">{formatDateTime(selectedFlight.updatedDate)}</p>
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
    </div>
  );
};

export default FlightsContent; 