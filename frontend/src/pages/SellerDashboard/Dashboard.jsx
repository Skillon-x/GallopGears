import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import RecentActivities from './RecentActivities';
import PerformanceOverview from './PerformanceOverview';
import DashboardSidebar from './DashboardSidebar';

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const toggleSidebar = (value) => {
        setIsSidebarOpen(value ?? !isSidebarOpen);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 w-full lg:ml-64 min-h-screen pb-24">
                <div className="pt-24 px-4 lg:px-8 mb-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="space-y-6">
                            <DashboardHeader toggleSidebar={toggleSidebar} />
                            <DashboardStats />
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <PerformanceOverview />
                                </div>
                                <div>
                                    <RecentActivities />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 