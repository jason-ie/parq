import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { auth } from '../config/firebase';
import { Plus, Edit2, Trash2, DollarSign, Clock, MapPin } from 'lucide-react';
import { getOwnerSpots, deleteSpot } from '../utils/spotManagement';
import NavTabs from './NavTabs';
import Profile from './profile/Profile';

const SpotsList = ({ spots, loading, error, onDelete, navigate }) => {
  if (loading) {
    return <div className="text-center">Loading your spots...</div>;
  }

  if (spots.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No parking spots yet
        </h3>
        <p className="text-gray-600">
          Start by adding your first parking spot.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {spots.map((spot) => (
        <div
          key={spot.id}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="relative h-48">
            <img
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${
                spot.location.coordinates.lat
              },${
                spot.location.coordinates.lng
              }&zoom=15&size=400x200&markers=color:red%7C${
                spot.location.coordinates.lat
              },${spot.location.coordinates.lng}&key=${
                import.meta.env.VITE_GOOGLE_MAPS_API_KEY
              }`}
              alt={`Map preview of ${spot.location.address}`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">
                  {spot.location.address}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>
                    {spot.location.city}, {spot.location.state}
                  </span>
                </div>
              </div>
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                <span className="text-sm">{spot.type}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="w-4 h-4 mr-2" />
                <span>${spot.price}/hour</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  {spot.availability.start} - {spot.availability.end}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
              <button
                onClick={() => navigate(`/edit-spot/${spot.id}`)}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDelete(spot.id)}
                className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSpots = async () => {
      if (!user) return;

      try {
        const userSpots = await getOwnerSpots(user.uid);
        setSpots(userSpots);
      } catch (error) {
        console.error('Error loading spots:', error);
        setError('Failed to load your parking spots');
      } finally {
        setLoading(false);
      }
    };

    loadSpots();
  }, [user]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleDelete = async (spotId) => {
    if (!window.confirm('Are you sure you want to delete this spot?')) {
      return;
    }

    try {
      await deleteSpot(spotId);
      setSpots(spots.filter((spot) => spot.id !== spotId));
    } catch (error) {
      console.error('Error deleting spot:', error);
      setError('Failed to delete spot');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavTabs />

      <Routes>
        <Route
          path="/"
          element={
            <div className="py-12 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Manage Your Parking Spots
                    </h1>
                  </div>
                  <div className="space-x-4">
                    <button
                      onClick={() => navigate('/add-spot')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add New Spot
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <SpotsList
                  spots={spots}
                  loading={loading}
                  error={error}
                  onDelete={handleDelete}
                  navigate={navigate}
                />
              </div>
            </div>
          }
        />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}
