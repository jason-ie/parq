import { useState } from 'react';
import { Home, Car, Bell, User, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';

const NavTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData } = useAuth();
  const isOwner = userData?.role === 'owner';

  const getActiveTab = (path) => {
    if (path === '/dashboard') return 'home';
    if (path === '/dashboard/bookings') return 'bookings';
    if (path === '/dashboard/events') return 'events';
    if (path === '/dashboard/notifications') return 'notifications';
    if (path === '/dashboard/profile') return 'profile';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab(location.pathname));

  const ownerTabs = [
    { id: 'home', name: 'My Spots', icon: Home, path: '/dashboard' },
    { id: 'bookings', name: 'Bookings', icon: Car, path: '/dashboard/bookings' },
    { id: 'notifications', name: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
    { id: 'profile', name: 'Profile', icon: User, path: '/dashboard/profile' },
  ];

  const renterTabs = [
    { id: 'home', name: 'Find Spots', icon: Home, path: '/dashboard' },
    { id: 'events', name: 'Events', icon: Calendar, path: '/dashboard/events' },
    { id: 'bookings', name: 'My Bookings', icon: Car, path: '/dashboard/bookings' },
    { id: 'notifications', name: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
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

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = userData?.name || user?.email?.split('@')[0] || 'Guest';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-8">

          {/* Logo */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-shrink-0 cursor-pointer group"
          >
            <span className="text-[22px] font-black text-gray-900 tracking-tighter leading-none group-hover:text-gray-600 transition-colors duration-150">
              parq
            </span>
          </button>

          {/* Nav tabs — scrollable on small screens */}
          <nav className="flex flex-1 items-stretch gap-0 overflow-x-auto min-w-0 -mb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`flex items-center gap-1.5 px-3 h-14 text-sm whitespace-nowrap border-b-2 transition-all duration-150 cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'border-gray-900 text-gray-900 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 font-medium'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>

          {/* User */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
                <span className="text-white text-[11px] font-bold leading-none">
                  {getInitials(userData?.name)}
                </span>
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {displayName}
              </span>
            </div>

            {user && (
              <button
                onClick={handleLogout}
                title="Log out"
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors duration-150 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block text-sm font-medium">Log out</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default NavTabs;
