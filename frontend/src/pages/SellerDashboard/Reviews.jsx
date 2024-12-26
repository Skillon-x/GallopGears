import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Star, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';

const ReviewCard = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-tertiary">{review.horse.name}</h3>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-tertiary/70 text-sm mt-1">By: {review.buyer.name}</p>
          </div>
          <span className="text-sm text-tertiary/70">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-tertiary/70 hover:text-tertiary"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            <span>Review</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-tertiary">{review.comment}</p>
              {review.reply && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-tertiary">Your Reply:</p>
                  <p className="text-tertiary mt-1">{review.reply}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {!review.reply && (
          <div className="mt-4">
            <textarea
              placeholder="Write your reply to this review..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
            />
            <button className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Post Reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.sellers.getReviews();
      if (response?.data?.success) {
        setReviews(response.data.reviews || []);
        setStats(response.data.stats || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
          }
        });
      } else {
        throw new Error('Failed to fetch reviews');
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const content = loading ? (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  ) : error ? (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
      {error}
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-tertiary">Reviews</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-tertiary">{(stats?.averageRating || 0).toFixed(1)}</div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(stats?.averageRating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-tertiary/70 mt-1">{stats?.totalReviews || 0} reviews</div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const percentage = stats?.totalReviews
              ? ((stats?.ratingDistribution?.[rating] || 0) / stats.totalReviews) * 100
              : 0;
            
            return (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-12">
                  <span>{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-tertiary/70">
                  {stats?.ratingDistribution?.[rating] || 0}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-tertiary">No Reviews Yet</h3>
          <p className="text-tertiary/70 mt-2">When buyers review your listings, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="pb-[500px]"> {/* Space for footer */}
        <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={setIsSidebarOpen} />
        <div className="lg:pl-64">
          <div className="p-8 pt-24"> {/* Increased top padding for navbar */}
            <DashboardHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="mt-8">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews; 