import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    MessageSquare,
    CreditCard,
    Settings,
    X
} from 'lucide-react';

const DashboardSidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
        { name: 'Listings', href: '/seller/listings', icon: ShoppingBag },
        { name: 'Inquiries', href: '/seller/inquiries', icon: MessageSquare },
        { name: 'Payments', href: '/seller/payments', icon: CreditCard },
        { name: 'Settings', href: '/seller/settings', icon: Settings }
    ];

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 lg:hidden z-40"
                    onClick={() => toggleSidebar(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-[80px] left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Close button - Mobile only */}
                    <div className="lg:hidden p-4 flex justify-end">
                        <button
                            onClick={() => toggleSidebar(false)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                                        isActive
                                            ? 'bg-primary text-white'
                                            : 'text-tertiary hover:bg-gray-100'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Help Section */}
                    <div className="p-4 border-t border-gray-200 mt-auto">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-tertiary">Need Help?</h4>
                            <p className="mt-1 text-sm text-tertiary/70">
                                Contact our support team
                            </p>
                            <a
                                href="mailto:support@gallopinggears.com"
                                className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
                            >
                                support@gallopinggears.com
                            </a>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar; 