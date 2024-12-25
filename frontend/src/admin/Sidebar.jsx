import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 

    Users, 
    FileText, 
    Settings, 
    CreditCard,
    Flag,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/listings', icon: Users, label: 'Listings' },
        { path: '/admin/reports', icon: Flag, label: 'Reports' },
        { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-secondary hidden lg:block">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-secondary">
                <Link to="/admin/dashboard" className="text-2xl font-bold text-primary">
                    Admin Panel
                </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                                    isActive(item.path)
                                        ? 'bg-primary text-white'
                                        : 'text-tertiary hover:bg-primary/5'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar; 