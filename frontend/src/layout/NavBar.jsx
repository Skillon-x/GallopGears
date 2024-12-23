import React, { useState } from 'react';
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
import logo from '../assets/react.svg';

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
    console.log(user.role);
    if (user?.role === 'admin') return [...adminMenuItems];
    if (user?.role === 'seller') return [...sellerMenuItems];
    return [...userMenuItems];
  };

  const renderProfileMenu = () => (
    <div className="relative">
      <button
        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-tertiary hover:bg-primary/10 hover:text-primary transition-all duration-200"
      >
        <UserCircle className="h-6 w-6" />
        <span>{user?.name || 'Profile'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      {isProfileMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-secondary/10">
          <div className="px-4 py-2 border-b border-secondary/10">
            <p className="text-sm font-medium text-tertiary">{user?.name}</p>
            <p className="text-xs text-tertiary/70">{user?.email}</p>
          </div>

          {/* Role-specific menu items */}
          <div className="py-2">
            {(user?.role === 'seller' ? sellerMenuItems : userMenuItems).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsProfileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-tertiary hover:bg-primary/10 hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="flex items-center space-x-2 px-4 py-2 text-sm text-tertiary hover:bg-primary/10 hover:text-primary border-t border-secondary/10"
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <nav className="bg-white/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src={logo} 
              alt="Galloping Gears" 
              className="h-7 w-auto sm:h-8 md:h-10"
            />
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-primary">
                Galloping Gears
              </h1>
              <p className="text-[10px] sm:text-xs text-tertiary/70 hidden md:block">
                Premium Horse Marketplace
              </p>
            </div>
            {/* Mobile Title */}
            <h1 className="sm:hidden text-sm font-bold text-primary">
              Galloping Gears
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {getMenuItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-3 py-2 rounded-md text-sm font-medium text-tertiary hover:bg-primary/10 hover:text-primary transition-all duration-200"
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
                  className="relative p-2 rounded-md text-tertiary hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  <Bell className="h-5 w-5" />
                  {/* Notification Badge */}
                  <span className="absolute top-0 right-0 h-2 w-2 bg-accent rounded-full"></span>
                </Link>
                {renderProfileMenu()}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-primary hover:text-accent px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white hover:bg-accent px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Register
                </Link>
                <Link
                  to="/register/seller"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Become a Seller
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Section */}
          <div className="flex lg:hidden items-center space-x-2 sm:space-x-3">
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-1.5 sm:p-2 rounded-md text-tertiary hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <Bell className="h-5 w-5" />
                {/* Notification Badge */}
                <span className="absolute top-0 right-0 h-2 w-2 bg-accent rounded-full"></span>
              </Link>
            )}
            <button
              className="p-1.5 sm:p-2 rounded-md text-tertiary hover:text-primary hover:bg-primary/10 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Full Screen Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <div className="lg:hidden fixed inset-0 w-full min-h-screen bg-white z-[70]">
              {/* Mobile Header */}
              <div className="sticky top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 md:h-20 border-b border-gray-100 bg-white">
                <Link 
                  to="/" 
                  className="flex items-center space-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <img 
                    src={logo} 
                    alt="Galloping Gears" 
                    className="h-7 w-auto sm:h-8"
                  />
                  <span className="text-base sm:text-lg font-bold text-primary">
                    Galloping Gears
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-tertiary hover:text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              {/* Content Container */}
              <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-y-auto">
                {/* User Profile Section (if authenticated) */}
                {isAuthenticated && (
                  <div className="px-4 sm:px-6 py-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCircle className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-medium text-tertiary">{user?.name}</p>
                        <p className="text-xs sm:text-sm text-tertiary/70">{user?.email}</p>
                        <p className="text-xs text-primary mt-1">
                          {user?.role === 'admin' ? 'Administrator' : user?.isSeller ? 'Seller Account' : 'User Account'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu Items Container */}
                <div className="flex flex-col justify-between h-full">
                  <div className="flex-1 px-4 sm:px-6 py-6">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Always show Home and Browse for all users */}
                      <Link
                        to="/"
                        className="flex items-center space-x-3 sm:space-x-4 px-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium text-tertiary hover:bg-primary/10 hover:text-primary transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Home className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span>Home</span>
                      </Link>
                      <Link
                        to="/browse"
                        className="flex items-center space-x-3 sm:space-x-4 px-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium text-tertiary hover:bg-primary/10 hover:text-primary transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span>Browse</span>
                      </Link>

                      {/* Role-specific menu items */}
                      {isAuthenticated && (
                        <>
                          <div className="pt-2">
                            <div className="px-4 py-2">
                              <p className="text-xs font-medium text-tertiary/50 uppercase tracking-wider">
                                {user?.role === 'admin' ? 'Admin Menu' : user?.isSeller ? 'Seller Menu' : 'Account Menu'}
                              </p>
                            </div>
                            {getMobileMenuItems().map((item) => (
                              <Link
                                key={item.path}
                                to={item.path}
                                className="flex items-center space-x-3 sm:space-x-4 px-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium text-tertiary hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                <span>{item.label}</span>
                              </Link>
                            ))}
                          </div>

                          {/* Notifications Section */}
                          <div className="pt-2">
                            <div className="px-4 py-2">
                              <p className="text-xs font-medium text-tertiary/50 uppercase tracking-wider">
                                Notifications
                              </p>
                            </div>
                            <Link
                              to="/notifications"
                              className="flex items-center space-x-3 sm:space-x-4 px-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium text-tertiary hover:bg-primary/10 hover:text-primary transition-all duration-200"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                              <span>Notifications</span>
                            </Link>
                          </div>

                          {/* Logout Section */}
                          <div className="pt-2">
                            <div className="px-4 py-2">
                              <p className="text-xs font-medium text-tertiary/50 uppercase tracking-wider">
                                Account
                              </p>
                            </div>
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 sm:space-x-4 px-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium text-red-600 hover:bg-red-50 w-full text-left transition-all duration-200"
                            >
                              <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </>
                      )}

                      {/* Registration buttons for non-authenticated users */}
                      {!isAuthenticated && (
                        <div className="pt-6 space-y-3">
                          <Link
                            to="/login"
                            className="flex items-center justify-center space-x-2 w-full text-primary hover:bg-primary/10 px-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium transition-all duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <User className="h-5 w-5 sm:h-6 sm:w-6" />
                            <span>Login</span>
                          </Link>
                          <Link
                            to="/register"
                            className="flex items-center justify-center space-x-2 w-full bg-primary text-white hover:bg-accent px-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium transition-all duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <User className="h-5 w-5 sm:h-6 sm:w-6" />
                            <span>Register</span>
                          </Link>
                          <Link
                            to="/register/seller"
                            className="flex items-center justify-center space-x-2 w-full border-2 border-primary text-primary hover:bg-primary hover:text-white px-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium transition-all duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Store className="h-5 w-5 sm:h-6 sm:w-6" />
                            <span>Become a Seller</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Menu Footer */}
                  <div className="px-4 sm:px-6 py-6 border-t border-gray-100 bg-white">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-tertiary/70">
                        Premium Horse Marketplace
                      </p>
                      <p className="text-[10px] sm:text-xs text-tertiary/50 mt-1">
                        © {new Date().getFullYear()} All rights reserved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;