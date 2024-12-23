import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit, Trash2, CheckCircle, XCircle, Loader, AlertCircle, Activity } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModal, setDeleteModal] = useState({
        show: false,
        userId: null,
        userName: '',
        userRole: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.admin.users.getAll({
                role: filter !== 'all' ? filter : undefined,
                page: pagination.page,
                limit: pagination.limit,
                sort: '-createdAt'
            });

            if (response.data?.success) {
                setUsers(response.data.data.users);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setError('Failed to load users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filter, pagination.page]);

    const handleDeleteUser = async (userId, userRole) => {
        try {
            if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all associated data.')) {
                return;
            }

            setLoading(true);
            const response = await api.admin.users.delete(userId);

            if (response?.data?.success) {
                // Remove user from local state
                setUsers(prev => prev.filter(user => user._id !== userId));
                toast.success('User deleted successfully');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error(error.message || 'Failed to delete user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId) => {
        try {
            await api.admin.users.block(userId);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Failed to block user:', error);
            alert('Failed to block user. Please try again.');
        }
    };

    const handleUnblockUser = async (userId) => {
        try {
            await api.admin.users.unblock(userId);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Failed to unblock user:', error);
            alert('Failed to unblock user. Please try again.');
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await api.admin.users.updateRole(userId, newRole);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Failed to update user role:', error);
            alert('Failed to update user role. Please try again.');
        }
    };

    const handleViewActivity = async (userId) => {
        try {
            const response = await api.admin.users.getActivity(userId);
            // Handle activity data (e.g., show in modal)
            console.log(response.data);
        } catch (error) {
            console.error('Failed to fetch user activity:', error);
            alert('Failed to fetch user activity. Please try again.');
        }
    };

    const handleDeleteClick = (user) => {
        setDeleteModal({
            show: true,
            userId: user._id,
            userName: user.name,
            userRole: user.role
        });
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, userName }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold text-tertiary mb-4">Confirm Deletion</h3>
                    <p className="text-tertiary/70 mb-6">
                        Are you sure you want to delete {userName}? This action cannot be undone and will delete all associated data including:
                        <ul className="list-disc ml-6 mt-2">
                            <li>User profile and settings</li>
                            <li>All activities and logs</li>
                            <li>Inquiries and messages</li>
                            <li>Transactions and payment history</li>
                            {deleteModal.userRole === 'seller' && (
                                <>
                                    <li>Seller profile and documents</li>
                                    <li>All listings and images</li>
                                    <li>Business transactions</li>
                                </>
                            )}
                        </ul>
                    </p>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-tertiary hover:text-tertiary/70"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Delete User
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <AdminLayout title="Users">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex items-center space-x-2 text-tertiary">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span>Loading users...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Users">
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
            title="Manage Users"
            stats={{
                'Total Users': pagination.total,
                'Active': users.filter(u => u.status === 'active').length,
                'Sellers': users.filter(u => u.role === 'seller').length,
                'Admins': users.filter(u => u.role === 'admin').length
            }}
        >
            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-secondary p-4 mb-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search users..."
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
                                <option value="all">All Users</option>
                                <option value="user">Regular Users</option>
                                <option value="seller">Sellers</option>
                                <option value="admin">Admins</option>
                            </select>
                            <Filter className="w-5 h-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-secondary overflow-hidden hover:shadow-lg transition-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-secondary/10 border-b border-secondary">
                                <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-tertiary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-primary text-lg font-medium">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-tertiary">{user.name}</div>
                                                <div className="text-sm text-tertiary/70">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.role === 'admin' ? 'bg-primary/10 text-primary' :
                                            user.role === 'seller' ? 'bg-accent/10 text-accent' :
                                            'bg-tertiary/10 text-tertiary'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-tertiary">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button 
                                                onClick={() => handleViewActivity(user._id)}
                                                className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                                            >
                                                <Activity className="w-4 h-4 text-primary" />
                                            </button>
                                            {user.status === 'active' ? (
                                                <button 
                                                    onClick={() => handleBlockUser(user._id)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleUnblockUser(user._id)}
                                                    className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                                                >
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                </button>
                                            )}
                                            {user.role !== 'admin' && (
                                                <button 
                                                    onClick={() => handleDeleteClick(user)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            )}
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
                <DeleteConfirmationDialog
                    isOpen={deleteModal.show}
                    onClose={() => setDeleteModal({ show: false, userId: null, userName: '', userRole: '' })}
                    onConfirm={() => handleDeleteUser(deleteModal.userId, deleteModal.userRole)}
                    userName={deleteModal.userName}
                    userRole={deleteModal.userRole}
                />
            )}
        </AdminLayout>
    );
};

export default AdminUsers; 