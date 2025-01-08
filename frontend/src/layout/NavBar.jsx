import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  ShoppingBag, 
  MessageSquare, 
  Menu, 
  X, 
  User,
  ChevronDown,
  LogOut,
  Settings,
  Bell,
  Heart,
  Store,
  ShieldCheck,
  UserCircle
} from 'lucide-react';
import logo from '../assets/logo/gallopinglogo.png';
import axios from 'axios';

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/users/notifications');
      if (response.data?.success && Array.isArray(response.data?.notifications)) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setNotifications([]);
    }
  };

  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter(n => !n.isRead).length 
    : 0;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const publicMenuItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Browse', path: '/browse', icon: ShoppingBag },
    { label: 'Pricing', path: '/pricing', icon: MessageSquare },
  ];

  const userMenuItems = [
    { label: 'My Favorites', path: '/favorites', icon: Heart },
    { label: 'My Inquiries', path: '/inquiries', icon: MessageSquare },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const sellerMenuItems = [
    { label: 'Dashboard', path: '/seller/dashboard', icon: Store },
    { label: 'My Listings', path: '/seller/listings', icon: ShoppingBag },
    { label: 'Inquiries', path: '/seller/inquiries', icon: MessageSquare },
    { label: 'Settings', path: '/seller/settings', icon: Settings },
  ];

  const adminMenuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: ShieldCheck },
    { label: 'Users', path: '/admin/users', icon: User },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const getMenuItems = () => {
    if (!isAuthenticated) return publicMenuItems;
    if (user?.role === 'admin') return adminMenuItems;
    if (user?.role === 'seller') return sellerMenuItems;
    return publicMenuItems;
  };

  const getMobileMenuItems = () => {
    if (!isAuthenticated) return publicMenuItems;
    if (user?.role === 'admin') return [...adminMenuItems];
    if (user?.role === 'seller') return [...sellerMenuItems];
    return [...userMenuItems];
  };

  const renderProfileMenu = () => (
    <div className="relative">
      <button
        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-tertiary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary transition-all duration-300"
      >
        <div className="relative">
          <UserCircle className="h-6 w-6" />
          <div className="absolute bottom-0 right-0 h-2 w-2 bg-green-400 rounded-full border border-white"></div>
        </div>
        <span>{user?.name || 'Profile'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      {isProfileMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 border border-gray-100 backdrop-blur-sm bg-white/95">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-tertiary">{user?.name}</p>
            <p className="text-xs text-tertiary/70">{user?.email}</p>
          </div>

          <div className="py-2">
            {(user?.role === 'seller' ? sellerMenuItems : userMenuItems).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsProfileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2.5 text-sm text-tertiary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary transition-all duration-300"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <Link
            to="/notifications"
            className="flex items-center space-x-2 px-4 py-2.5 text-sm text-tertiary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary border-t border-gray-100 transition-all duration-300"
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <nav className="bg-white/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <img 
                src={logo} 
                alt="Galloping Gears" 
                className="h-10 w-auto relative"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Galloping Gears
              </h1>
              <p className="text-xs text-tertiary/70">
                Premium Horse Marketplace
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {getMenuItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-4 py-2 rounded-xl text-sm font-medium text-tertiary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary transition-all duration-300"
              >
                <span className="flex items-center space-x-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </span>
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-xl text-tertiary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary transition-all duration-300"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-white text-xs flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {renderProfileMenu()}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-primary hover:text-accent px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                >
                  Register
                </Link>
                <Link
                  to="/register/seller"
                  className="relative group px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20 rounded-xl group-hover:opacity-30 transition-all duration-300"></div>
                  <span className="relative text-primary group-hover:text-accent">Become a Seller</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-xl text-tertiary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary transition-all duration-300"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-white text-xs flex items-center justify-center rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              className="p-2 rounded-xl text-tertiary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-lg px-6 py-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Menu</h2>
              <button
                className="p-2 rounded-xl text-tertiary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {isAuthenticated && (
              <div className="mb-8">
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
                  <UserCircle className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium text-tertiary">{user?.name}</p>
                    <p className="text-sm text-tertiary/70">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {getMobileMenuItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-2 px-4 py-3 rounded-xl text-tertiary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {!isAuthenticated ? (
              <div className="mt-8 space-y-3">
                <Link
                  to="/login"
                  className="block w-full text-center bg-gradient-to-r from-primary/10 to-accent/10 text-primary hover:from-primary/20 hover:to-accent/20 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
                <Link
                  to="/register/seller"
                  className="block w-full text-center border-2 border-primary/20 text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Become a Seller
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="mt-8 flex items-center space-x-2 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;