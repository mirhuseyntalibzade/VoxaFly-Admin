import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTicket,
  faDollarSign,
  faUsers,
  faPlane,
  faArrowUp,
  faArrowDown,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

export const DashboardContent = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Bookings"
          value="1,234"
          change="+12.5%"
          type="positive"
          icon={faTicket}
          color="blue"
        />
        <DashboardCard
          title="Revenue"
          value="$45,678"
          change="+8.3%"
          type="positive"
          icon={faDollarSign}
          color="green"
        />
        <DashboardCard
          title="Active Users"
          value="892"
          change="-2.1%"
          type="negative"
          icon={faUsers}
          color="purple"
        />
        <DashboardCard
          title="Flight Load"
          value="76%"
          change="+5.2%"
          type="positive"
          icon={faPlane}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Popular Routes</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            <RouteItem
              from="New York"
              to="London"
              bookings={234}
              growth={12.5}
            />
            <RouteItem
              from="Paris"
              to="Dubai"
              bookings={189}
              growth={8.3}
            />
            <RouteItem
              from="Tokyo"
              to="Singapore"
              bookings={156}
              growth={-2.1}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <select className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="space-y-4">
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, change, type, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <FontAwesomeIcon icon={icon} className="w-6 h-6" />
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          type === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {change}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const RouteItem = ({ from, to, bookings, growth }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-4">
      <div className="flex items-center text-gray-800">
        <span className="font-medium">{from}</span>
        <FontAwesomeIcon icon={faArrowRight} className="mx-3 text-gray-400" />
        <span className="font-medium">{to}</span>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <span className="text-gray-600">{bookings} bookings</span>
      <span className={`flex items-center ${
        growth >= 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        <FontAwesomeIcon 
          icon={growth >= 0 ? faArrowUp : faArrowDown} 
          className="mr-1 text-xs" 
        />
        {Math.abs(growth)}%
      </span>
    </div>
  </div>
); 