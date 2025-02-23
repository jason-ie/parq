import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './comps/Login';
import Signup from './comps/Signup';
import Dashboard from './comps/Dashboard';
import MyBookings from './comps/MyBookings';
import NavTabs from './comps/NavTabs';
import Profile from './comps/profile/Profile';
import EventsDashboard from './comps/EventsDashboard';
import ProtectedRoute from './comps/ProtectedRoute';
import { LoadScript } from '@react-google-maps/api';

const libraries = ['places'];

function App() {
  return (
    <Router>
      <AuthProvider>
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={libraries}
        >
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <div className="min-h-screen bg-gray-50">
                  <h1 className="text-3xl font-bold text-center py-8">parq</h1>
                </div>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/bookings"
              element={
                <ProtectedRoute>
                  <NavTabs />
                  <MyBookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/events"
              element={
                <ProtectedRoute>
                  <NavTabs />
                  <EventsDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/notifications"
              element={
                <ProtectedRoute>
                  <NavTabs />
                  <div className="min-h-screen bg-gray-50 py-12 px-4">
                    <div className="max-w-7xl mx-auto">
                      <h1 className="text-3xl font-bold">Notifications</h1>
                      <p className="mt-4">Coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute>
                  <NavTabs />
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </LoadScript>
      </AuthProvider>
    </Router>
  );
}

export default App;
