import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { HeartIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const UserProfile = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [profile, setProfile] = useState({
    email: user?.email || '',
    name: '',
    phone: '',
    location: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [favoritesRes, profileRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/${user.id}/favorites`),
        axios.get(`http://localhost:5000/api/users/${user.id}/profile`)
      ]);
      setFavorites(favoritesRes.data);
      setProfile(profileRes.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/${user.id}/profile`, profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleRemoveFavorite = async (horseId) => {
    try {
      await axios.delete(`http://localhost:5000/api/horses/${horseId}/favorite`);
      setFavorites(favorites.filter(fav => fav.horseId._id !== horseId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="md:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Profile</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary-600 hover:text-primary-700"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="input-field"
                  />
                </div>

                <button type="submit" className="btn-primary w-full">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="h-6 w-6 text-gray-400" />
                  <span>{profile.name || 'Name not set'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-6 w-6 text-gray-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-6 w-6 text-gray-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Favorites Section */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Favorites</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map(({ horseId: horse }) => (
              <div key={horse._id} className="card">
                <div className="relative">
                  <img
                    src={horse.images?.[0] || 'https://via.placeholder.com/400x300?text=Horse+Image'}
                    alt={horse.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <button
                    onClick={() => handleRemoveFavorite(horse._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50"
                  >
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
                <h3 className="text-xl font-semibold mb-2">{horse.name}</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">{horse.breed} • {horse.age} years</p>
                  <p className="text-primary-600 font-semibold">
                    ${horse.price.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/horses/${horse._id}`)}
                  className="btn-primary w-full mt-4"
                >
                  View Details
                </button>
              </div>
            ))}
            {favorites.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No favorites yet. Start browsing horses to add some!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 