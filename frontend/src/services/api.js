import axios from 'axios';

// Base URL configuration
const API_BASE_URL = 'https://gallopgears.onrender.com/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable sending cookies with requests
    timeout: 30000, // Increase timeout to 30 seconds
});

// Keep track of refresh token attempts
let isRefreshing = false;
let failedQueue = [];

// Add at the top of the file, after imports
let lastTokenCheck = 0;
const TOKEN_CHECK_INTERVAL = 10000; // 10 seconds in milliseconds
let isTokenValid = false; // Track if token is valid

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling auth errors and token expiration
apiClient.interceptors.response.use(
    (response) => {
        // If we get a successful response, mark the token as valid
        if (response.config.url === endpoints.sellers.profile || response.config.url === endpoints.users.profile) {
            isTokenValid = true;
            lastTokenCheck = Date.now();
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle connection errors
        if (!error.response) {
            console.error('Network Error:', error.message);
            throw new Error('Unable to connect to server. Please check your internet connection and ensure the backend server is running.');
        }

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                try {
                    const token = await new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                } catch (err) {
                    return Promise.reject(err);
                }
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Check if we have a recent valid token check
                const currentTime = Date.now();
                if (isTokenValid && currentTime - lastTokenCheck < TOKEN_CHECK_INTERVAL) {
                    // Token was recently validated, just retry the request
                    const token = localStorage.getItem('token');
                    if (!token) {
                        throw new Error('No token available');
                    }
                    processQueue(null, token);
                    return apiClient(originalRequest);
                }

                // Token needs validation
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token available');
                }

                // Try to validate token using the appropriate endpoint based on the original request
                const validationEndpoint = originalRequest.url.includes('/sellers/') ?
                    endpoints.sellers.profile : endpoints.users.profile;

                const response = await apiClient.get(validationEndpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                    _retry: true // Mark this request to prevent infinite loop
                });

                if (response.data) {
                    // Token is valid
                    isTokenValid = true;
                    lastTokenCheck = currentTime;
                    processQueue(null, token);
                    return apiClient(originalRequest);
                } else {
                    throw new Error('Token validation failed');
                }
            } catch (refreshError) {
                // If refresh fails, clear token and queue
                localStorage.removeItem('token');
                isTokenValid = false;
                processQueue(refreshError, null);
                window.dispatchEvent(new Event('auth-error'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle 403 Forbidden errors (role-based access)
        if (error.response?.status === 403) {
            // If it's a seller subscription error, handle specially
            if (error.response.data?.message?.includes('subscription')) {
                window.dispatchEvent(new CustomEvent('subscription-error', {
                    detail: error.response.data
                }));
            }
        }

        return Promise.reject(error);
    }
);

// API endpoints
export const endpoints = {
    // Auth endpoints
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        verify: '/auth/verify',
        me: '/auth/me',
    },
    // Horse endpoints
    horses: {
        featured: '/horses/featured',
        categories: '/horses/categories',
        search: '/horses/search',
        priceRanges: '/horses/price-ranges',
        details: (id) => `/horses/${id}`,
        create: '/horses',
        update: (id) => `/horses/${id}`,
        delete: (id) => `/horses/${id}`,
        uploadPhotos: (id) => `/horses/${id}/photos`,
        favorite: (id) => `/horses/${id}/favorite`
    },
    // User endpoints
    users: {
        profile: '/users/profile',
        favorites: '/users/favorites',
        alerts: '/users/alerts',
        notifications: '/users/notifications',
    },
    // Seller endpoints
    sellers: {
        profile: '/sellers/me',
        createprofile: '/sellers/profile',
        subscribe: '/sellers/subscribe',
        createSubscriptionOrder: '/sellers/subscribe/create-order',
        verifySubscriptionPayment: '/sellers/subscribe/verify-payment',
        listings: '/sellers/listings',
        stats: '/sellers/analytics',
        reviews: '/sellers/reviews',
        plans: '/sellers/plans',
        bankDetails: '/sellers/bank-details',
        payments: '/sellers/payments',
        inquiries: '/sellers/inquiries',
        subscription: '/sellers/subscription',
        listing: (id) => `/sellers/listings/${id}`,
        performance: '/sellers/dashboard/performance',
        listingAnalytics: '/sellers/dashboard/analytics/listings',
        inquiryAnalytics: '/sellers/dashboard/analytics/inquiries',
        dashboardStats: '/seller/dashboard/stats',
        recentActivities: '/sellers/dashboard/activities',
        dashboardPerformance: '/seller/dashboard/performance',
        dashboardStats: '/seller/dashboard/stats',
        listingAnalytics: '/seller/dashboard/analytics/listings',
        inquiryAnalytics: '/seller/dashboard/analytics/inquiries',
    },
    // Inquiry endpoints
    inquiries: {
        create: '/inquiries',
        list: '/inquiries/buyer',
        details: (id) => `/inquiries/${id}`
    },
    // Support endpoints
    support: {
        tickets: '/support/tickets',
        faqs: '/support/faqs'
    },
    // Home page endpoints
    home: {
        data: '/home'
    },
    // Photo endpoints
    photos: {
        upload: (horseId) => `/photos/upload/${horseId}`,
        delete: (horseId, photoId) => `/photos/${horseId}/${photoId}`,
        reorder: (horseId) => `/photos/${horseId}/reorder`
    },
    // Transaction endpoints
    transactions: {
        seller: '/transactions/seller',
        getById: (id) => `/transactions/${id}`,
        create: '/transactions',
        updateStatus: (id) => `/transactions/${id}/status`
    },
    // Admin endpoints
    admin: {
        users: {
            getAll: '/admin/users',
            getById: (id) => `/admin/users/${id}`,
            update: (id) => `/admin/users/${id}`,
            delete: (id) => `/admin/users/${id}`,
            block: (id) => `/admin/users/${id}/block`,
            unblock: (id) => `/admin/users/${id}/block/unblock`,
            updateRole: (id) => `/admin/users/${id}/role`,
            getActivity: (id) => `/admin/users/${id}/activity`,
            deleteSeller: (id) => `/admin/sellers/${id}`,
        },
        sellers: {
            getDetails: (id) => `/admin/sellers/${id}`,
            getListings: (id) => `/admin/sellers/${id}/listings`,
            getTransactions: (id) => `/admin/sellers/${id}/transactions`,
            getActivity: (id) => `/admin/sellers/${id}/activity`,
            getCommunications: (id) => `/admin/sellers/${id}/communications`,
            updateProfile: (id) => `/admin/sellers/${id}`,
            approve: (id) => `/admin/sellers/${id}/approve`,
            reject: (id) => `/admin/sellers/${id}/reject`,
            suspend: (id) => `/admin/sellers/${id}/suspend`,
            unsuspend: (id) => `/admin/sellers/${id}/unsuspend`,
            updateVerification: (id) => `/admin/sellers/${id}/verification`,
        },
        listings: {
            getPending: '/admin/listings/pending',
            getReported: '/admin/listings/reported',
            getFeatured: '/admin/listings/featured',
            getExpired: '/admin/listings/expired',
            getDraft: '/admin/listings/draft',
            verify: (id) => `/admin/listings/${id}/verify`,
            delete: (id) => `/admin/listings/${id}`,
            updateFeatured: (id) => `/admin/listings/${id}/featured`,
            handleReport: (id) => `/admin/listings/${id}/report`,
            extend: (id) => `/admin/listings/${id}/extend`,
        },
        dashboard: {
            getStats: '/admin/dashboard/stats',
            getActivities: '/admin/dashboard/activities',
            getRecentActivities: '/admin/dashboard/activities/recent',
            getPerformanceMetrics: '/admin/dashboard/performance',
        },
        reports: {
            getAll: (params) => `/admin/reports?${new URLSearchParams(params)}`,
            get: (id) => `/admin/reports/${id}`,
            update: (id) => `/admin/reports/${id}`,
            delete: (id) => `/admin/reports/${id}`,
        },
        transactions: {
            getAll: '/admin/transactions',
            getById: (id) => `/admin/transactions/${id}`,
            updateStatus: (id) => `/admin/transactions/${id}/status`,
            export: '/admin/transactions/export'
        },
    },
};

// Helper function to handle API responses
const handleResponse = (response) => {
    if (response.data.success === false) {
        throw new Error(response.data.message || 'API Error');
    }
    return response;
};

// Helper function to handle API errors
const handleError = (error) => {
    if (error.response) {
        // Server responded with error
        console.error('Server Error Details:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
        });
        
        if (error.response.status === 401) {
            throw new Error('Invalid email or password. Please try again.');
        }
        if (error.response.status === 400) {
            throw new Error(`Validation Error: ${error.response.data.message || 'Invalid request data'}`);
        }
        throw new Error(error.response.data.message || 'Server Error');
    } else if (error.request) {
        // Request made but no response
        console.error('Network Error:', error);
        throw new Error('Unable to connect to server. Please check your internet connection and ensure the backend server is running.');
    } else {
        // Request setup error
        throw new Error('Request failed');
    }
};

// API service functions
export const api = {
    // Auth services
    auth: {
        register: async (data) => {
            try {
                console.log('Registering user with data:', JSON.stringify(data, null, 2));
                const response = await apiClient.post(endpoints.auth.register, data);
                console.log('Registration response:', response.data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        login: async (data) => {
            try {
                const response = await apiClient.post(endpoints.auth.login, data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        verify: async () => {
            try {
                const response = await apiClient.get(endpoints.auth.verify);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getProfile: async () => {
            try {
                const response = await apiClient.get(endpoints.auth.me);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
    },
    // Horse services
    horses: {
        getFeatured: async () => {
            try {
                const response = await apiClient.get(endpoints.horses.featured);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getCategories: async () => {
            try {
                const response = await apiClient.get(endpoints.horses.categories);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        search: async (params) => {
            try {
                const response = await apiClient.get(endpoints.horses.search, { params });
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getPriceRanges: async () => {
            try {
                const response = await apiClient.get(endpoints.horses.priceRanges);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getDetails: async (id) => {
            try {
                const response = await apiClient.get(endpoints.horses.details(id));
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        create: async (data) => {
            try {
                const response = await apiClient.post(endpoints.horses.create, data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        update: async (id, data) => {
            try {
                const response = await apiClient.put(endpoints.horses.update(id), data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        delete: async (id) => {
            try {
                const response = await apiClient.delete(endpoints.horses.delete(id));
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        uploadPhotos: async (id, formData) => {
            try {
                const response = await apiClient.post(endpoints.horses.uploadPhotos(id), formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getAll: async () => {
            try {
                const response = await apiClient.get(endpoints.horses.create); // Using the base horses endpoint
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        addToFavorites: async (id) => {
            try {
                const response = await apiClient.post(endpoints.horses.favorite(id));
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        removeFromFavorites: async (id) => {
            try {
                const response = await apiClient.delete(endpoints.horses.favorite(id));
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        }
    },
    // User services
    users: {
        getProfile: async () => {
            try {
                const response = await apiClient.get(endpoints.users.profile);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        updateProfile: async (data) => {
            try {
                const response = await apiClient.put(endpoints.users.profile, data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getFavorites: async () => {
            try {
                const response = await apiClient.get(endpoints.users.favorites);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        updateAlerts: async (data) => {
            try {
                const response = await apiClient.put(endpoints.users.alerts, data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getNotifications: async () => {
            try {
                const response = await apiClient.get(endpoints.users.notifications);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
    },
    // Seller services
    sellers: {
        createProfile: async (data) => {
            try {
                console.log('Creating seller profile with data:', data);

                // Send data directly as JSON
                const response = await apiClient.post(endpoints.sellers.createprofile, data, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Server response:', response.data);
                return handleResponse(response);
            } catch (error) {
                console.error('Error creating seller profile:', error);
                handleError(error);
            }
        },
        updateProfile: async (data) => {
            try {
                // Check if we need to send as multipart/form-data
                const hasFiles = data.businessDocuments && Object.values(data.businessDocuments).some(file => file instanceof File);

                let requestData;
                let headers = {};

                if (hasFiles) {
                    // If we have files, use FormData
                    requestData = new FormData();

                    // Add basic profile data
                    Object.keys(data).forEach(key => {
                        if (key === 'businessDocuments') {
                            Object.keys(data.businessDocuments).forEach(docKey => {
                                if (data.businessDocuments[docKey]) {
                                    requestData.append(`businessDocuments[${docKey}]`, data.businessDocuments[docKey]);
                                }
                            });
                        } else if (typeof data[key] === 'object') {
                            requestData.append(key, JSON.stringify(data[key]));
                        } else {
                            requestData.append(key, data[key]);
                        }
                    });

                    headers['Content-Type'] = 'multipart/form-data';
                } else {
                    // If no files, send as JSON
                    requestData = data;
                    headers['Content-Type'] = 'application/json';
                }

                const response = await apiClient.put(endpoints.sellers.profile, requestData, { headers });
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getProfile: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.profile);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getPlans: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.plans);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        subscribe: async (data) => {
            try {
                const response = await apiClient.post(endpoints.sellers.subscribe, {
                    package: data.package,
                    duration: data.duration || 30 // Default to 30 days if not specified
                });
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getListings: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.listings);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        createListing: async (data) => {
            try {
                const formData = new FormData();

                // Add listing data
                Object.keys(data).forEach(key => {
                    if (key === 'images') {
                        data.images.forEach((image, index) => {
                            formData.append(`images[${index}]`, image);
                        });
                    } else if (typeof data[key] === 'object') {
                        formData.append(key, JSON.stringify(data[key]));
                    } else {
                        formData.append(key, data[key]);
                    }
                });

                // Set default status to draft if not specified
                if (!data.listingStatus) {
                    formData.append('listingStatus', 'draft');
                }

                const response = await apiClient.post(endpoints.sellers.listings, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        updateListing: async (id, data) => {
            try {
                const formData = new FormData();

                Object.keys(data).forEach(key => {
                    if (key === 'images') {
                        data.images.forEach((image, index) => {
                            formData.append(`images[${index}]`, image);
                        });
                    } else if (typeof data[key] === 'object') {
                        formData.append(key, JSON.stringify(data[key]));
                    } else {
                        formData.append(key, data[key]);
                    }
                });

                const response = await apiClient.put(endpoints.sellers.listing(id), formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        deleteListing: async (id) => {
            try {
                const response = await apiClient.delete(endpoints.sellers.listing(id));
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getStats: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.stats);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getReviews: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.reviews);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        updateBankDetails: async (data) => {
            try {
                const response = await apiClient.put(endpoints.sellers.bankDetails, data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getPaymentHistory: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.payments);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getInquiries: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.inquiries);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getSubscription: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.subscription);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        updateSubscription: async (data) => {
            try {
                const response = await apiClient.put(endpoints.sellers.subscription, data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        cancelSubscription: async () => {
            try {
                const response = await apiClient.delete(endpoints.sellers.subscription);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getPerformanceMetrics: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.performance);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getListingAnalytics: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.listingAnalytics);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getInquiryAnalytics: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.inquiryAnalytics);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getDashboardStats: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.dashboardStats);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        createSubscriptionOrder: async (data) => {
            try {
                const response = await apiClient.post(endpoints.sellers.createSubscriptionOrder, data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        verifySubscriptionPayment: async (data) => {
            try {
                const response = await apiClient.post(endpoints.sellers.verifySubscriptionPayment, data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        dashboardPerformance: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.dashboardPerformance);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        dashboardStats: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.dashboardStats);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        listingAnalytics: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.listingAnalytics);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        inquiryAnalytics: async () => {
            try {
                const response = await apiClient.get(endpoints.sellers.inquiryAnalytics);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
    },
    // Inquiry services
    inquiries: {
        create: async (data) => {
            try {
                const response = await apiClient.post(endpoints.inquiries.create, data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getList: async () => {
            try {
                const response = await apiClient.get(endpoints.inquiries.list);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getDetails: async (id) => {
            try {
                const response = await apiClient.get(endpoints.inquiries.details(id));
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        reply: async (id, data) => {
            try {
                const response = await apiClient.post(`${endpoints.inquiries.details(id)}/reply`, data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
    },
    // Support services
    support: {
        createTicket: async (data) => {
            try {
                const response = await apiClient.post(endpoints.support.tickets, data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getTickets: async () => {
            try {
                const response = await apiClient.get(endpoints.support.tickets);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getFaqs: async () => {
            try {
                const response = await apiClient.get(endpoints.support.faqs);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
    },
    // Home page services
    home: {
        getData: async () => {
            try {
                console.log('Fetching home page data...');
                const response = await apiClient.get(endpoints.home.data);
                console.log('Home page data response:', response);
                return handleResponse(response);
            } catch (error) {
                console.error('Error fetching home page data:', error);
                handleError(error);
            }
        },
    },
    // Photo services
    photos: {
        upload: async (horseId, data) => {
            try {
                const response = await apiClient.post(endpoints.photos.upload(horseId), data);
                return handleResponse(response);
            } catch (error) {
                throw handleError(error);
            }
        },
        delete: async (horseId, photoId) => {
            try {
                const response = await apiClient.delete(endpoints.photos.delete(horseId, photoId));
                return handleResponse(response);
            } catch (error) {
                throw handleError(error);
            }
        },
        reorder: async (horseId, photoIds) => {
            try {
                const response = await apiClient.put(endpoints.photos.reorder(horseId), { photoIds });
                return handleResponse(response);
            } catch (error) {
                throw handleError(error);
            }
        }
    },
    // Transaction services
    transactions: {
        getSellerTransactions: async () => {
            try {
                const response = await apiClient.get(endpoints.transactions.seller);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        getById: async (id) => {
            try {
                const response = await apiClient.get(endpoints.transactions.getById(id));
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        create: async (data) => {
            try {
                const response = await apiClient.post(endpoints.transactions.create, data);
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
        updateStatus: async (id, status) => {
            try {
                const response = await apiClient.put(endpoints.transactions.updateStatus(id), { status });
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        }
    },
    // Admin services
    admin: {
        users: {
            getAll: async (params) => {
                try {
                    const response = await apiClient.get(endpoints.admin.users.getAll, { params });
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getById: async (id) => {
                try {
                    const response = await apiClient.get(endpoints.admin.users.getById(id));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            update: async (id, data) => {
                try {
                    const response = await apiClient.put(endpoints.admin.users.update(id), data);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            delete: async (id) => {
                try {
                    const response = await apiClient.delete(endpoints.admin.users.delete(id));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            block: async (id) => {
                try {
                    const response = await apiClient.post(endpoints.admin.users.block(id));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            deleteSeller: async (id) => {
                try {
                    const response = await apiClient.delete(endpoints.admin.users.deleteSeller(id));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            unblock: async (id) => {
                try {
                    const response = await apiClient.post(`${endpoints.admin.users.block(id)}/unblock`);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            updateRole: async (id, role) => {
                try {
                    const response = await apiClient.put(endpoints.admin.users.update(id), { role });
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getActivity: async (id) => {
                try {
                    const response = await apiClient.get(`${endpoints.admin.users.getById(id)}/activity`);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            }
        },
        sellers: {
            getDetails: async (id) => {
                try {
                    const response = await apiClient.get(endpoints.admin.sellers.getDetails(id));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getListings: async (id) => {
                try {
                    const response = await apiClient.get(endpoints.admin.sellers.getListings(id));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getTransactions: async (id) => {
                try {
                    const response = await apiClient.get(endpoints.admin.sellers.getTransactions(id));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getActivity: async (id) => {
                try {
                    const response = await apiClient.get(endpoints.admin.sellers.getActivity(id));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getCommunications: async (id) => {
                try {
                    const response = await apiClient.get(endpoints.admin.sellers.getCommunications(id));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            updateProfile: async (id, data) => {
                try {
                    const response = await apiClient.put(endpoints.admin.sellers.updateProfile(id), data);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            approveSeller: async (id) => {
                try {
                    const response = await apiClient.post(`${endpoints.admin.sellers.getDetails(id)}/approve`);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            rejectSeller: async (id, reason) => {
                try {
                    const response = await apiClient.post(`${endpoints.admin.sellers.getDetails(id)}/reject`, { reason });
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            suspendSeller: async (id, reason) => {
                try {
                    const response = await apiClient.post(`${endpoints.admin.sellers.getDetails(id)}/suspend`, { reason });
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            unsuspendSeller: async (id) => {
                try {
                    const response = await apiClient.post(`${endpoints.admin.sellers.getDetails(id)}/unsuspend`);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            updateVerificationStatus: async (id, status) => {
                try {
                    const response = await apiClient.put(`${endpoints.admin.sellers.getDetails(id)}/verification`, { status });
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            }
        },
        listings: {
            getPending: async () => {
                try {
                    const response = await apiClient.get(endpoints.admin.listings.getPending);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getReported: async () => {
                try {
                    const response = await apiClient.get(endpoints.admin.listings.getReported);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getFeatured: async () => {
                try {
                    const response = await apiClient.get(endpoints.admin.listings.getFeatured);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getExpired: async () => {
                try {
                    const response = await apiClient.get(endpoints.admin.listings.getExpired);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getDraft: async () => {
                try {
                    const response = await apiClient.get(endpoints.admin.listings.getDraft);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            verify: async (id, status) => {
            try {
                    const response = await apiClient.put(endpoints.admin.listings.verify(id), { status });
                return handleResponse(response);
            } catch (error) {
                handleError(error);
            }
        },
            delete: async (id) => {
            try {
                    const response = await apiClient.delete(endpoints.admin.listings.delete(id));
                return handleResponse(response);
            } catch (error) {
                handleError(error);
                }
            },
            updateFeaturedStatus: async (id, featured) => {
                try {
                    const response = await apiClient.put(`${endpoints.admin.listings.verify(id)}/featured`, { featured });
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            handleReport: async (id, action, notes) => {
                try {
                    const response = await apiClient.put(`${endpoints.admin.listings.verify(id)}/report`, { action, notes });
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            extendListing: async (id, duration) => {
                try {
                    const response = await apiClient.put(`${endpoints.admin.listings.verify(id)}/extend`, { duration });
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            }
        },
        reports: {
            getAll: async (params) => {
                try {
                    const response = await apiClient.get(endpoints.admin.reports.getAll(params));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            get: async (id) => {
                try {
                    const response = await apiClient.get(endpoints.admin.reports.get(id));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            update: async (id, status, notes) => {
                try {
                    const response = await apiClient.put(endpoints.admin.reports.update(id), { status, notes });
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            delete: async (id) => {
                try {
                    const response = await apiClient.delete(endpoints.admin.reports.delete(id));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
        },
        dashboard: {
            getStats: async () => {
                try {
                    const response = await apiClient.get(endpoints.admin.dashboard.getStats);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getActivities: async () => {
                try {
                    const response = await apiClient.get(endpoints.admin.dashboard.getActivities);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getRecentActivities: async () => {
                try {
                    const response = await apiClient.get(endpoints.admin.dashboard.getRecentActivities);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getPerformanceMetrics: async () => {
                try {
                    const response = await apiClient.get(endpoints.admin.dashboard.getPerformanceMetrics);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            }
        },
        transactions: {
            getAll: async (params) => {
                try {
                    const response = await apiClient.get(endpoints.admin.transactions.getAll, { params });
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            getById: async (id) => {
                try {
                    const response = await apiClient.get(endpoints.admin.transactions.getById(id));
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            updateStatus: async (id, status) => {
                try {
                    const response = await apiClient.put(endpoints.admin.transactions.updateStatus(id), { status });
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            },
            export: async () => {
                try {
                    const response = await apiClient.get(endpoints.admin.transactions.export);
                    return handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
            }
        }
    },
};

export default api; 