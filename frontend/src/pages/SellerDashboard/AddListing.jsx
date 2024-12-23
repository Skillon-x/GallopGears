import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Upload, X, Image as ImageIcon, Star } from 'lucide-react';

const AddListing = () => {
  const navigate = useNavigate();
  const { id: listingId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialImages, setInitialImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: { years: 0, months: 0 },
    gender: '',
    color: '',
    price: '',
    description: '',
    location: {
      state: '',
      city: '',
      pincode: ''
    },
    images: [],
    specifications: {
      training: '',
      discipline: [],
      temperament: '',
      healthStatus: '',
      vaccination: false,
      papers: false
    },
    listingStatus: 'draft',
    featured: {
      active: false,
      startDate: '',
      endDate: '',
      position: 1
    }
  });

  // Fetch existing listing data if in edit mode
  useEffect(() => {
    const fetchListingData = async () => {
      if (!listingId) return;

      setLoading(true);
      setIsEditMode(true);
      try {
        const response = await api.horses.getDetails(listingId);
        if (!response?.data?.success) {
          throw new Error(response?.data?.message || 'Failed to fetch listing');
        }

        const listing = response.data.horse;
        setInitialImages(listing.images || []);

        setFormData({
          name: listing.name || '',
          breed: listing.breed || '',
          age: listing.age || { years: 0, months: 0 },
          gender: listing.gender || '',
          color: listing.color || '',
          price: listing.price || '',
          description: listing.description || '',
          location: {
            state: listing.location?.state || '',
            city: listing.location?.city || '',
            pincode: listing.location?.pincode || ''
          },
          images: listing.images?.map(img => ({
            ...img,
            preview: img.url,
            existing: true
          })) || [],
          specifications: {
            training: listing.specifications?.training || '',
            discipline: listing.specifications?.discipline || [],
            temperament: listing.specifications?.temperament || '',
            healthStatus: listing.specifications?.healthStatus || '',
            vaccination: listing.specifications?.vaccination || false,
            papers: listing.specifications?.papers || false
          },
          listingStatus: listing.listingStatus || 'draft',
          featured: {
            active: listing.featured?.active || false,
            startDate: listing.featured?.startDate ? new Date(listing.featured.startDate).toISOString().split('T')[0] : '',
            endDate: listing.featured?.endDate ? new Date(listing.featured.endDate).toISOString().split('T')[0] : '',
            position: listing.featured?.position || 1
          }
        });
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to fetch listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [listingId]);

  const getRandomPosition = () => Math.floor(Math.random() * 5) + 1;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name === 'discipline') {
      const disciplines = value.split(',').map(d => d.trim());
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          discipline: disciplines
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    // Validate files
    const invalidFiles = files.filter(
      file => !allowedTypes.includes(file.type) || file.size > maxSize
    );

    if (invalidFiles.length > 0) {
      setError('Some files were rejected. Please ensure all files are images under 5MB.');
      return;
    }

    // Check if adding these files would exceed the limit
    if (formData.images.length + files.length > 20) {
      setError('Cannot upload more than 20 photos per listing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert files to base64
      const processedFiles = await Promise.all(
        files.map(async file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                name: file.name,
                content: reader.result,
                size: file.size,
                preview: URL.createObjectURL(file)
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      // Update form data with new images
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...processedFiles]
      }));

    } catch (err) {
      console.error('Error processing images:', err);
      setError('Failed to process images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const reorderImages = (dragIndex, dropIndex) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const [draggedImage] = newImages.splice(dragIndex, 1);
      newImages.splice(dropIndex, 0, draggedImage);
      return {
        ...prev,
        images: newImages
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = {
        name: 'Name',
        breed: 'Breed',
        gender: 'Gender',
        color: 'Color',
        price: 'Price',
        description: 'Description',
        'location.state': 'State',
        'location.city': 'City',
        'location.pincode': 'Pincode',
        'specifications.training': 'Training Level',
        'specifications.temperament': 'Temperament',
        'specifications.healthStatus': 'Health Status'
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        const value = field.includes('.')
          ? field.split('.').reduce((obj, key) => obj?.[key], formData)
          : formData[field];

        if (!value || (typeof value === 'string' && !value.trim())) {
          throw new Error(`${label} is required`);
        }
      }

      // Structure the listing data
      const listingData = {
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        age: {
          years: parseInt(formData.age.years),
          months: parseInt(formData.age.months)
        },
        gender: formData.gender.trim(),
        color: formData.color.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        location: {
          state: formData.location.state.trim(),
          city: formData.location.city.trim(),
          pincode: formData.location.pincode.trim()
        },
        specifications: {
          training: formData.specifications.training.trim(),
          discipline: Array.isArray(formData.specifications.discipline) 
            ? formData.specifications.discipline.map(d => d.trim())
            : [formData.specifications.discipline.trim()],
          temperament: formData.specifications.temperament.trim(),
          healthStatus: formData.specifications.healthStatus.trim(),
          vaccination: Boolean(formData.specifications.vaccination),
          papers: Boolean(formData.specifications.papers)
        },
        listingStatus: formData.listingStatus,
        featured: formData.featured.active ? {
          active: true,
          startDate: new Date(formData.featured.startDate).toISOString(),
          endDate: new Date(formData.featured.endDate).toISOString(),
          position: parseInt(formData.featured.position)
        } : {
          active: false
        }
      };

      let response;
      if (isEditMode) {
        response = await api.horses.update(listingId, listingData);
      } else {
        response = await api.horses.create(listingData);
      }

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} listing`);
      }

      const horseId = response.data.horse._id;

      // Handle image uploads
      const newImages = formData.images.filter(img => !img.existing);
      if (newImages.length > 0) {
        const requestData = {
          photos: newImages.map(image => ({
            name: image.name,
            content: image.content,
            size: image.size
          }))
        };

        try {
          const photoResponse = await api.photos.upload(horseId, requestData);
          if (!photoResponse?.data?.success) {
            throw new Error(photoResponse?.data?.message || 'Failed to upload photos');
          }
        } catch (photoError) {
          console.error('Photo upload error:', photoError);
          throw new Error(`Failed to upload photos: ${photoError.message}`);
        }
      }

      // Handle removed images in edit mode
      if (isEditMode) {
        const removedImages = initialImages.filter(
          initialImg => !formData.images.some(currentImg => currentImg.existing && currentImg.public_id === initialImg.public_id)
        );

        if (removedImages.length > 0) {
          try {
            await Promise.all(
              removedImages.map(img => 
                api.photos.delete(horseId, img.public_id)
              )
            );
          } catch (deleteError) {
            console.error('Error deleting photos:', deleteError);
          }
        }
      }

      navigate('/seller/listings');
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        stack: err.stack
      });
      setError(err.message || `An error occurred while ${isEditMode ? 'updating' : 'creating'} the listing`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 pt-16 pb-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-tertiary">Loading listing details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 pt-16 pb-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-tertiary mb-6">
            {isEditMode ? 'Edit Horse Listing' : 'Add New Horse Listing'}
          </h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-tertiary">Horse Photos</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Existing Images */}
                {formData.images.map((image, index) => (
                  <div 
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={image.preview}
                      alt={`Horse photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-red-50"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                {formData.images.length < 8 && (
                  <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                    <Upload className="w-8 h-8 text-tertiary/40" />
                    <span className="mt-2 text-sm text-tertiary/70">Upload Photos</span>
                    <span className="mt-1 text-xs text-tertiary/50">Max 8 photos</span>
                  </label>
                )}
              </div>

              {loading && (
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-primary">
                        Uploading...
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-primary">
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/10">
                    <div
                      style={{ width: `${uploadProgress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-tertiary">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tertiary">Horse Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary">Breed</label>
                  <input
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary">Age (Years)</label>
                  <input
                    type="number"
                    name="age.years"
                    value={formData.age.years}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary">Age (Months)</label>
                  <input
                    type="number"
                    name="age.months"
                    value={formData.age.months}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Stallion">Stallion</option>
                    <option value="Mare">Mare</option>
                    <option value="Gelding">Gelding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-tertiary">Location</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tertiary">State</label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary">City</label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary">Pincode</label>
                  <input
                    type="text"
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-tertiary">Specifications</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tertiary">Training Level</label>
                  <select
                    name="specifications.training"
                    value={formData.specifications.training}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Select Training Level</option>
                    <option value="Basic">Basic</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary">Discipline(s)</label>
                  <input
                    type="text"
                    name="discipline"
                    placeholder="e.g., Dressage, Show Jumping"
                    value={formData.specifications.discipline.join(', ')}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary">Temperament</label>
                  <select
                    name="specifications.temperament"
                    value={formData.specifications.temperament}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Select Temperament</option>
                    <option value="Calm">Calm</option>
                    <option value="Energetic">Energetic</option>
                    <option value="Gentle">Gentle</option>
                    <option value="Spirited">Spirited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary">Health Status</label>
                  <select
                    name="specifications.healthStatus"
                    value={formData.specifications.healthStatus}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Select Health Status</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="specifications.vaccination"
                      checked={formData.specifications.vaccination}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-tertiary">Vaccinated</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="specifications.papers"
                      checked={formData.specifications.papers}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-tertiary">Has Papers</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-tertiary">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            {/* Featured Listing Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-tertiary">Featured Listing</h2>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured.active"
                    checked={formData.featured.active}
                    onChange={(e) => {
                      const today = new Date();
                      const thirtyDaysFromNow = new Date();
                      thirtyDaysFromNow.setDate(today.getDate() + 30);
                      
                      setFormData(prev => ({
                        ...prev,
                        featured: {
                          ...prev.featured,
                          active: e.target.checked,
                          startDate: e.target.checked ? today.toISOString().split('T')[0] : '',
                          endDate: e.target.checked ? thirtyDaysFromNow.toISOString().split('T')[0] : '',
                          position: e.target.checked ? getRandomPosition() : 1
                        }
                      }));
                    }}
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-tertiary flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    Make this a featured listing
                  </label>
                </div>
              </div>

              {formData.featured.active && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-tertiary">Start Date</label>
                    <input
                      type="date"
                      name="featured.startDate"
                      value={formData.featured.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required={formData.featured.active}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-tertiary">End Date</label>
                    <input
                      type="date"
                      name="featured.endDate"
                      value={formData.featured.endDate}
                      onChange={handleInputChange}
                      min={formData.featured.startDate || new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required={formData.featured.active}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-tertiary">Featured Position</label>
                        <p className="text-sm text-tertiary/70">Your listing will appear in position {formData.featured.position}</p>
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                        <span className="text-lg font-bold text-primary">{formData.featured.position}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Featured listings require additional charges. Your listing will be prominently displayed in the featured section for the selected duration.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Listing Status Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-tertiary">Listing Status</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-tertiary">Listing Visibility</h3>
                    <p className="text-sm text-tertiary/70">
                      {formData.listingStatus === 'active' 
                        ? 'Your listing is visible to all users'
                        : 'Only you can see this listing'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, listingStatus: 'draft' }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.listingStatus === 'draft'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, listingStatus: 'active' }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.listingStatus === 'active'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Active
                    </button>
                  </div>
                </div>

                {formData.listingStatus === 'active' && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Making your listing active means it will be visible to all users. Make sure all information is accurate before activating.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/seller/listings')}
                className="px-4 py-2 text-tertiary hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-primary text-white rounded-lg transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
                }`}
              >
                {loading 
                  ? (isEditMode ? 'Updating...' : 'Creating...') 
                  : (isEditMode ? 'Update Listing' : 'Create Listing')}
                {!loading && formData.listingStatus === 'draft' && ' as Draft'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddListing; 