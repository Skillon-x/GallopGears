import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Market from './components/Market/Market';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VendorLogin from './components/Auth/VendorLogin';
import HorseDetail from './components/Market/HorseDetail';
import SellerDashboard from './components/Market/SellerDashboard';
import UserProfile from './components/User/UserProfile';
import ChatSystem from './components/Chat/ChatSystem';
import AddHorseForm from './components/Market/AddHorseForm';
import NotFound from './components/Layout/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <div className="container mx-auto px-4 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Market />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/vendor/login" element={<VendorLogin />} />
                <Route path="/horses/:id" element={<HorseDetail />} />

                {/* Protected Routes */}
                <Route
                  path="/seller"
                  element={
                    <PrivateRoute role="seller">
                      <SellerDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/seller/add-horse"
                  element={
                    <PrivateRoute role="seller">
                      <AddHorseForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <UserProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <PrivateRoute>
                      <ChatSystem />
                    </PrivateRoute>
                  }
                />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
