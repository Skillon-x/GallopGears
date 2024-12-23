import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './layout/Layout';
import Home from './pages/Home/Home';
import Browse from './pages/Browse/Browse';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import RegisterSellerFlow from './pages/RegisterSellerFlow';
import Dashboard from './pages/SellerDashboard/Dashboard';
import AddListing from './pages/SellerDashboard/AddListing';
import Listings from './pages/SellerDashboard/Listings';
import Inquiries from './pages/SellerDashboard/Inquiries';
import Reviews from './pages/SellerDashboard/Reviews';
import Payments from './pages/SellerDashboard/Payments';
import Settings from './pages/SellerDashboard/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import SellerSubscriptionPlans from './pages/SellerSubscriptionPlans';
import HorseDetails from './pages/Browse/HorseDetails';
import EnquiryForm from './pages/Browse/EnquiryForm';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminListings from './pages/Admin/Listings';
import AdminPayments from './pages/Admin/Payments';
import AdminSettings from './pages/Admin/Settings';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/browse" element={<Layout><Browse /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/register/seller" element={<Layout><RegisterSellerFlow /></Layout>} />
          <Route path="/pricing" element={<Layout><SellerSubscriptionPlans /></Layout>} />
          <Route path="/horses/:id" element={<Layout><HorseDetails /></Layout>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Layout><AdminLogin /></Layout>} />
          
          {/* Protected Admin Routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/listings" element={<AdminListings />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/enquire/:id" element={<Layout><EnquiryForm /></Layout>} />
            
            {/* Seller Dashboard Routes */}
            <Route path="/seller/dashboard" element={<Layout><Dashboard /></Layout>} />
            
            {/* Listings Management */}
            <Route path="/seller/listings" element={<Layout><Listings /></Layout>} />
            <Route path="/seller/listings/new" element={<Layout><AddListing /></Layout>} />
            <Route path="/seller/listings/edit/:id" element={<Layout><AddListing /></Layout>} />
            
            {/* Other Seller Features */}
            <Route path="/seller/inquiries" element={<Layout><Inquiries /></Layout>} />
            <Route path="/seller/reviews" element={<Layout><Reviews /></Layout>} />
            <Route path="/seller/payments" element={<Layout><Payments /></Layout>} />
            <Route path="/seller/settings" element={<Layout><Settings /></Layout>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;