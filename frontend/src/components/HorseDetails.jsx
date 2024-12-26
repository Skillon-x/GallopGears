import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  MapPin, 
  Calendar, 
  Ruler, 
  Heart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  AlertCircle,
  Tag,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Award,
  Palette,
  BadgeDollarSign,
  FileCheck,
  Activity,
  Stethoscope,
  Star,
  Store,
} from 'lucide-react';
import MainNavigation from '../pages/Browse/MainNavigation';
import { useAuth } from '../context/AuthContext';

const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative aspect-[16/9] bg-gradient-to-br from-accent/30 via-white to-primary/30 rounded-2xl overflow-hidden shadow-2xl border border-white/50">
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30" />
      <img
        src={images[currentIndex]?.url || '/placeholder-horse.jpg'}
        alt="Horse"
        className="relative w-full h-full object-cover"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all duration-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-all duration-200"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  idx === currentIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const SpecificationCard = ({ title, value, icon: Icon }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-white rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-sm text-tertiary/70">{title}</p>
        <p className="font-medium text-tertiary">{value}</p>
      </div>
    </div>
  </div>
);

const Badge = ({ active, children }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
    {children}
  </span>
);

const HorseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [horseResponse, favoritesResponse] = await Promise.all([
          api.horses.getDetails(id),
          isAuthenticated ? api.users.getFavorites() : Promise.resolve({ data: { favorites: [] } })
        ]);

        if (horseResponse?.data?.success) {
          const favoriteIds = favoritesResponse?.data?.favorites?.map(fav => fav._id) || [];
          console.log("Horse data received:", horseResponse.data.horse);
          console.log("Seller data:", horseResponse.data.horse.seller);
          setHorse({
            ...horseResponse.data.horse,
            isFavorited: favoriteIds.includes(id)
          });
          setFavorites(favoriteIds);
        } else {
          throw new Error('Failed to fetch horse details');
        }
      } catch (err) {
        setError('Failed to load horse details. Please try again.');
        console.error('Error fetching horse details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  const handleEnquire = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/horses/${id}` } });
    } else {
      navigate(`/inquire/${id}`);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/horses/${id}` } });
      return;
    }

    try {
      const response = await api.horses.toggleFavorite(id);
      if (response?.data?.success) {
        setHorse(prev => ({
          ...prev,
          isFavorited: !prev.isFavorited
        }));
        
        // Update favorites list
        setFavorites(prev => 
          prev.includes(id) 
            ? prev.filter(fId => fId !== id)
            : [...prev, id]
        );
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30">
        <MainNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-[60vh] bg-white/50 backdrop-blur-sm rounded-2xl" />
            <div className="h-8 bg-white/50 backdrop-blur-sm rounded-xl w-1/2" />
            <div className="h-4 bg-white/50 backdrop-blur-sm rounded-xl w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white/50 backdrop-blur-sm rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30">
        <MainNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="backdrop-blur-sm bg-red-50/80 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error || 'Horse not found'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30">
      <MainNavigation />
      
      <main className="container mx-auto px-4 pt-20 sm:pt-24 lg:pt-28 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {horse?.featured?.active && (
              <div className="backdrop-blur-sm bg-white/80 px-4 py-2 rounded-full border border-white/50 text-primary flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Featured</span>
              </div>
            )}
            {horse.boost?.active && (
              <div className="backdrop-blur-sm bg-white/80 px-4 py-2 rounded-full border border-white/50 text-primary flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Boosted</span>
              </div>
            )}
            {horse.verificationStatus === 'verified' && (
              <div className="backdrop-blur-sm bg-white/80 px-4 py-2 rounded-full border border-white/50 text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            )}
            <div className={`backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 flex items-center gap-2 ${
              horse.listingStatus === 'active' 
                ? 'bg-green-50/80 text-green-600 border-green-100' 
                : 'bg-gray-50/80 text-gray-600 border-gray-100'
            }`}>
              <span className="text-sm font-medium">
                {horse.listingStatus.charAt(0).toUpperCase() + horse.listingStatus.slice(1)}
              </span>
            </div>
          </div>

          {/* Image Gallery */}
          <ImageGallery images={horse?.images || []} />

          {/* Title Section */}
          <div className="backdrop-blur-sm bg-white/90 rounded-2xl border border-white p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-tertiary">{horse?.name}</h1>
                <p className="text-xl sm:text-2xl text-primary font-semibold mt-3">
                  ₹{horse?.price?.toLocaleString()}
                </p>
                <p className="text-tertiary/70 flex items-center mt-3">
                  <MapPin className="w-5 h-5 mr-2" />
                  {horse?.location?.city}, {horse?.location?.state}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleFavorite}
                  className={`p-3 rounded-xl border transition-all duration-200 ${
                    horse?.isFavorited
                      ? 'bg-primary/10 border-primary text-primary shadow-lg scale-105'
                      : 'border-gray-200 text-tertiary hover:border-primary hover:text-primary hover:scale-105'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${horse?.isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleEnquire}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Enquire Now</span>
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-tertiary/70">Views</p>
                  <p className="font-medium text-tertiary">{horse.statistics?.views || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-tertiary/70">Inquiries</p>
                  <p className="font-medium text-tertiary">{horse.statistics?.inquiries || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-tertiary/70">Listed On</p>
                  <p className="font-medium text-tertiary">{formatDate(horse.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-lg">
                  <Tag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-tertiary/70">Expires On</p>
                  <p className="font-medium text-tertiary">{formatDate(horse.expiryDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="backdrop-blur-sm bg-white/90 p-4 rounded-2xl border border-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-tertiary/70">Age</p>
                  <p className="font-medium text-tertiary">{`${horse.age?.years}y ${horse.age?.months}m`}</p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-sm bg-white/90 p-4 rounded-2xl border border-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-100 rounded-lg">
                  <BadgeDollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-tertiary/70">Gender</p>
                  <p className="font-medium text-tertiary">{horse.gender}</p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-sm bg-white/90 p-4 rounded-2xl border border-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-100 rounded-lg">
                  <Palette className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-tertiary/70">Color</p>
                  <p className="font-medium text-tertiary">{horse.color}</p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-sm bg-white/90 p-4 rounded-2xl border border-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-lg">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-tertiary/70">Breed</p>
                  <p className="font-medium text-tertiary">{horse.breed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Specifications */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              {/* Description */}
              <div className="backdrop-blur-sm bg-white/90 rounded-2xl border border-white p-6 shadow-xl">
                <h2 className="text-xl font-bold text-tertiary mb-4">Description</h2>
                <div className="prose prose-sm max-w-none text-tertiary/80">
                  {horse?.description?.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div className="backdrop-blur-sm bg-white/90 rounded-2xl border border-white p-6 shadow-xl">
                <h2 className="text-xl font-bold text-tertiary mb-4">Specifications</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(horse?.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-tertiary/70">{key}</p>
                        <p className="font-medium text-tertiary">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disciplines */}
              {horse?.disciplines?.length > 0 && (
                <div className="backdrop-blur-sm bg-white/90 rounded-2xl border border-white p-6 shadow-xl">
                  <h2 className="text-xl font-bold text-tertiary mb-4">Disciplines</h2>
                  <div className="flex flex-wrap gap-2">
                    {horse.disciplines.map((discipline) => (
                      <span
                        key={discipline}
                        className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium"
                      >
                        {discipline}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Seller Information */}
            <div className="backdrop-blur-sm bg-white/90 rounded-2xl border border-white p-6 shadow-xl h-fit lg:sticky lg:top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {horse?.seller?.profileImage ? (
                    <img 
                      src={horse.seller.profileImage} 
                      alt={horse?.seller?.businessName} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Store className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-tertiary">
                    {horse?.seller?.businessName || 'Business Name'}
                  </h3>
                  <p className="text-sm text-tertiary/70">
                    Seller ID: {horse?.seller?.id?.slice(-8)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {(horse?.seller?.location?.city || horse?.seller?.location?.state) && (
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-tertiary/70">Location</p>
                      <p className="font-medium text-tertiary">
                        {[horse?.seller?.location?.city, horse?.seller?.location?.state]
                          .filter(Boolean)
                          .join(', ')}
                        {horse?.seller?.location?.pincode && (
                          <span className="text-tertiary/70 text-sm ml-1">
                            - {horse.seller.location.pincode}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleEnquire}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] shadow-lg"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Contact Seller</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HorseDetails; 