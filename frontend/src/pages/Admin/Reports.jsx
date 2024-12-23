import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Search, Filter, AlertCircle, MoreVertical } from 'react-feather';
import api from '../../services/api';

const Reports = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.admin.reports.getAll({
                status: filter !== 'all' ? filter : undefined,
                page: pagination.page,
                limit: pagination.limit,
                sort: '-createdAt'
            });

            if (response.success) {
                setReports(response.data.reports);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            setError('Failed to load reports. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filter, pagination.page]);

    const filteredReports = reports.filter(report => {
        const searchString = searchTerm.toLowerCase();
        return (
            report.type?.toLowerCase().includes(searchString) ||
            report.status?.toLowerCase().includes(searchString) ||
            report.description?.toLowerCase().includes(searchString)
        );
    });

    if (loading) {
        return (
            <AdminLayout title="Reports">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex items-center space-x-2 text-tertiary">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span>Loading reports...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Reports">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <div className="text-red-600">{error}</div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const pendingReports = reports.filter(r => r.status === 'pending');
    const resolvedReports = reports.filter(r => r.status === 'resolved');

    return (
        <AdminLayout 
            title="Reports Management"
            stats={{
                'Total Reports': pagination.total,
                'Pending': pendingReports.length,
                'Resolved': resolvedReports.length
            }}
        >
            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-secondary p-4 mb-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-secondary rounded-lg text-tertiary bg-white/70 backdrop-blur-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
                                     hover:border-primary/20 transition-colors duration-200"
                        />
                        <Search className="w-5 h-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Filter */}
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-secondary rounded-lg text-tertiary bg-white/70 backdrop-blur-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
                                     hover:border-primary/20 transition-colors duration-200 appearance-none"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                        <Filter className="w-5 h-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-xl border border-secondary overflow-hidden hover:shadow-lg transition-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-secondary">
                                <th className="px-6 py-4 text-left text-sm font-medium text-tertiary/70">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-tertiary/70">Description</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-tertiary/70">Reported By</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-tertiary/70">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-tertiary/70">Date</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-tertiary/70">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((report) => (
                                <tr key={report._id} className="border-b border-secondary last:border-b-0">
                                    <td className="px-6 py-4 text-sm text-tertiary">{report.type}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-tertiary">{report.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">{report.reportedBy?.name || 'Anonymous'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                              report.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                                              report.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-tertiary hover:text-primary transition-colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="flex justify-center p-4 border-t border-secondary">
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
            </div>
        </AdminLayout>
    );
};

export default Reports; 