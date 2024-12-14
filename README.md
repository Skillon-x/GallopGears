# Galloping Gears - Horse Selling Platform

A comprehensive platform for buying and selling horses in India, with subscription-based seller accounts, advanced listing features, and secure payment processing.

## Features

### For Sellers
- Three subscription tiers: Royal Stallion, Gallop, and Trot
- Multiple listing management with photo and video uploads
- Document verification system
- Analytics dashboard
- Virtual stable tour feature (Premium)
- Featured listings and spotlight placement
- Direct messaging with potential buyers

### For Buyers
- Advanced search and filtering options
- Favorite listings management
- Direct inquiries to sellers
- Detailed horse information and media
- Seller verification status
- Recommended listings based on preferences

### For Admins
- Comprehensive dashboard with statistics
- User and seller management
- Listing verification
- Transaction monitoring
- Analytics and reporting
- System logs and monitoring

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Cloudinary (Media Storage)
- Stripe (Payment Processing)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary Account
- Stripe Account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/galloping-gears.git
cd galloping-gears
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Documentation

### Authentication Routes
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- POST /api/auth/forgotpassword - Request password reset
- PUT /api/auth/resetpassword/:token - Reset password
- GET /api/auth/verify-email/:token - Verify email

### Seller Routes
- POST /api/sellers/profile - Create seller profile
- GET /api/sellers/profile - Get seller profile
- PUT /api/sellers/profile - Update seller profile
- POST /api/sellers/documents - Upload verification documents
- POST /api/sellers/subscribe/:package - Subscribe to a package
- GET /api/sellers/statistics - Get seller statistics
- GET /api/sellers/listings - Get seller listings
- GET /api/sellers/dashboard - Get dashboard data

### Horse Routes
- POST /api/horses - Create horse listing
- PUT /api/horses/:id - Update horse listing
- DELETE /api/horses/:id - Delete horse listing
- GET /api/horses/:id - Get single horse listing
- GET /api/horses - Get all horse listings
- POST /api/horses/:id/images - Upload horse images
- POST /api/horses/:id/videos - Upload horse videos
- POST /api/horses/:id/documents - Upload horse documents
- POST /api/horses/:id/favorites - Add to favorites
- DELETE /api/horses/:id/favorites - Remove from favorites
- GET /api/horses/search - Search horses
- GET /api/horses/recommended - Get recommended horses

### Admin Routes
- GET /api/admin/dashboard - Get admin dashboard stats
- GET /api/admin/users - Get all users
- GET /api/admin/sellers - Get all sellers
- GET /api/admin/transactions - Get all transactions
- PUT /api/admin/sellers/:id/verification - Update seller verification
- GET /api/admin/listings - Get all listings
- PUT /api/admin/listings/:id/verification - Update listing verification
- GET /api/admin/analytics - Get analytics data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@gallopinggears.com or join our Slack channel. 