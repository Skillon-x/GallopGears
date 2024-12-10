import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const AddHorseForm = ({ horse, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    price: '',
    gender: '',
    color: '',
    height: '',
    discipline: '',
    training: '',
    health: '',
    location: '',
    description: '',
    images: []
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (horse) {
      setFormData({
        ...horse,
        price: horse.price.toString()
      });
    }
  }, [horse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        price: Number(formData.price),
        age: Number(formData.age),
        height: Number(formData.height),
        seller: user.id
      };

      const config = {
        withCredentials: true
      };

      if (horse) {
        await axios.put(
          `http://localhost:5000/api/horses/${horse._id}`,
          data,
          config
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/horses',
          data,
          config
        );
      }

      onSuccess();
    } catch (error) {
      console.error('Error:', error.response || error);
      setError(error.response?.data?.error || 'Failed to save horse. Please ensure you are logged in as a seller.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await axios.post(
        'http://localhost:5000/api/upload',
        formData,
        { withCredentials: true }
      );

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...response.data.urls]
      }));
    } catch (error) {
      setError('Failed to upload images');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary-700">
            {horse ? 'Edit Horse' : 'Add New Horse'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Breed</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Age (years)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="input-field"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input-field"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Height (hands)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="input-field"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Discipline</label>
              <input
                type="text"
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Training Level</label>
            <textarea
              value={formData.training}
              onChange={(e) => setFormData({ ...formData, training: e.target.value })}
              className="input-field"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Health Information</label>
            <textarea
              value={formData.health}
              onChange={(e) => setFormData({ ...formData, health: e.target.value })}
              className="input-field"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Images</label>
            <div className="flex flex-wrap gap-4 mb-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      images: prev.images.filter((_, i) => i !== index)
                    }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <PhotoIcon className="h-5 w-5 text-gray-500" />
              <span>Add Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Saving...' : (horse ? 'Save Changes' : 'Add Horse')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHorseForm; 