import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ShoppingBag, MessageSquare, DollarSign } from 'lucide-react';

const ActivityItem = ({ icon: Icon, title, subtitle, time, link }) => (
    <Link to={link} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-tertiary truncate">{title}</p>
            <p className="text-sm text-tertiary/60 truncate">{subtitle}</p>
            <p className="text-xs text-tertiary/40 mt-1">{time}</p>
        </div>
    </Link>
);

const RecentActivities = () => {
    const [activities, setActivities] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await api.sellers.dashboardStats();
                if (response?.data?.success) {
                    setActivities(response.data.dashboard);
                } else {
                    throw new Error('Failed to load recent activities');
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="font-semibold text-tertiary">Recent Activities</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 animate-pulse">
                            <div className="flex items-center space-x-4">
                                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-600">Failed to load recent activities</p>
            </div>
        );
    }

    const displayActivities = activities || {
        listings: { recent: [] },
        inquiries: { recent: [] },
        transactions: { recent: [] }
    };

    // Combine and sort all activities
    const allActivities = [
        ...displayActivities.listings.recent.map(listing => ({
            type: 'listing',
            icon: ShoppingBag,
            title: listing.name,
            subtitle: `₹${listing.price.toLocaleString()}`,
            time: formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true }),
            link: `/seller/listings/${listing._id}`,
            date: new Date(listing.createdAt)
        })),
        ...displayActivities.inquiries.recent.map(inquiry => ({
            type: 'inquiry',
            icon: MessageSquare,
            title: `Inquiry for ${inquiry.horse.name}`,
            subtitle: inquiry.status === 'pending' ? 'Awaiting response' : 'Responded',
            time: formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true }),
            link: `/seller/inquiries/${inquiry._id}`,
            date: new Date(inquiry.createdAt)
        })),
        ...displayActivities.transactions.recent.map(transaction => ({
            type: 'transaction',
            icon: DollarSign,
            title: `₹${transaction.amount.toLocaleString()}`,
            subtitle: transaction.type === 'subscription' ? 'Subscription payment' : 'Sale payment',
            time: formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true }),
            link: `/seller/transactions/${transaction._id}`,
            date: new Date(transaction.createdAt)
        }))
    ].sort((a, b) => b.date - a.date).slice(0, 10);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="font-semibold text-tertiary">Recent Activities</h2>
            </div>
            <div className="divide-y divide-gray-100">
                {allActivities.length > 0 ? (
                    allActivities.map((activity, index) => (
                        <ActivityItem
                            key={index}
                            icon={activity.icon}
                            title={activity.title}
                            subtitle={activity.subtitle}
                            time={activity.time}
                            link={activity.link}
                        />
                    ))
                ) : (
                    <div className="p-4 text-center text-tertiary/60">
                        No recent activities
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivities; 