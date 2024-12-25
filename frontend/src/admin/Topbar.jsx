import React from 'react';
import { Bell, Menu, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ title, stats }) => {
    const { user } = useAuth();

    return (
        <header className="bg-white border-b border-secondary fixed top-0 right-0 left-0 lg:left-64 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Title and Stats */}
                    <div>
                        <h1 className="text-2xl font-semibold text-tertiary">{title}</h1>
                        {stats && (
                            <div className="mt-1 flex items-center space-x-4">
                                {Object.entries(stats).map(([key, value]) => (
                                    <span key={key} className="text-sm text-tertiary/70">
                                        {key}: <span className="font-medium text-tertiary">{value}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <button className="p-2 text-tertiary hover:bg-primary/5 rounded-lg transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Profile */}
                        <div className="flex items-center space-x-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium text-tertiary">{user?.name}</div>
                                <div className="text-xs text-tertiary/70">{user?.email}</div>
                            </div>
                            <button className="p-1.5 text-tertiary hover:bg-primary/5 rounded-lg transition-colors">
                                <User className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="p-2 text-tertiary hover:bg-primary/5 rounded-lg transition-colors lg:hidden">
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar; 