import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faSignOutAlt,
  faPlane,
  faGlobe,
  faPlaneDeparture,
  faBlog
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <img
            src="/src/assets/images/Voxafly Admin.svg"
            alt="Voxafly Admin"
            className="h-12"
          />
        </div>

        <nav className="mt-6">
          <div className="px-4 space-y-2">
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 mr-3" />
              Dashboard
            </button>

            <button
              onClick={() => handleTabClick('airlines')}
              className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === 'airlines' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <FontAwesomeIcon icon={faPlane} className="w-5 h-5 mr-3" />
              Airlines
            </button>

            <button
              onClick={() => handleTabClick('countries')}
              className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === 'countries' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <FontAwesomeIcon icon={faGlobe} className="w-5 h-5 mr-3" />
              Countries
            </button>

            <button
              onClick={() => handleTabClick('aircrafts')}
              className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === 'aircrafts' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <FontAwesomeIcon icon={faPlane} className="w-5 h-5 mr-3" />
              Aircrafts
            </button>

            <button
              onClick={() => handleTabClick('flights')}
              className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === 'flights' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <FontAwesomeIcon icon={faPlaneDeparture} className="w-5 h-5 mr-3" />
              Flights
            </button>
            
            <button
              onClick={() => handleTabClick('blogs')}
              className={`flex items-center w-full px-4 py-2 rounded-lg ${activeTab === 'blogs' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <FontAwesomeIcon icon={faBlog} className="w-5 h-5 mr-3" />
              Blogs
            </button>
          
          </div>


          <div className="px-4 mt-auto pt-20">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-8 py-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};


export default AdminPanel; 