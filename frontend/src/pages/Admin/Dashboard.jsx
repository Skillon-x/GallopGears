import React, { useState, useEffect } from 'react';
import { 
    Users, 
    DollarSign, 
    Activity, 
    TrendingUp, 
    UserPlus,
    ShoppingBag,
    CheckCircle,
    CreditCard,
    AlertCircle,
    Search,
    Filter,
    Calendar,
    X
} from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../admin/AdminLayout';

// Activity type icons mapping
const ACTIVITY_ICONS = {
    user_login: Users,
    user_register: UserPlus,
    seller_register: UserPlus,
    listing_create: ShoppingBag,
    listing_update: ShoppingBag,
    listing_verify: CheckCircle,
    subscription_purchase: CreditCard,
    payment_process: DollarSign,
    default: Activity
};

// Activity type colors mapping
const ACTIVITY_COLORS = {
    user: 'text-blue-500 bg-blue-50',
    seller: 'text-purple-500 bg-purple-50',
    listing: 'text-green-500 bg-green-50',
    subscription: 'text-orange-500 bg-orange-50',
    payment: 'text-emerald-500 bg-emerald-50',
    default: 'text-primary bg-primary/10'
};

const ActivityItem = ({ activity }) => {
    const IconComponent = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.default;
    const colorClass = ACTIVITY_COLORS[activity.entityType] || ACTIVITY_COLORS.default;

    return (
        <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`p-2 rounded-lg ${colorClass}`}>
                <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-tertiary">{activity.description}</p>
                <p className="text-xs text-tertiary/70 mt-1">{activity.timestamp}</p>
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-tertiary/60">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                            <span key={key} className="inline-block mr-3">
                                {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ActivityFilters = ({ filters, onFilterChange }) => {
    return (
        <div className="flex flex-wrap gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search activities..."
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Type Filter */}
            <select
                value={filters.type}
                onChange={(e) => onFilterChange('type', e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
            >
                <option value="all">All Types</option>
                <option value="user">User</option>
                <option value="seller">Seller</option>
                <option value="listing">Listing</option>
                <option value="subscription">Subscription</option>
                <option value="payment">Payment</option>
            </select>

            {/* Date Range Filter */}
            <select
                value={filters.dateRange}
                onChange={(e) => onFilterChange('dateRange', e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
            >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
            </select>

            {/* Severity Filter */}
            <select
                value={filters.severity}
                onChange={(e) => onFilterChange('severity', e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
            >
                <option value="all">All Severity</option>
                <option value="info">Info</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
            </select>

            {/* Clear Filters */}
            {(filters.search || filters.type !== 'all' || filters.dateRange !== 'all' || filters.severity !== 'all') && (
                <button
                    onClick={() => onFilterChange('clear')}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-2"
                >
                    <X className="w-4 h-4" />
                    Clear Filters
                </button>
            )}
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-center items-center gap-2 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50"
            >
                Previous
            </button>
            <span className="text-sm text-tertiary">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
};

const ActivityDetailModal = ({ activity, onClose }) => {
    if (!activity) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-tertiary">Activity Details</h3>
                    <button onClick={onClose} className="text-tertiary/70 hover:text-tertiary">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-tertiary/70">Type</label>
                        <p className="text-tertiary">{activity.type}</p>
                    </div>
                    <div>
                        <label className="text-sm text-tertiary/70">Description</label>
                        <p className="text-tertiary">{activity.description}</p>
                    </div>
                    <div>
                        <label className="text-sm text-tertiary/70">Timestamp</label>
                        <p className="text-tertiary">{activity.timestamp}</p>
                    </div>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div>
                            <label className="text-sm text-tertiary/70">Metadata</label>
                            <pre className="mt-1 p-3 bg-gray-50 rounded-lg text-sm overflow-x-auto">
                                {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        dateRange: 'all',
        severity: 'all'
    });
    const [selectedActivity, setSelectedActivity] = useState(null);

    const handleFilterChange = (key, value) => {
        if (key === 'clear') {
            setFilters({
                search: '',
                type: 'all',
                dateRange: 'all',
                severity: 'all'
            });
        } else {
            setFilters(prev => ({ ...prev, [key]: value }));
        }
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch dashboard stats and activities with filters
                const [statsResponse, activitiesResponse] = await Promise.all([
                    api.admin.dashboard.getStats(),
                    api.admin.dashboard.getActivities({
                        page: currentPage,
                        ...filters
                    })
                ]);

                // Handle stats data
                if (statsResponse?.data?.success) {
                    const dashboardStats = statsResponse.data.data || {};
                    setStats({
                        totalUsers: dashboardStats.totalUsers || 0,
                        activeListings: dashboardStats.activeListings || 0,
                        totalRevenue: dashboardStats.totalRevenue || 0,
                        activeSellers: dashboardStats.totalSellers || 0,
                        userGrowth: dashboardStats.userGrowth || 0,
                        listingGrowth: dashboardStats.listingGrowth || 0,
                        revenueGrowth: dashboardStats.revenueGrowth || 0,
                        sellerGrowth: dashboardStats.sellerGrowth || 0
                    });
                }

                // Handle activities data
                if (activitiesResponse?.data?.success) {
                    const { activities, pagination } = activitiesResponse.data;
                    const formattedActivities = (activities || []).map(activity => ({
                        description: activity.description || activity.message || 'Unknown activity',
                        timestamp: new Date(activity.createdAt).toLocaleString(),
                        type: activity.type || 'general',
                        metadata: activity.metadata || {}
                    }));
                    setActivities(formattedActivities);
                    setTotalPages(pagination.totalPages);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError(err.message || 'Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentPage, filters]); // Refetch when page or filters change

    if (loading) {
        return (
            <AdminLayout title="Dashboard">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex items-center space-x-2 text-tertiary">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span>Loading dashboard...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Dashboard">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <div className="text-red-600">{error}</div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout 
            title="Dashboard Overview" 
            stats={{
                'Total Users': stats?.totalUsers || 0,
                'Active Listings': stats?.activeListings || 0,
                'Total Revenue': `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
                'Active Sellers': stats?.activeSellers || 0
            }}
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-secondary hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 text-primary" />
                        <span className="text-sm font-medium text-accent">
                            +{stats?.userGrowth || '0'}%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-tertiary">{stats?.totalUsers || '0'}</h3>
                    <p className="text-sm text-tertiary/70">Total Users</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-secondary hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <Activity className="w-8 h-8 text-primary" />
                        <span className="text-sm font-medium text-accent">
                            +{stats?.listingGrowth || '0'}%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-tertiary">{stats?.activeListings || '0'}</h3>
                    <p className="text-sm text-tertiary/70">Active Listings</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-secondary hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-8 h-8 text-primary" />
                        <span className="text-sm font-medium text-accent">
                            +{stats?.revenueGrowth || '0'}%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-tertiary">₹{stats?.totalRevenue?.toLocaleString() || '0'}</h3>
                    <p className="text-sm text-tertiary/70">Total Revenue</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-secondary hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-8 h-8 text-primary" />
                        <span className="text-sm font-medium text-accent">
                            +{stats?.sellerGrowth || '0'}%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-tertiary">{stats?.activeSellers || '0'}</h3>
                    <p className="text-sm text-tertiary/70">Active Sellers</p>
                </div>
            </div>

            {/* Activities Section */}
            <div className="bg-white rounded-xl border border-secondary p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-tertiary">Recent Activities</h2>
                </div>

                <ActivityFilters 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                <div className="space-y-4">
                    {activities.length > 0 ? (
                        <>
                            {activities.map((activity, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedActivity(activity)}
                                    className="cursor-pointer"
                                >
                                    <ActivityItem activity={activity} />
                                </div>
                            ))}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    ) : (
                        <div className="text-center py-8 text-tertiary/70">
                            No activities found
                        </div>
                    )}
                </div>
            </div>

            {selectedActivity && (
                <ActivityDetailModal
                    activity={selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                />
            )}
        </AdminLayout>
    );
};

export default AdminDashboard; 