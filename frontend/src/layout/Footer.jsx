import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-tertiary">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary mb-4">About GallopingGears</h3>
            <p className="text-tertiary/80">The premier marketplace for buying and selling horses, stables, and equestrian equipment. Your trusted partner in the equestrian world.</p>
            <div className="flex space-x-4">
              <Facebook className="w-6 h-6 cursor-pointer text-tertiary/70 hover:text-primary transition-colors" />
              <Instagram className="w-6 h-6 cursor-pointer text-tertiary/70 hover:text-primary transition-colors" />
              <Twitter className="w-6 h-6 cursor-pointer text-tertiary/70 hover:text-primary transition-colors" />
              <Youtube className="w-6 h-6 cursor-pointer text-tertiary/70 hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Browse Horses</li>
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Premium Horses</li>
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Stables for Sale</li>
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Equipment Store</li>
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">List Your Horse</li>
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Pricing Plans</li>
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Success Stories</li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">How to Buy</li>
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Seller Guidelines</li>
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Safety Tips</li>
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Fraud Prevention</li>
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">FAQ</li>
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Contact Support</li>
              <li className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Report Issues</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-tertiary/80">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-tertiary/80">support@gallopinggears.in</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-tertiary/80">Mumbai, Maharashtra, India</span>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="text-primary font-semibold mb-2">Join Our Newsletter</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-l-lg w-full bg-white text-tertiary focus:outline-none focus:ring-2 focus:ring-primary border-r-0"
                />
                <button className="bg-primary hover:bg-accent px-4 py-2 rounded-r-lg text-white transition-all duration-300">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="border-t border-tertiary/10 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-x-4">
              <span className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
              <span className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
              <span className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Refund Policy</span>
              <span className="text-tertiary/80 hover:text-primary cursor-pointer transition-colors">Legal</span>
            </div>
            <div className="text-right md:text-right">
              <span className="text-tertiary/70">© {currentYear} GallopingGears. All rights reserved.</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center">
              <span className="bg-white/50 text-primary px-6 py-2 rounded-lg text-sm font-semibold shadow-sm">
                Secure Payments
              </span>
            </div>
            <div className="flex items-center">
              <span className="bg-white/50 text-primary px-6 py-2 rounded-lg text-sm font-semibold shadow-sm">
                Verified Sellers
              </span>
            </div>
            <div className="flex items-center">
              <span className="bg-white/50 text-primary px-6 py-2 rounded-lg text-sm font-semibold shadow-sm">
                24/7 Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;