import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EnquireForm from './EnquireForm';

const Enquire = () => {
  const { id: horseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSuccess = () => {
    navigate('/inquiries');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30 py-20 md:py-24 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-accent to-primary p-8 md:p-10 text-white">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold">
                Send Inquiry
              </h2>
              <p className="text-white/90 mt-2">
                Get in touch with the seller and start your journey
              </p>
            </div>
          </div>

          {/* Enquire Form */}
          <div className="p-8 md:p-10">
            <EnquireForm 
              horseId={horseId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <div className="backdrop-blur-sm bg-white/80 rounded-xl py-5 px-8 inline-block shadow-lg border border-white/50">
            <p className="text-gray-700">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@gallopinggears.com" className="text-primary hover:text-accent transition-colors font-medium">
                support@gallopinggears.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enquire; 