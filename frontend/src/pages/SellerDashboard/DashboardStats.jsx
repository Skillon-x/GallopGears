import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Eye,
    MessageSquare,
    ShoppingBag,
    Crown,
    Clock,
    Star,
} from 'lucide-react';
import { api } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, subtitle, variant = 'default' }) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return {
                    border: 'border-green-200',
                    bg: 'bg-green-50',
                    iconBg: 'bg-green-100',
                    iconColor: 'text-green-600',
                    subtitleColor: 'text-green-600'
                };
            case 'warning':
                return {
                    border: 'border-yellow-200',
                    bg: 'bg-yellow-50',
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    subtitleColor: 'text-yellow-600'
                };
            case 'error':
                return {
                    border: 'border-red-200',
                    bg: 'bg-red-50',
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    subtitleColor: 'text-red-600'
                };
            default:
                return {
                    border: 'border-gray-100',
                    bg: 'bg-white',
                    iconBg: 'bg-primary/10',
                    iconColor: 'text-primary',
                    subtitleColor: 'text-tertiary/60'
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className={`p-6 rounded-xl shadow-sm border ${styles.border} ${styles.bg}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-tertiary/70">{title}</p>
                    <h3 className="text-2xl font-bold text-tertiary mt-1">{value}</h3>
                    {subtitle && <p className={`text-sm mt-1 ${styles.subtitleColor} font-medium`}>{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-lg ${styles.iconBg}`}>
                    <Icon className={`h-6 w-6 ${styles.iconColor}`} />
                </div>
            </div>
        </div>
    );
};

const DashboardStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [dashboardRes, performanceRes] = await Promise.all([
                    api.sellers.dashboardStats(),
                    api.sellers.dashboardPerformance()
                ]);

                if (!dashboardRes?.data?.success || !performanceRes?.data?.success) {
                    throw new Error('Failed to load dashboard statistics');
                }

                setStats({
                    ...dashboardRes.data.dashboard,
                    performance: performanceRes.data.performance.thirtyDayMetrics
                });
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-600">Failed to load dashboard statistics</p>
            </div>
        );
    }

    const displayStats = stats || {
        subscription: {
            plan: 'Royal Stallion',
            status: 'active',
            endDate: new Date().toISOString(),
        },
        listings: {
            total: 0,
            active: 0,
            draft: 0,
        },
        inquiries: {
            total: 0,
            pending: 0,
            responded: 0,
        },
        performance: {
            totalViews: 0,
            totalInquiries: 0,
            responseRate: 0,
            averageResponseTime: '0h',
            listingCount: 0
        }
    };

    const getTimeRemaining = (endDate) => {
        if (!endDate) return { text: 'No active plan', variant: 'error' };
        
        const now = new Date();
        const end = new Date(endDate);
        const diffMs = end - now;
        
        if (diffMs < 0) return { text: 'Expired', variant: 'error' };
        
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let text;
        let variant;
        
        if (days > 30) {
            text = `${days} days remaining`;
            variant = 'success';
        } else if (days > 0) {
            text = days === 1 ? '1 day remaining' : `${days} days remaining`;
            variant = days <= 7 ? 'warning' : 'success';
        } else if (hours > 0) {
            text = `${hours}h ${minutes}m remaining`;
            variant = 'warning';
        } else if (minutes > 0) {
            text = `${minutes} minutes remaining`;
            variant = 'error';
        } else {
            text = 'Expiring soon';
            variant = 'error';
        }
        
        return { text, variant };
    };

    const subscriptionInfo = getTimeRemaining(displayStats.subscription?.endDate);

    const formatResponseTime = (time) => {
        if (!time) return '0h';
        if (typeof time === 'number') {
            return time < 24 ? `${time}h` : `${Math.round(time/24)}d`;
        }
        return time;
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Subscription Plan"
                    value={displayStats.subscription?.plan || 'No Plan'}
                    subtitle={subscriptionInfo.text}
                    icon={Crown}
                    variant={subscriptionInfo.variant}
                />
                <StatCard
                    title="Total Views"
                    value={displayStats.performance?.totalViews || 0}
                    subtitle={`${displayStats.listings?.active || 0} active listings`}
                    icon={Eye}
                />
                <StatCard
                    title="Listings"
                    value={`${displayStats.listings?.active || 0}/${displayStats.listings?.total || 0}`}
                    subtitle="Active / Total listings"
                    icon={ShoppingBag}
                />
                <StatCard
                    title="Response Rate"
                    value={`${displayStats.performance?.responseRate || 0}%`}
                    subtitle={`${displayStats.inquiries?.responded || 0} of ${displayStats.inquiries?.total || 0} inquiries`}
                    icon={MessageSquare}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Average Response Time"
                    value={formatResponseTime(displayStats.performance?.averageResponseTime)}
                    subtitle="Time to respond"
                    icon={Clock}
                />
                <StatCard
                    title="Pending Inquiries"
                    value={displayStats.inquiries?.pending || 0}
                    subtitle="Awaiting response"
                    icon={MessageSquare}
                />
                <StatCard
                    title="Total Inquiries"
                    value={displayStats.performance?.totalInquiries || 0}
                    subtitle="Last 30 days"
                    icon={Star}
                />
            </div>
        </div>
    );
};

export default DashboardStats; 
