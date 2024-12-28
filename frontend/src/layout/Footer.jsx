import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Facebook, 
    Instagram, 
    Twitter, 
    Youtube, 
    Phone, 
    Mail, 
    MapPin,
    ShoppingBag,
    Store,
    HelpCircle,
    FileText,
    Shield,
    Award,
    Clock,
    Heart,
    MessageSquare,
    Settings,
    ChevronRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/95 backdrop-blur-sm border-t border-gray-100 mt-auto">
      {/* Trust Badges */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:ml-64">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-300 group">
              <Shield className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              <div className="ml-4">
                <h3 className="text-sm font-semibold text-tertiary">Secure Payments</h3>
                <p className="text-xs text-tertiary/60 mt-0.5">Safe & encrypted transactions</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-300 group">
              <Award className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              <div className="ml-4">
                <h3 className="text-sm font-semibold text-tertiary">Verified Sellers</h3>
                <p className="text-xs text-tertiary/60 mt-0.5">Trusted marketplace</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-300 group">
              <Clock className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              <div className="ml-4">
                <h3 className="text-sm font-semibold text-tertiary">24/7 Support</h3>
                <p className="text-xs text-tertiary/60 mt-0.5">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:ml-64">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Main Navigation */}
          <div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="group flex items-center text-sm text-tertiary/70 hover:text-primary transition-colors">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  <span>Browse Horses</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="group flex items-center text-sm text-tertiary/70 hover:text-primary transition-colors">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Pricing Plans</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link to="/register/seller" className="group flex items-center text-sm text-tertiary/70 hover:text-primary transition-colors">
                  <Store className="w-4 h-4 mr-2" />
                  <span>Become a Seller</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Seller Resources */}
          <div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">Seller Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/seller/dashboard" className="group flex items-center text-sm text-tertiary/70 hover:text-primary transition-colors">
                  <Store className="w-4 h-4 mr-2" />
                  <span>Seller Dashboard</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link to="/seller/listings" className="group flex items-center text-sm text-tertiary/70 hover:text-primary transition-colors">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  <span>Manage Listings</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link to="/seller/inquiries" className="group flex items-center text-sm text-tertiary/70 hover:text-primary transition-colors">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>Manage Inquiries</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link to="/seller/settings" className="group flex items-center text-sm text-tertiary/70 hover:text-primary transition-colors">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Account Settings</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">Help & Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help/buying" className="group flex items-center text-sm text-tertiary/70 hover:text-primary transition-colors">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  <span>Buying Guide</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link to="/help/selling" className="group flex items-center text-sm text-tertiary/70 hover:text-primary transition-colors">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  <span>Selling Guide</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link to="/safety" className="group flex items-center text-sm text-tertiary/70 hover:text-primary transition-colors">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Safety Tips</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">Connect With Us</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <a 
                  href="mailto:support@gallopinggears.com" 
                  className="group flex items-center text-sm text-tertiary/70 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  <span>support@gallopinggears.com</span>
                </a>
                <a 
                  href="tel:+919876543210" 
                  className="group flex items-center text-sm text-tertiary/70 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  <span>+91 98765 43210</span>
                </a>
              </div>
              
              {/* Social Links */}
              <div>
                <p className="text-sm font-medium text-tertiary mb-3">Follow Us</p>
                <div className="flex space-x-2">
                  <a href="#" className="p-2 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-300 group">
                    <Facebook className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a href="#" className="p-2 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-300 group">
                    <Instagram className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a href="#" className="p-2 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-300 group">
                    <Twitter className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a href="#" className="p-2 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-300 group">
                    <Youtube className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Links & Copyright */}
        <div className="border-t border-gray-100 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
              <Link to="/terms" className="text-tertiary/70 hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-tertiary/70 hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/refund" className="text-tertiary/70 hover:text-primary transition-colors">Refund Policy</Link>
            </div>
            <div className="text-sm text-tertiary/60">
              © {currentYear} GallopingGears. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;