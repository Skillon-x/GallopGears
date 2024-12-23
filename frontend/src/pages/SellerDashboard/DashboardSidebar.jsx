import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CircleDollarSign, MessageSquare, Star, CreditCard, Settings, X } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-tertiary hover:bg-primary/10'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{children}</span>
    </Link>
  );
};

const DashboardSidebar = ({ isOpen, toggleSidebar }) => {
  const closeSidebar = () => toggleSidebar(false);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 pt-20
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 p-2 lg:hidden"
        >
          <X className="w-6 h-6 text-tertiary" />
        </button>

        <div className="p-6">
          <nav className="space-y-3">
            <SidebarLink to="/seller/dashboard" icon={LayoutDashboard} onClick={closeSidebar}>
              Dashboard
            </SidebarLink>
            <SidebarLink to="/seller/listings" icon={CircleDollarSign} onClick={closeSidebar}>
              My Listings
            </SidebarLink>
            <SidebarLink to="/seller/inquiries" icon={MessageSquare} onClick={closeSidebar}>
              Inquiries
            </SidebarLink>
            <SidebarLink to="/seller/reviews" icon={Star} onClick={closeSidebar}>
              Reviews
            </SidebarLink>
            <SidebarLink to="/seller/payments" icon={CreditCard} onClick={closeSidebar}>
              Payments
            </SidebarLink>
            <SidebarLink to="/seller/settings" icon={Settings} onClick={closeSidebar}>
              Settings
            </SidebarLink>
          </nav>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar; 