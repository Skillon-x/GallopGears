const axios = require('axios');
const colors = require('colors');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';

// Test configuration
const config = {
    auth: {
        email: 'admin@example.com',
        password: 'admin123'
    }
};

// Utility functions
const log = {
    success: (msg) => console.log('✓'.green, msg),
    error: (msg) => console.log('✗'.red, msg),
    info: (msg) => console.log('ℹ'.blue, msg),
    header: (msg) => console.log('\n' + '='.repeat(50).yellow + '\n' + msg + '\n' + '='.repeat(50).yellow)
};

// Test endpoints
const endpoints = {
    // Dashboard and System
    dashboard: [
        { method: 'GET', path: '/admin/dashboard', name: 'Dashboard Stats' },
        { method: 'GET', path: '/admin/system-health', name: 'System Health' },
        { method: 'GET', path: '/admin/emergency-alerts', name: 'Emergency Alerts' },
        { method: 'GET', path: '/admin/visitor-analytics', name: 'Visitor Analytics' }
    ],

    // User Management
    users: [
        { method: 'GET', path: '/admin/users', name: 'Get Users' },
        { method: 'GET', path: '/admin/sellers', name: 'Get Sellers' },
        { method: 'GET', path: '/admin/sellers/1', name: 'Get Seller Details' },
        { method: 'GET', path: '/admin/sellers/1/payments', name: 'Seller Payment History' },
        { method: 'GET', path: '/admin/sellers/1/complaints', name: 'Seller Complaints' },
        { method: 'GET', path: '/admin/sellers/1/activity', name: 'Seller Activity Logs' },
        { method: 'PUT', path: '/admin/users/1/block', name: 'Toggle User Block', data: { blocked: true } }
    ],

    // Listing Management
    listings: [
        { method: 'GET', path: '/admin/listings', name: 'Get Listings' },
        { method: 'GET', path: '/admin/listings/pending', name: 'Pending Approvals' },
        { method: 'GET', path: '/admin/listings/reported', name: 'Reported Listings' },
        { method: 'GET', path: '/admin/listings/featured', name: 'Featured Listings' },
        { method: 'GET', path: '/admin/listings/expired', name: 'Expired Listings' },
        { method: 'GET', path: '/admin/listings/drafts', name: 'Draft Listings' },
        { 
            method: 'PUT', 
            path: '/admin/listings/1/verification', 
            name: 'Update Listing Verification',
            data: { status: 'verified' }
        }
    ],

    // Financial Management
    financial: [
        { method: 'GET', path: '/admin/financial-dashboard', name: 'Financial Dashboard' },
        { method: 'GET', path: '/admin/revenue', name: 'Revenue Stats' },
        { method: 'GET', path: '/admin/revenue/packages', name: 'Package Revenue' },
        { method: 'GET', path: '/admin/revenue/boosts', name: 'Boost Revenue' },
        { method: 'GET', path: '/admin/revenue/features', name: 'Feature Revenue' },
        { method: 'GET', path: '/admin/financial-reports', name: 'Financial Reports' },
        { 
            method: 'POST', 
            path: '/admin/refunds', 
            name: 'Manage Refunds',
            data: {
                transactionId: '1',
                reason: 'test refund',
                amount: 100
            }
        }
    ],

    // Pricing Management
    pricing: [
        { 
            method: 'PUT', 
            path: '/admin/pricing/packages', 
            name: 'Update Package Pricing',
            data: {
                package: 'Royal Stallion',
                price: 9999
            }
        },
        { 
            method: 'POST', 
            path: '/admin/promotions', 
            name: 'Create Promotion',
            data: {
                name: 'Test Promotion',
                type: 'discount',
                value: 10
            }
        }
    ],

    // Category Management
    categories: [
        { method: 'GET', path: '/admin/category-dashboard', name: 'Category Dashboard' },
        { method: 'GET', path: '/admin/categories', name: 'Get Categories' },
        { 
            method: 'POST', 
            path: '/admin/categories', 
            name: 'Create Category',
            data: {
                name: 'Test Category',
                type: 'horse_breed'
            }
        }
    ],

    // Communication Center
    communication: [
        { method: 'GET', path: '/admin/communication-dashboard', name: 'Communication Dashboard' },
        { method: 'GET', path: '/admin/tickets', name: 'Get Tickets' },
        { 
            method: 'POST', 
            path: '/admin/communication/bulk-email', 
            name: 'Send Bulk Email',
            data: {
                subject: 'Test Email',
                content: 'Test content',
                recipients: ['all']
            }
        }
    ]
};

// Test runner
async function runTests() {
    try {
        log.header('Starting Admin Dashboard API Tests');

        // Login to get admin token
        log.info('Authenticating admin user...');
        const authResponse = await axios.post(`${BASE_URL}/auth/login`, config.auth);
        adminToken = authResponse.data.token;
        log.success('Admin authentication successful');

        // Headers for authenticated requests
        const headers = {
            Authorization: `Bearer ${adminToken}`
        };

        // Test each category of endpoints
        for (const [category, endpointList] of Object.entries(endpoints)) {
            log.header(`Testing ${category.toUpperCase()} Endpoints`);

            for (const endpoint of endpointList) {
                try {
                    const startTime = Date.now();
                    const response = await axios({
                        method: endpoint.method,
                        url: `${BASE_URL}${endpoint.path}`,
                        headers,
                        data: endpoint.data
                    });

                    const duration = Date.now() - startTime;
                    log.success(`${endpoint.name} (${duration}ms)`);

                    // Log response data for debugging
                    if (process.env.DEBUG) {
                        console.log(JSON.stringify(response.data, null, 2));
                    }
                } catch (error) {
                    log.error(`${endpoint.name} - ${error.message}`);
                    if (process.env.DEBUG) {
                        console.error(error.response?.data || error);
                    }
                }
            }
        }

        log.header('Test Summary');
        log.info('Total endpoints tested: ' + Object.values(endpoints).flat().length);

    } catch (error) {
        log.error('Test execution failed:');
        console.error(error);
    }
}

// Add command line arguments handling
const args = process.argv.slice(2);
if (args.includes('--debug')) {
    process.env.DEBUG = 'true';
}

// Run tests
runTests(); 