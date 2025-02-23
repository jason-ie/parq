import { useState } from 'react';
import { Home, Car, Bell, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../config/firebase';
import UserTitle from './UserTitle/UserTitle.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

const NavTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData } = useAuth();
  const userId = user?.uid;
  const isOwner = userData?.role === 'owner';

  // Set active tab based on current path
  const getActiveTab = (path) => {
    if (path === '/dashboard') return 'home';
    if (path === '/dashboard/bookings') return 'bookings';
    if (path === '/dashboard/events') return 'events';
    if (path === '/dashboard/notifications') return 'notifications';
    if (path === '/dashboard/profile') return 'profile';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab(location.pathname));

  // Define tabs based on user role
  const ownerTabs = [
    { id: 'home', name: 'My Spots', icon: Home, path: '/dashboard' },
    {
      id: 'bookings',
      name: 'Spot Bookings',
      icon: Car,
      path: '/dashboard/bookings',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      path: '/dashboard/notifications',
    },
    { id: 'profile', name: 'Profile', icon: User, path: '/dashboard/profile' },
  ];

  const renterTabs = [
    { id: 'home', name: 'Find Spots', icon: Home, path: '/dashboard' },
    { id: 'events', name: 'Events', icon: Calendar, path: '/dashboard/events' },
    {
      id: 'bookings',
      name: 'My Bookings',
      icon: Car,
      path: '/dashboard/bookings',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      path: '/dashboard/notifications',
    },
    { id: 'profile', name: 'Profile', icon: User, path: '/dashboard/profile' },
  ];

  const tabs = isOwner ? ownerTabs : renterTabs;

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">parq</h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex-1 flex justify-center">
            <div className="hidden sm:flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <UserTitle userId={userId} />
            {user && (
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavTabs;
