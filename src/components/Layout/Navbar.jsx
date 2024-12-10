import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary-50 shadow-md border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <RouterLink to="/" className="flex items-center space-x-3">
            <span className="text-2xl">🐎</span>
            <span className="text-xl font-bold text-primary-700">GallopMart</span>
          </RouterLink>

          <div className="hidden md:flex items-center space-x-4">
            <RouterLink
              to="/"
              className="text-primary-600 hover:text-primary-800 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
            >
              Market
            </RouterLink>
            {user && user.role === 'seller' && (
              <RouterLink
                to="/seller"
                className="text-primary-600 hover:text-primary-800 px-3 py-2 rounded-md hover:bg-primary-100 transition-colors"
              >
                Dashboard
              </RouterLink>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!user ? (
              <div className="flex items-center space-x-2">
                <RouterLink
                  to="/login"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Login</span>
                </RouterLink>
                <RouterLink
                  to="/vendor/login"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-colors"
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  <span>Vendor</span>
                </RouterLink>
                <RouterLink
                  to="/register"
                  className="flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  <span>Sign Up</span>
                </RouterLink>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <RouterLink
                  to="/messages"
                  className="p-2 text-primary-600 hover:text-primary-800 rounded-full hover:bg-primary-100 transition-colors"
                >
                  <ChatBubbleLeftIcon className="h-6 w-6" />
                </RouterLink>

                <RouterLink
                  to="/profile"
                  className="p-2 text-primary-600 hover:text-primary-800 rounded-full hover:bg-primary-100 transition-colors"
                >
                  <Cog6ToothIcon className="h-6 w-6" />
                </RouterLink>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-lg transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 