import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import CountriesContent from './pages/Countries';
import AirlinesContent from './pages/Airlines';
import AircraftsContent from './pages/Aircrafts';
import FlightsContent from './pages/Flights';
import { DashboardContent } from './pages/Dashboard';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Blogs from './pages/Blogs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardContent />} />
          <Route path="airlines" element={<AirlinesContent />} />
          <Route path="countries" element={<CountriesContent />} />
          <Route path="aircrafts" element={<AircraftsContent />} />
          <Route path="flights" element={<FlightsContent />} />
          <Route path="blogs" element={<Blogs />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
