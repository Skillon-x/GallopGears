// Vite environment variables configuration
const config = {
    razorpay: {
        keyId: import.meta.env.VITE_RAZORPAY_KEY_ID ,
        keySecret: import.meta.env.VITE_RAZORPAY_KEY_SECRET
    },
    api: {
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    }
};

export default config; 