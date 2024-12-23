import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Download, AlertCircle, Activity } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminPayments = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.admin.transactions.getAll({
                status: filter !== 'all' ? filter : undefined,
                page: pagination.page,
                limit: pagination.limit,
                sort: '-createdAt'
            });

            if (response.data?.success) {
                setTransactions(response.data.data.transactions);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            setError('Failed to load transactions. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [filter, pagination.page]);

    const handleExportTransactions = async () => {
        try {
            const response = await api.admin.transactions.export();
            // Handle CSV download
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transactions.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export transactions:', error);
            alert('Failed to export transactions. Please try again.');
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        const searchString = searchTerm.toLowerCase();
        return (
            transaction.seller?.businessName?.toLowerCase().includes(searchString) ||
            transaction.type?.toLowerCase().includes(searchString) ||
            transaction.status?.toLowerCase().includes(searchString) ||
            transaction._id?.toLowerCase().includes(searchString)
        );
    });

    if (loading) {
        return (
            <AdminLayout title="Payments">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex items-center space-x-2 text-tertiary">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span>Loading transactions...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Payments">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <div className="text-red-600">{error}</div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const failedTransactions = transactions.filter(t => t.status === 'failed');

    return (
        <AdminLayout 
            title="Payment History"
            stats={{
                'Total Amount': `₹${totalAmount.toLocaleString()}`,
                'Total Transactions': pagination.total,
                'Completed': completedTransactions.length,
                'Failed': failedTransactions.length
            }}
        >
            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-secondary p-4 mb-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search transactions..."
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
                                className="pl-10 pr-4 py-2 border border-secondary rounded-lg text-tertiary bg-white/70 backdrop-blur-sm
                                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
                                         hover:border-primary/20 transition-colors duration-200 appearance-none"
                            >
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                            <Filter className="w-5 h-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>

                        <button
                            onClick={handleExportTransactions}
                            className="flex items-center space-x-2 px-4 py-2 border border-secondary rounded-lg text-tertiary
                                     hover:bg-primary/5 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border border-secondary overflow-hidden hover:shadow-lg transition-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-secondary">
                                <th className="px-6 py-4 text-left text-sm font-medium text-tertiary/70">ID</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-tertiary/70">Seller</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-tertiary/70">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-tertiary/70">Amount</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-tertiary/70">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-tertiary/70">Date</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-tertiary/70">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction._id} className="border-b border-secondary last:border-b-0">
                                    <td className="px-6 py-4 text-sm text-tertiary">{transaction._id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-tertiary">{transaction.seller?.businessName || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">{transaction.type}</td>
                                    <td className="px-6 py-4 text-sm text-tertiary">₹{transaction.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                              transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {transaction.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        {new Date(transaction.createdAt).toLocaleDateString()}
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

export default AdminPayments; 