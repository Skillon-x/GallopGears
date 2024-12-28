import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './layout/Layout';
import Home from './pages/Home/Home';
import Browse from './pages/Browse/browse';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import RegisterSellerFlow from './pages/Auth/RegisterSellerFlow';
import Dashboard from './pages/SellerDashboard/Dashboard';
import AddListing from './pages/SellerDashboard/AddListing';
import Listings from './pages/SellerDashboard/Listings';
import SellerInquiries from './pages/SellerDashboard/Inquiries';
import UserInquiries from './pages/UserDashboard/Inquiries';
import Favorites from './pages/UserDashboard/Favorites';
import Payments from './pages/SellerDashboard/Payments';
import Settings from './pages/SellerDashboard/Settings';
import Notifications from './pages/Notifications/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import SellerSubscriptionPlans from './pages/SellerSubscriptionPlans';
import HorseDetails from './components/HorseDetails';
import Enquire from './components/Enquire';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminListings from './pages/Admin/Listings';
import AdminPayments from './pages/Admin/Payments';
import AdminSettings from './pages/Admin/Settings';
import IncompleteRegistrationGuard from './components/IncompleteRegistrationGuard';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <IncompleteRegistrationGuard>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/browse" element={<Layout><Browse /></Layout>} />
            <Route path="/horses/:id" element={<Layout><HorseDetails /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route path="/register/seller" element={<Layout><RegisterSellerFlow /></Layout>} />
            <Route path="/pricing" element={<Layout><SellerSubscriptionPlans /></Layout>} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/listings" element={<AdminListings />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* User Routes */}
              <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
              <Route path="/inquiries" element={<Layout><UserInquiries /></Layout>} />
              <Route path="/inquire/:id" element={<Layout><Enquire /></Layout>} />
              <Route path="/favorites" element={<Layout><Favorites /></Layout>} />
              {/* Seller Dashboard Routes */}
              <Route path="/seller/dashboard" element={<Layout><Dashboard /></Layout>} />
              
              {/* Listings Management */}
              <Route path="/seller/listings" element={<Layout><Listings /></Layout>} />
              <Route path="/seller/listings/new" element={<Layout><AddListing /></Layout>} />
              <Route path="/seller/listings/edit/:id" element={<Layout><AddListing /></Layout>} />
              
              {/* Other Seller Features */}
              <Route path="/seller/inquiries" element={<Layout><SellerInquiries /></Layout>} />
              <Route path="/seller/payments" element={<Layout><Payments /></Layout>} />
              <Route path="/seller/settings" element={<Layout><Settings /></Layout>} />
            </Route>
          </Routes>
        </IncompleteRegistrationGuard>
      </Router>
    </AuthProvider>
  );
};

export default App;