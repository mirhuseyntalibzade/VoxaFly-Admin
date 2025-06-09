import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTimes,
  faExclamationTriangle,
  faPlane,
  faChair,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

const AircraftsContent = () => {
  const [aircrafts, setAircrafts] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [aircraftToDelete, setAircraftToDelete] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    aircraft: {
      name: '',
      manufacturer: '',
      capacity: 0,
      airlineId: ''
    },
    seatClasses: [
      {
        className: '',
        startingRow: 1,
        endingRow: 1,
        autoAssign: false,
        columns: ['A']
      }
    ]
  });
  const [showSeatVisualization, setShowSeatVisualization] = useState(false);
  const [aircraftDetails, setAircraftDetails] = useState(null);

  const fetchAircrafts = async () => {
    try {
      const response = await axios.get('https://localhost:7085/api/Aircrafts');
      setAircrafts(response.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch aircrafts');
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

  const fetchAircraftDetails = async (id) => {
    try {
      const response = await axios.get(`https://localhost:7085/api/Aircrafts/${id}`);
      setAircraftDetails(response.data);

      const newSeatMap = {};
      response.data.seatClasses.forEach(seatClass => {
        for (let row = seatClass.startingRow; row <= seatClass.endingRow; row++) {
          seatClass.columns.forEach(col => {
            const seatKey = `${row}${col}`;
            newSeatMap[seatKey] = {
              className: seatClass.className,
              row: row,
              column: col
            };
          });
        }
      });
      setSeatMap(newSeatMap);
    } catch (err) {
      console.error('Error fetching aircraft details:', err);
      setError('Failed to fetch aircraft details');
    }
  };

  useEffect(() => {
    fetchAircrafts();
    fetchAirlines();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErrors({});

    try {
      if (editingAircraft) {
        await axios.put(`https://localhost:7085/api/Aircrafts/${editingAircraft.id}`, formData);
      } else {
        await axios.post('https://localhost:7085/api/Aircrafts', formData);
      }
      setIsModalOpen(false);
      setEditingAircraft(null);
      setFormData({
        aircraft: {
          name: '',
          manufacturer: '',
          capacity: 0,
          airlineId: ''
        },
        seatClasses: [
          {
            className: '',
            startingRow: 1,
            endingRow: 1,
            autoAssign: false,
            columns: ['A']
          }
        ]
      });
      fetchAircrafts();
    } catch (err) {
      if (err.response?.data?.errors) {
        setApiErrors(err.response.data.errors);
      } else {
        setError('Failed to save aircraft');
      }
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://localhost:7085/api/Aircrafts/${aircraftToDelete.id}`);
      setShowDeleteModal(false);
      setAircraftToDelete(null);
      fetchAircrafts();
    } catch (err) {
      setError('Failed to delete aircraft');
    }
  };

  const addSeatClass = () => {
    setFormData({
      ...formData,
      seatClasses: [
        ...formData.seatClasses,
        {
          className: '',
          startingRow: 1,
          endingRow: 1,
          autoAssign: false,
          columns: ['A']
        }
      ]
    });
  };

  const removeSeatClass = (index) => {
    const newSeatClasses = [...formData.seatClasses];
    newSeatClasses.splice(index, 1);
    setFormData({
      ...formData,
      seatClasses: newSeatClasses
    });
  };

  const updateSeatClass = (index, field, value) => {
    const newSeatClasses = [...formData.seatClasses];
    if (field === 'columns') {
      value = value.split(',').map(col => col.trim().toUpperCase());
    }
    newSeatClasses[index] = {
      ...newSeatClasses[index],
      [field]: value
    };
    setFormData({
      ...formData,
      seatClasses: newSeatClasses
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Aircrafts</h2>
        <button
          onClick={() => {
            setEditingAircraft(null);
            setFormData({
              aircraft: {
                name: '',
                manufacturer: '',
                capacity: 0,
                airlineId: ''
              },
              seatClasses: [
                {
                  className: '',
                  startingRow: 1,
                  endingRow: 1,
                  autoAssign: false,
                  columns: ['A']
                }
              ]
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Aircraft
        </button>
      </div>

      {/* Aircraft Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Manufacturer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
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
            {aircrafts.map((aircraft) => (
              <tr key={aircraft.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{aircraft.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{aircraft.manufacturer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{aircraft.capacity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${aircraft.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                  >
                    {aircraft.isDeleted ? 'Deleted' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <button
                    onClick={() => {
                      setEditingAircraft(aircraft);
                      setFormData({
                        aircraft: {
                          name: aircraft.name,
                          manufacturer: aircraft.manufacturer,
                          capacity: aircraft.capacity,
                          airlineId: aircraft.airlineId
                        },
                        seatClasses: aircraft.seatClasses.map(seatClass => ({
                          ...seatClass,
                          autoAssign: seatClass.autoAssign || false
                        }))
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
                        if (aircraft.isDeleted) {
                          await axios.patch(`https://localhost:7085/api/Aircrafts/${aircraft.id}/revert`);
                        } else {
                          await axios.patch(`https://localhost:7085/api/Aircrafts/${aircraft.id}/soft-delete`);
                        }
                        fetchAircrafts();
                      } catch (err) {
                        console.error('Error updating aircraft status:', err);
                        setError(err.response?.data?.message || 'Failed to update aircraft status');
                      }
                    }}
                    className={`${aircraft.isDeleted ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'} font-medium`}
                  >
                    {aircraft.isDeleted ? 'Revert' : 'Soft Delete'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAircraft(aircraft);
                      setShowDetails(true);
                    }}
                    className="text-purple-600 hover:text-purple-900 font-medium"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setAircraftToDelete(aircraft);
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
                      {editingAircraft ? 'Edit Aircraft' : 'Add New Aircraft'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aircraft Name
                        </label>
                        <input
                          type="text"
                          value={formData.aircraft.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            aircraft: { ...formData.aircraft, name: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manufacturer
                        </label>
                        <input
                          type="text"
                          value={formData.aircraft.manufacturer}
                          onChange={(e) => setFormData({
                            ...formData,
                            aircraft: { ...formData.aircraft, manufacturer: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Capacity
                          </label>
                          <input
                            type="number"
                            value={formData.aircraft.capacity}
                            onChange={(e) => setFormData({
                              ...formData,
                              aircraft: { ...formData.aircraft, capacity: parseInt(e.target.value) }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Airline
                          </label>
                          <select
                            value={formData.aircraft.airlineId}
                            onChange={(e) => setFormData({
                              ...formData,
                              aircraft: { ...formData.aircraft, airlineId: parseInt(e.target.value) }
                            })}
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
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-md font-medium text-gray-900">Seat Classes</h4>
                          <button
                            type="button"
                            onClick={addSeatClass}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            + Add Class
                          </button>
                        </div>

                        {formData.seatClasses.map((seatClass, index) => (
                          <div key={index} className="mb-4 p-4 rounded-md border border-gray-200 bg-gray-50">
                            <div className="flex justify-between items-start mb-4">
                              <h5 className="text-sm font-medium text-gray-700">Class {index + 1}</h5>
                              <button
                                type="button"
                                onClick={() => removeSeatClass(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Class Name
                                </label>
                                <input
                                  type="text"
                                  value={seatClass.className}
                                  onChange={(e) => updateSeatClass(index, 'className', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Starting Row
                                  </label>
                                  <input
                                    type="number"
                                    value={seatClass.startingRow}
                                    onChange={(e) => updateSeatClass(index, 'startingRow', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    min="1"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ending Row
                                  </label>
                                  <input
                                    type="number"
                                    value={seatClass.endingRow}
                                    onChange={(e) => updateSeatClass(index, 'endingRow', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    min="1"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Columns (comma-separated letters, e.g., A,B,C)
                                </label>
                                <input
                                  type="text"
                                  value={seatClass.columns.join(',')}
                                  onChange={(e) => updateSeatClass(index, 'columns', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                  required
                                />
                              </div>

                              <div className='flex items-center gap-3 mt-4'>
                                <input
                                  type="checkbox"
                                  checked={seatClass.autoAssign}
                                  onChange={(e) => {
                                    const updatedSeatClasses = [...formData.seatClasses];
                                    updatedSeatClasses[index] = {
                                      ...seatClass,
                                      autoAssign: e.target.checked
                                    };
                                    setFormData({
                                      ...formData,
                                      seatClasses: updatedSeatClasses
                                    });
                                  }}
                                />
                                <label className="text-sm font-medium text-gray-700">
                                  Auto-Assign
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
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
                  {editingAircraft ? 'Update' : 'Add'}
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
      {showDeleteModal && aircraftToDelete && (
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
                    <h3 className="text-lg font-medium text-gray-900">Delete Aircraft</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this aircraft? This action cannot be undone.
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

      {/* Details Modal */}
      {showDetails && selectedAircraft && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">
                    Aircraft Details: {selectedAircraft.name}
                  </h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={async () => {
                        await fetchAircraftDetails(selectedAircraft.id);
                        setShowSeatVisualization(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                    >
                      <FontAwesomeIcon icon={faChair} className="mr-2" />
                      Visualize Seats
                    </button>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="mt-1">{selectedAircraft.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Manufacturer</p>
                    <p className="mt-1">{selectedAircraft.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Capacity</p>
                    <p className="mt-1">{selectedAircraft.capacity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                      ${selectedAircraft.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                    >
                      {selectedAircraft.isDeleted ? 'Deleted' : 'Active'}
                    </span>
                  </div>
                </div>

                {selectedAircraft.seatClasses && selectedAircraft.seatClasses.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Seat Classes</h4>
                    <div className="space-y-4">
                      {selectedAircraft.seatClasses.map((seatClass, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <h5 className="font-medium text-gray-700 mb-2">{seatClass.className}</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Rows</p>
                              <p className="mt-1">{seatClass.startingRow} - {seatClass.endingRow}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Columns</p>
                              <p className="mt-1">{seatClass.columns.join(', ')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Audit Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created By</p>
                      <p className="mt-1">{selectedAircraft.createdBy}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created Date</p>
                      <p className="mt-1">{new Date(selectedAircraft.createdDate).toLocaleString()}</p>
                    </div>
                    {selectedAircraft.updatedBy && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Updated By</p>
                          <p className="mt-1">{selectedAircraft.updatedBy}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Updated Date</p>
                          <p className="mt-1">{new Date(selectedAircraft.updatedDate).toLocaleString()}</p>
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

      {/* Seat Visualization Modal */}
      {showSeatVisualization && aircraftDetails && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="relative bg-white rounded-lg max-w-6xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Seat Map: {aircraftDetails.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {aircraftDetails.manufacturer} - Capacity: {aircraftDetails.capacity} seats
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSeatVisualization(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  {aircraftDetails.seatClasses.map((seatClass, classIndex) => (
                    <div key={classIndex} className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900 flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${seatClass.className === 'Business' ? 'bg-blue-100' :
                            seatClass.className === 'First' ? 'bg-purple-100' :
                              'bg-gray-100'
                          }`}></div>
                        {seatClass.className} Class (Rows {seatClass.startingRow}-{seatClass.endingRow})
                      </h4>

                      <div className="relative bg-gray-50 p-6 rounded-lg">
                        {/* Column labels */}
                        <div className="flex justify-center mb-4 pl-8">
                          {seatClass.columns.map((col) => (
                            <div key={col} className="w-10 text-center text-sm font-medium text-gray-500">
                              {col}
                            </div>
                          ))}
                        </div>

                        {/* Rows */}
                        {Array.from(
                          { length: seatClass.endingRow - seatClass.startingRow + 1 },
                          (_, rowIndex) => {
                            const currentRow = seatClass.startingRow + rowIndex;
                            return (
                              <div key={currentRow} className="flex items-center mb-2">
                                {/* Row number */}
                                <div className="w-8 text-right mr-4 text-sm font-medium text-gray-500">
                                  {currentRow}
                                </div>

                                {/* Seats */}
                                <div className="flex space-x-2">
                                  {seatClass.columns.map((col, colIndex) => {
                                    const seatNumber = `${currentRow}${col}`;
                                    const isAisle = colIndex === Math.floor(seatClass.columns.length / 2) - 1;

                                    return (
                                      <>
                                        <div key={seatNumber} className="relative group">
                                          <div className={`w-12 h-12 flex flex-col items-center justify-between p-1 border-2 rounded-t-lg
                                            ${seatClass.className === 'Business' ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' :
                                              seatClass.className === 'First' ? 'bg-purple-50 hover:bg-purple-100 border-purple-200' :
                                                'bg-white hover:bg-gray-50 border-gray-200'} 
                                            cursor-pointer transition-colors duration-200`}>
                                            {/* Seat backrest */}
                                            <div className="w-full h-2 bg-current opacity-20 rounded-t-sm"></div>

                                            {/* Seat number */}
                                            <span className="text-xs font-medium text-gray-700">
                                              {seatNumber}
                                            </span>

                                            {/* Seat bottom */}
                                            <div className="w-full h-1 bg-current opacity-20 rounded-b-sm"></div>
                                          </div>

                                          <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                                            Seat {seatNumber} - {seatClass.className} Class
                                          </div>
                                        </div>
                                        {/* Add aisle space */}
                                        {isAisle && <div className="w-8" />}
                                      </>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-8 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Class Legend</h4>
                  <div className="flex space-x-6">
                    {aircraftDetails.seatClasses.map((seatClass, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${seatClass.className === 'Business' ? 'bg-blue-100' :
                            seatClass.className === 'First' ? 'bg-purple-100' :
                              'bg-gray-100'
                          }`}></div>
                        <span className="text-sm text-gray-600">
                          {seatClass.className} Class ({seatClass.columns.length} seats per row)
                        </span>
                      </div>
                    ))}
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

export default AircraftsContent; 