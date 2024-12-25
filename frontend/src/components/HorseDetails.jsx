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
    <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
      <img
        src={images[currentIndex]?.url || '/placeholder-horse.jpg'}
        alt="Horse"
        className="w-full h-full object-cover"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
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

  useEffect(() => {
    fetchHorseDetails();
  }, [id]);

  const fetchHorseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.horses.getDetails(id);
      if (response?.data?.success) {
        setHorse(response.data.horse);
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
      await api.horses.toggleFavorite(id);
      setHorse(prev => ({
        ...prev,
        isFavorited: !prev.isFavorited
      }));
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
      <div className="min-h-screen bg-gray-50">
        <MainNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-gray-200 rounded-lg" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error || 'Horse not found'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Status Badges */}
          <div className="flex items-center space-x-4">
            {horse.featured?.active && (
              <Badge active={true}>
                <Award className="w-4 h-4 mr-1" />
                Featured
              </Badge>
            )}
            {horse.boost?.active && (
              <Badge active={true}>
                <Activity className="w-4 h-4 mr-1" />
                Boosted
              </Badge>
            )}
            {horse.verificationStatus === 'verified' && (
              <Badge active={true}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Verified
              </Badge>
            )}
            <Badge active={horse.listingStatus === 'active'}>
              {horse.listingStatus.charAt(0).toUpperCase() + horse.listingStatus.slice(1)}
            </Badge>
          </div>

          {/* Image Gallery */}
          <ImageGallery images={horse.images} />

          {/* Title Section */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-tertiary">{horse.name}</h1>
              <p className="text-lg text-primary font-semibold mt-2">
                ₹{horse.price?.toLocaleString()}
              </p>
              <p className="text-tertiary/70 flex items-center mt-2">
                <MapPin className="w-4 h-4 mr-1" />
                {horse.location?.city}, {horse.location?.state}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleFavorite}
                className={`p-3 rounded-lg border transition-colors ${
                  horse.isFavorited
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-gray-200 text-tertiary hover:border-primary hover:text-primary'
                }`}
              >
                <Heart className={`w-5 h-5 ${horse.isFavorited ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleEnquire}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Enquire Now</span>
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-tertiary/70" />
                <div>
                  <p className="text-sm text-tertiary/70">Views</p>
                  <p className="font-medium text-tertiary">{horse.statistics?.views || 0}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-tertiary/70" />
                <div>
                  <p className="text-sm text-tertiary/70">Inquiries</p>
                  <p className="font-medium text-tertiary">{horse.statistics?.inquiries || 0}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-tertiary/70" />
                <div>
                  <p className="text-sm text-tertiary/70">Listed On</p>
                  <p className="font-medium text-tertiary">{formatDate(horse.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-tertiary/70" />
                <div>
                  <p className="text-sm text-tertiary/70">Expires On</p>
                  <p className="font-medium text-tertiary">{formatDate(horse.expiryDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SpecificationCard
              title="Age"
              value={`${horse.age?.years}y ${horse.age?.months}m`}
              icon={Calendar}
            />
            <SpecificationCard
              title="Gender"
              value={horse.gender}
              icon={BadgeDollarSign}
            />
            <SpecificationCard
              title="Color"
              value={horse.color}
              icon={Palette}
            />
            <SpecificationCard
              title="Breed"
              value={horse.breed}
              icon={Star}
            />
          </div>

          {/* Details Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <section>
                <h2 className="text-xl font-semibold text-tertiary mb-4">Description</h2>
                <p className="text-tertiary/70 whitespace-pre-line">{horse.description}</p>
              </section>

              {/* Specifications */}
              <section>
                <h2 className="text-xl font-semibold text-tertiary mb-4">Specifications</h2>
                <div className="bg-white rounded-lg border border-gray-200 divide-y">
                  <div className="flex py-3 px-4">
                    <span className="w-1/3 text-tertiary/70">Training Level</span>
                    <span className="w-2/3 text-tertiary">{horse.specifications?.training}</span>
                  </div>
                  <div className="flex py-3 px-4">
                    <span className="w-1/3 text-tertiary/70">Disciplines</span>
                    <span className="w-2/3 text-tertiary">
                      {horse.specifications?.discipline?.join(', ')}
                    </span>
                  </div>
                  <div className="flex py-3 px-4">
                    <span className="w-1/3 text-tertiary/70">Temperament</span>
                    <span className="w-2/3 text-tertiary">{horse.specifications?.temperament}</span>
                  </div>
                  <div className="flex py-3 px-4">
                    <span className="w-1/3 text-tertiary/70">Health Status</span>
                    <span className="w-2/3 text-tertiary">{horse.specifications?.healthStatus}</span>
                  </div>
                  <div className="flex py-3 px-4">
                    <span className="w-1/3 text-tertiary/70">Vaccination</span>
                    <span className="w-2/3 text-tertiary flex items-center">
                      {horse.specifications?.vaccination ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      {horse.specifications?.vaccination ? 'Vaccinated' : 'Not Vaccinated'}
                    </span>
                  </div>
                  <div className="flex py-3 px-4">
                    <span className="w-1/3 text-tertiary/70">Registration Papers</span>
                    <span className="w-2/3 text-tertiary flex items-center">
                      {horse.specifications?.papers ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      {horse.specifications?.papers ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Verification Details */}
              {horse.verificationStatus === 'verified' && (
                <section>
                  <h2 className="text-xl font-semibold text-tertiary mb-4">Verification</h2>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-2 text-green-600 mb-4">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Verified Listing</span>
                    </div>
                    <p className="text-tertiary/70">
                      Verified on {formatDate(horse.verificationDetails?.verifiedAt)}
                    </p>
                    {horse.verificationDetails?.documents?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-tertiary mb-2">Verified Documents:</p>
                        <div className="space-y-2">
                          {horse.verificationDetails.documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-tertiary/70">
                              <FileCheck className="w-4 h-4" />
                              <span>{doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} Document</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Seller Information */}
            <div>
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-tertiary">{horse.seller?.businessName}</h3>
                    <p className="text-sm text-tertiary/70">Member since {new Date(horse.seller?.createdAt).getFullYear()}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-tertiary">
                    <Phone className="w-4 h-4" />
                    <span>{horse.seller?.contactDetails?.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-tertiary">
                    <Mail className="w-4 h-4" />
                    <span>{horse.seller?.contactDetails?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-tertiary">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {horse.seller?.location?.city}, {horse.seller?.location?.state}
                      {horse.seller?.location?.pincode && ` - ${horse.seller?.location?.pincode}`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleEnquire}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mt-6"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Contact Seller</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HorseDetails; 