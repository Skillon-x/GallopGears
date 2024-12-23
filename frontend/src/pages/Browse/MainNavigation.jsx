import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  Home, 
  PlusCircle,
  FileSearch,
  User,
  Menu,
  X,
  Heart,
  Bell,
  LogOut
} from 'lucide-react';

const NavLink = ({ to, icon: Icon, children, isActive }) => (
  <Link 
    to={to}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      isActive 
        ? 'text-primary bg-primary/10'
        : 'text-tertiary hover:text-primary hover:bg-gray-50'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{children}</span>
  </Link>
);

const MainNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-100 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-tertiary" />
            ) : (
              <Menu className="w-6 h-6 text-tertiary" />
            )}
          </button>

          {/* Logo */}
          <Link 
            to="/"
            className="text-2xl font-bold text-primary"
          >
            GallopingGears
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/browse" icon={Search} isActive={isActive('/browse')}>
              Browse
            </NavLink>
            <NavLink to="/stable" icon={Home} isActive={isActive('/stable')}>
              Stable
            </NavLink>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-2">
            <Link 
              to="/create-advert"
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">Create Advert</span>
            </Link>

            {/* Notification Bell */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-tertiary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                  <Link 
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-tertiary hover:bg-gray-50"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link 
                    to="/favorites"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-tertiary hover:bg-gray-50"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Favorites</span>
                  </Link>
                  <hr className="my-1" />
                  <button 
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <NavLink to="/browse" icon={Search} isActive={isActive('/browse')}>
              Browse
            </NavLink>
            <NavLink to="/stable" icon={Home} isActive={isActive('/stable')}>
              Stable
            </NavLink>
            <Link 
              to="/create-advert"
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">Create Advert</span>
            </Link>
            <NavLink to="/create-wanted" icon={FileSearch} isActive={isActive('/create-wanted')}>
              Create Wanted
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MainNavigation;