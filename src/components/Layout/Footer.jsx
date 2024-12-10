import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary-50 border-t border-primary-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-2xl">🐎</span>
              <span className="text-xl font-bold text-primary-700">GallopMart</span>
            </Link>
            <p className="mt-4 text-primary-600">
              Your trusted marketplace for equestrian excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-primary-400 tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/" className="text-primary-600 hover:text-primary-800">
                  Market
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-primary-600 hover:text-primary-800">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/vendor/login" className="text-primary-600 hover:text-primary-800">
                  Sell Horses
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-primary-400 tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-primary-600 hover:text-primary-800">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:text-primary-800">
                  Safety Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:text-primary-800">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-primary-400 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-primary-600 hover:text-primary-800">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:text-primary-800">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-200">
          <p className="text-center text-primary-400">
            © {new Date().getFullYear()} GallopMart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 