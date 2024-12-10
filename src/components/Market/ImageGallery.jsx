import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const defaultImage = 'https://via.placeholder.com/400x300?text=Horse+Image';
  const imageList = images.length > 0 ? images : [defaultImage];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') previousImage();
    if (e.key === 'Escape') setShowFullscreen(false);
  };

  return (
    <div className="relative">
      {/* Main Image */}
      <div 
        className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden cursor-pointer"
        onClick={() => setShowFullscreen(true)}
      >
        <img
          src={imageList[currentIndex]}
          alt={`Horse image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail Strip */}
      {imageList.length > 1 && (
        <div className="flex space-x-2 mt-4 overflow-x-auto">
          {imageList.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                index === currentIndex ? 'ring-2 ring-primary-600' : ''
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setShowFullscreen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              previousImage();
            }}
            className="absolute left-4 text-white hover:text-gray-300"
          >
            <ChevronLeftIcon className="h-8 w-8" />
          </button>

          <img
            src={imageList[currentIndex]}
            alt={`Horse image ${currentIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 text-white hover:text-gray-300"
          >
            <ChevronRightIcon className="h-8 w-8" />
          </button>

          <div className="absolute bottom-4 text-white">
            {currentIndex + 1} / {imageList.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery; 