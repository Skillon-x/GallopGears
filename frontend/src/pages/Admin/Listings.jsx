import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit, Trash2, AlertCircle, Star, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminListings = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, listingId: null });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    const fetchListings = async () => {
        try {
            setLoading(true);
            setError(null);
            let response;

            switch (filter) {
                case 'pending':
                    response = await api.admin.listings.getPending();
                    break;
                case 'reported':
                    response = await api.admin.listings.getReported();
                    break;
                case 'featured':
                    response = await api.admin.listings.getFeatured();
                    break;
                case 'expired':
                    response = await api.admin.listings.getExpired();
                    break;
                case 'draft':
                    response = await api.admin.listings.getDraft();
                    break;
                default:
                    response = await api.admin.listings.getPending(); // Default to pending
            }

            if (response.data?.success) {
                setListings(response.data.listings || []);
                setPagination(prev => ({
                    ...prev,
                    ...(response.data.pagination || {}),
                    total: response.data.listings?.length || 0,
                    pages: Math.ceil((response.data.listings?.length || 0) / prev.limit)
                }));
            }
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            setError(error.message || 'Failed to load listings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [filter, pagination.page]);

    const handleDeleteListing = async () => {
        if (!deleteModal.listingId) return;
        
        try {
            await api.admin.listings.delete(deleteModal.listingId);
            setDeleteModal({ show: false, listingId: null });
            fetchListings(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete listing:', error);
            alert('Failed to delete listing. Please try again.');
        }
    };

    const handleVerifyListing = async (id, status) => {
        try {
            await api.admin.listings.verify(id, status);
            fetchListings(); // Refresh the list
        } catch (error) {
            console.error('Failed to verify listing:', error);
            alert('Failed to verify listing. Please try again.');
        }
    };

    const handleFeatureListing = async (id, featured) => {
        try {
            await api.admin.listings.updateFeaturedStatus(id, featured);
            fetchListings(); // Refresh the list
        } catch (error) {
            console.error('Failed to update featured status:', error);
            alert('Failed to update featured status. Please try again.');
        }
    };

    const handleExtendListing = async (id, duration) => {
        try {
            await api.admin.listings.extendListing(id, duration);
            fetchListings(); // Refresh the list
        } catch (error) {
            console.error('Failed to extend listing:', error);
            alert('Failed to extend listing. Please try again.');
        }
    };

    const filteredListings = listings.filter(listing => {
        const title = listing.title || '';
        const breed = listing.breed || '';
        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               breed.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <AdminLayout title="Manage Listings">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex items-center space-x-2 text-tertiary">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span>Loading listings...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Manage Listings">
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
            title="Manage Listings"
            stats={{
                'Total Listings': pagination.total,
                'Active': listings.filter(l => l.status === 'active').length,
                'Pending': listings.filter(l => l.status === 'pending').length
            }}
        >
            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-secondary p-4 mb-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search listings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-secondary rounded-lg text-tertiary bg-white/70 backdrop-blur-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
                                     hover:border-primary/20 transition-colors duration-200"
                        />
                        <Search className="w-5 h-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Filter */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-secondary rounded-lg text-tertiary bg-white/70 backdrop-blur-sm
                                         appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
                                         hover:border-primary/20 transition-colors duration-200"
                            >
                                <option value="all">All Listings</option>
                                <option value="pending">Pending</option>
                                <option value="reported">Reported</option>
                                <option value="featured">Featured</option>
                                <option value="expired">Expired</option>
                                <option value="draft">Draft</option>
                            </select>
                            <Filter className="w-5 h-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Listings Table */}
            <div className="bg-white rounded-xl border border-secondary overflow-hidden hover:shadow-lg transition-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-secondary/10 border-b border-secondary">
                                <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">Listing</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">Seller</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">Listed</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-tertiary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary">
                            {filteredListings.map((listing) => (
                                <tr key={listing._id} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {listing.images?.[0] ? (
                                                    <img 
                                                        src={listing.images[0]} 
                                                        alt={listing.title}
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Edit className="h-6 w-6 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-tertiary">{listing.title}</div>
                                                <div className="text-sm text-tertiary/70">{listing.breed}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-tertiary">{listing.seller?.name}</div>
                                        <div className="text-sm text-tertiary/70">{listing.seller?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            listing.status === 'active' ? 'bg-green-100 text-green-800' :
                                            listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            listing.status === 'reported' ? 'bg-red-100 text-red-800' :
                                            listing.status === 'featured' ? 'bg-primary/10 text-primary' :
                                            'bg-tertiary/10 text-tertiary'
                                        }`}>
                                            {listing.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-tertiary">
                                        ₹{listing.price?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-tertiary">
                                        {new Date(listing.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            {listing.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleVerifyListing(listing._id, 'approved')}
                                                        className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                                                    >
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleVerifyListing(listing._id, 'rejected')}
                                                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => handleFeatureListing(listing._id, !listing.featured)}
                                                className={`p-1.5 hover:bg-primary/10 rounded-lg transition-colors ${
                                                    listing.featured ? 'text-primary' : 'text-tertiary/50'
                                                }`}
                                            >
                                                <Star className="w-4 h-4" />
                                            </button>
                                            {listing.status === 'expired' && (
                                                <button 
                                                    onClick={() => handleExtendListing(listing._id, 30)}
                                                    className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                                                >
                                                    <Clock className="w-4 h-4 text-primary" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setDeleteModal({ show: true, listingId: listing._id })}
                                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                            <button className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors">
                                                <MoreVertical className="w-4 h-4 text-tertiary" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-secondary rounded-lg text-sm text-tertiary hover:bg-primary/5 
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-tertiary">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 border border-secondary rounded-lg text-sm text-tertiary hover:bg-primary/5 
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 hover:shadow-lg transition-shadow">
                        <h3 className="text-lg font-semibold text-tertiary mb-2">Delete Listing</h3>
                        <p className="text-tertiary/70 mb-6">
                            Are you sure you want to delete this listing? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setDeleteModal({ show: false, listingId: null })}
                                className="px-4 py-2 text-sm text-tertiary hover:bg-primary/5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteListing}
                                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminListings; 