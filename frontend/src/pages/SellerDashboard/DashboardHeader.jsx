import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardHeader = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <Menu className="w-6 h-6 text-tertiary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-tertiary">
            Welcome back, {user?.name || 'Seller'}!
          </h1>
          <p className="text-tertiary/70">
            Here's what's happening with your listings today.
          </p>
        </div>
      </div>
      <Link
        to="/seller/listings/new"
        className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Listing
      </Link>
    </div>
  );
};

export default DashboardHeader; 