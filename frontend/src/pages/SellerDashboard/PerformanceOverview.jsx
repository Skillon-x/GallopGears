import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const PerformanceOverview = () => {
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState('views');

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                const [performanceRes, listingAnalytics, inquiryAnalytics] = await Promise.all([
                    api.sellers.dashboardPerformance(),
                    api.sellers.listingAnalytics(),
                    api.sellers.inquiryAnalytics()
                ]);

                if (!performanceRes?.data?.success || !listingAnalytics?.data?.success || !inquiryAnalytics?.data?.success) {
                    throw new Error('Failed to load performance data');
                }

                setPerformance({
                    metrics: performanceRes.data.performance,
                    listingAnalytics: listingAnalytics.data.analytics,
                    inquiryAnalytics: inquiryAnalytics.data.analytics
                });
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPerformance();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-600">Failed to load performance overview</p>
            </div>
        );
    }

    const displayPerformance = performance || {
        metrics: {
            thirtyDayMetrics: {
                totalViews: 0,
                totalInquiries: 0,
                responseRate: 0,
                averageResponseTime: 0,
                listingCount: 0
            }
        },
        listingAnalytics: {
            dailyStats: {}
        },
        inquiryAnalytics: {
            dailyStats: {}
        }
    };

    // Get dates for the last 30 days
    const dates = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    // Prepare chart data based on selected metric
    const chartData = {
        labels: dates,
        datasets: [
            {
                label: selectedMetric === 'views' ? 'Views' : 
                       selectedMetric === 'inquiries' ? 'Inquiries' : 
                       'Average Price',
                data: dates.map(date => {
                    const stats = displayPerformance.listingAnalytics.dailyStats[date] || {};
                    return selectedMetric === 'views' ? stats.views || 0 :
                           selectedMetric === 'inquiries' ? stats.inquiries || 0 :
                           stats.averagePrice || 0;
                }),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-tertiary">Performance Overview</h2>
                    <select
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="views">Listing Views</option>
                        <option value="inquiries">Inquiries</option>
                        <option value="price">Average Price</option>
                    </select>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                        <p className="text-sm text-tertiary/60">Total Views</p>
                        <p className="text-2xl font-bold text-tertiary mt-1">
                            {displayPerformance.metrics.thirtyDayMetrics.totalViews}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-tertiary/60">Total Inquiries</p>
                        <p className="text-2xl font-bold text-tertiary mt-1">
                            {displayPerformance.metrics.thirtyDayMetrics.totalInquiries}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-tertiary/60">Response Rate</p>
                        <p className="text-2xl font-bold text-tertiary mt-1">
                            {displayPerformance.metrics.thirtyDayMetrics.responseRate}%
                        </p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="h-64">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
};

export default PerformanceOverview; 