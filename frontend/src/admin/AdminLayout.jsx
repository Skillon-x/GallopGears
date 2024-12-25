import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AdminLayout = ({ children, title, stats }) => {
    return (
        <div className="min-h-screen bg-secondary/10">
            <Sidebar />
            <Topbar title={title} stats={stats} />
            <main className="lg:pl-64 pt-16">
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout; 