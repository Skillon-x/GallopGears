import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DollarSign, Download, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';

const PaymentCard = ({ payment }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-tertiary">
              Payment #{payment.transactionId}
            </h3>
            <p className="text-tertiary/70 text-sm mt-1">
              From: {payment.buyer.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              ₹{payment.amount.toLocaleString()}
            </div>
            <span className={`text-sm px-2 py-1 rounded-full ${
              payment.status === 'completed' ? 'bg-green-100 text-green-600' :
              payment.status === 'pending' ? 'bg-orange-100 text-orange-600' :
              'bg-red-100 text-red-600'
            }`}>
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center text-tertiary/70 hover:text-tertiary"
        >
          <span>Details</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-2 text-sm text-tertiary/70">
            <div className="flex justify-between">
              <span>Horse</span>
              <span className="text-tertiary">{payment.horse.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span className="text-tertiary">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span className="text-tertiary">
                {new Date(payment.createdAt).toLocaleDateString()}
              </span>
            </div>
            {payment.invoice && (
              <button className="flex items-center text-primary hover:text-primary/80 mt-2">
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    completedPayments: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.sellers.getPaymentHistory();
      if (response?.data?.success) {
        const transactions = response.data.payments || [];
        setPayments(transactions);
        
        // Calculate stats from transactions
        const stats = transactions.reduce((acc, transaction) => {
          acc.totalEarnings += transaction.status === 'completed' ? transaction.amount : 0;
          acc.completedPayments += transaction.status === 'completed' ? 1 : 0;
          acc.pendingPayments += transaction.status === 'pending' ? 1 : 0;
          return acc;
        }, {
          totalEarnings: 0,
          completedPayments: 0,
          pendingPayments: 0
        });
        
        setStats(stats);
      } else {
        throw new Error('Failed to fetch payment history');
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const content = loading ? (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  ) : error ? (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
      {error}
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-tertiary">Payments</h1>
        <div className="flex items-center gap-4">
          <select className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">All Payments</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-tertiary/70">Total Earnings</p>
              <p className="text-xl font-bold text-tertiary">
                ₹{(stats?.totalEarnings || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-tertiary/70">Completed Payments</p>
              <p className="text-xl font-bold text-tertiary">
                {stats?.completedPayments || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-tertiary/70">Pending Payments</p>
              <p className="text-xl font-bold text-tertiary">
                {stats?.pendingPayments || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-tertiary">No Payments Yet</h3>
          <p className="text-tertiary/70 mt-2">When you receive payments for your listings, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map(payment => (
            <PaymentCard key={payment._id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="pb-[500px]"> {/* Space for footer */}
        <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={setIsSidebarOpen} />
        <div className="lg:pl-64">
          <div className="p-8 pt-24"> {/* Increased top padding for navbar */}
            <DashboardHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="mt-8">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments; 