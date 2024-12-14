const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { expect } = chai;

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = 5001; // Use a different port for testing

const app = require('../server');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Horse = require('../models/Horse');
const Transaction = require('../models/Transaction');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

chai.use(chaiHttp);

// Test data
let testData = {
    buyer: null,
    seller: null,
    admin: null,
    buyerToken: null,
    sellerToken: null,
    adminToken: null,
    horse: null,
    inquiry: null,
    conversation: null,
    review: null,
    transaction: null
};

describe('Complete System Test Suite', () => {
    before(async function() {
        this.timeout(30000); // Increase timeout for setup
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await Promise.all([
            User.deleteMany({}),
            Seller.deleteMany({}),
            Horse.deleteMany({}),
            Transaction.deleteMany({}),
            Inquiry.deleteMany({}),
            Review.deleteMany({}),
            Message.deleteMany({}),
            Conversation.deleteMany({})
        ]);
    });

    after(async function() {
        this.timeout(30000); // Increase timeout for cleanup
        await mongoose.connection.close();
    });

    describe('1. Authentication & User Management', () => {
        it('should register a buyer', async () => {
            const res = await chai.request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test Buyer',
                    email: 'buyer@test.com',
                    password: 'test123',
                    role: 'user',
                    phone: '1234567890',
                    location: {
                        state: 'Maharashtra',
                        city: 'Mumbai',
                        pincode: '400001'
                    }
                });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('token');
            testData.buyerToken = res.body.token;
            testData.buyer = res.body.user;
        });

        it('should register a seller', async () => {
            const res = await chai.request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test Seller',
                    email: 'seller@test.com',
                    password: 'test123',
                    role: 'seller',
                    phone: '9876543210',
                    location: {
                        state: 'Karnataka',
                        city: 'Bangalore',
                        pincode: '560001'
                    }
                });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('token');
            testData.sellerToken = res.body.token;
            testData.seller = res.body.user;
        });

        it('should register an admin', async () => {
            const res = await chai.request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test Admin',
                    email: 'admin@test.com',
                    password: 'test123',
                    role: 'admin'
                });

            expect(res).to.have.status(201);
            expect(res.body).to.have.property('token');
            testData.adminToken = res.body.token;
            testData.admin = res.body.user;
        });

        it('should login users', async () => {
            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: 'buyer@test.com',
                    password: 'test123'
                });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('token');
        });

        it('should get user profile', async () => {
            const res = await chai.request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${testData.buyerToken}`);

            expect(res).to.have.status(200);
            expect(res.body.user.email).to.equal('buyer@test.com');
        });
    });

    describe('2. Seller Profile & Verification', () => {
        it('should create seller profile', async () => {
            const res = await chai.request(app)
                .post('/api/sellers/profile')
                .set('Authorization', `Bearer ${testData.sellerToken}`)
                .send({
                    businessName: 'Test Stables',
                    description: 'Premium horse seller',
                    contactDetails: {
                        phone: '9876543210',
                        email: 'contact@teststables.com',
                        whatsapp: '9876543210'
                    },
                    location: {
                        state: 'Maharashtra',
                        city: 'Mumbai',
                        pincode: '400001'
                    },
                    businessType: 'breeder',
                    experience: 5,
                    specializations: ['Arabian', 'Thoroughbred'],
                    businessDocuments: {
                        gst: 'GSTIN123456',
                        pan: 'PANAB1234C'
                    }
                });

            expect(res).to.have.status(201);
            expect(res.body.success).to.be.true;
            expect(res.body.seller.businessName).to.equal('Test Stables');
            
            // Store seller ID for later use
            testData.seller = res.body.seller;
        });

        it('should submit verification documents', async () => {
            const res = await chai.request(app)
                .post('/api/verification/submit')
                .set('Authorization', `Bearer ${testData.sellerToken}`)
                .send({
                    documents: [
                        {
                            type: 'gst',
                            url: 'https://example.com/gst.pdf',
                            public_id: 'gst_123'
                        },
                        {
                            type: 'pan',
                            url: 'https://example.com/pan.pdf',
                            public_id: 'pan_123'
                        }
                    ]
                });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
        });

        it('should verify seller (admin)', async () => {
            const seller = await Seller.findOne();
            const res = await chai.request(app)
                .put(`/api/verification/sellers/${seller._id}/verification`)
                .set('Authorization', `Bearer ${testData.adminToken}`)
                .send({
                    status: 'approved',
                    remarks: 'All documents verified'
                });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.seller.verificationStatus).to.equal('approved');
        });
    });

    describe('3. Subscription Management', () => {
        it('should create subscription payment', async () => {
            const res = await chai.request(app)
                .post('/api/payments/create')
                .set('Authorization', `Bearer ${testData.sellerToken}`)
                .send({
                    amount: 9999,
                    currency: 'INR',
                    notes: {
                        type: 'subscription',
                        package: 'Royal Stallion',
                        duration: 12
                    }
                });

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('order');
            testData.transaction = res.body.transaction;
        });

        it('should verify subscription payment', async () => {
            const res = await chai.request(app)
                .post('/api/payments/verify')
                .set('Authorization', `Bearer ${testData.sellerToken}`)
                .send({
                    razorpay_payment_id: 'pay_' + Date.now(),
                    razorpay_order_id: testData.transaction.razorpayOrderId,
                    razorpay_signature: 'valid_signature'
                });

            expect(res).to.have.status(200);
            expect(res.body.transaction.status).to.equal('completed');
        });

        it('should update subscription package', async () => {
            const res = await chai.request(app)
                .put('/api/sellers/subscription')
                .set('Authorization', `Bearer ${testData.sellerToken}`)
                .send({
                    subscriptionPackage: 'Royal Stallion'
                });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.subscription.package).to.equal('Royal Stallion');
        });

        it('should reject invalid subscription package', async () => {
            const res = await chai.request(app)
                .put('/api/sellers/subscription')
                .set('Authorization', `Bearer ${testData.sellerToken}`)
                .send({
                    subscriptionPackage: 'Invalid Package'
                });

            expect(res).to.have.status(400);
            expect(res.body.success).to.be.false;
        });
    });

    describe('4. Horse Listing Management', () => {
        it('should upload photos', async () => {
            const res = await chai.request(app)
                .post('/api/photos/upload')
                .set('Authorization', `Bearer ${testData.sellerToken}`)
                .send({
                    photos: [
                        {
                            url: 'https://example.com/horse1.jpg',
                            public_id: 'horse1',
                            thumbnail_url: 'https://example.com/horse1_thumb.jpg'
                        }
                    ]
                });

            expect(res).to.have.status(200);
            expect(res.body.photos).to.be.an('array');
        });

        it('should create horse listing', async () => {
            const res = await chai.request(app)
                .post('/api/horses')
                .set('Authorization', `Bearer ${testData.sellerToken}`)
                .send({
                    name: 'Thunder',
                    breed: 'Thoroughbred',
                    age: { years: 5, months: 3 },
                    gender: 'Stallion',
                    color: 'Bay',
                    price: 500000,
                    description: 'Champion racehorse with excellent bloodline',
                    location: {
                        state: 'Karnataka',
                        city: 'Bangalore',
                        pincode: '560001'
                    },
                    specifications: {
                        training: 'Advanced',
                        discipline: ['Racing', 'Dressage'],
                        temperament: 'Calm',
                        healthStatus: 'Excellent',
                        vaccination: true,
                        papers: true
                    }
                });

            expect(res).to.have.status(201);
            expect(res.body.success).to.be.true;
            testData.horse = res.body.horse;
        });

        it('should boost listing visibility', async () => {
            const res = await chai.request(app)
                .post(`/api/visibility/spotlight/${testData.horse._id}`)
                .set('Authorization', `Bearer ${testData.sellerToken}`)
                .send({
                    duration: 30 // days
                });

            expect(res).to.have.status(200);
            expect(res.body.horse.boost.active).to.be.true;
        });
    });

    describe('5. Buyer Interaction', () => {
        it('should search horses', async () => {
            const res = await chai.request(app)
                .post('/api/search')
                .send({
                    filters: {
                        breed: 'Thoroughbred',
                        priceRange: { min: 400000, max: 600000 },
                        location: { state: 'Karnataka' }
                    },
                    page: 1,
                    limit: 10
                });

            expect(res).to.have.status(200);
            expect(res.body.data.horses).to.be.an('array');
        });

        it('should get recommendations', async () => {
            const res = await chai.request(app)
                .get('/api/recommendations/personalized')
                .set('Authorization', `Bearer ${testData.buyerToken}`);

            expect(res).to.have.status(200);
            expect(res.body.recommendations).to.be.an('array');
        });

        it('should create inquiry', async () => {
            const res = await chai.request(app)
                .post('/api/inquiries')
                .set('Authorization', `Bearer ${testData.buyerToken}`)
                .send({
                    horse: testData.horse._id,
                    message: 'Interested in viewing this horse',
                    contactPreference: 'email'
                });

            expect(res).to.have.status(201);
            testData.inquiry = res.body.inquiry;
        });

        it('should respond to inquiry', async () => {
            const res = await chai.request(app)
                .post(`/api/inquiries/${testData.inquiry._id}/respond`)
                .set('Authorization', `Bearer ${testData.sellerToken}`)
                .send({
                    message: 'Thank you for your interest. When would you like to visit?'
                });

            expect(res).to.have.status(200);
            expect(res.body.inquiry.status).to.equal('responded');
        });
    });

    describe('6. Messaging System', () => {
        it('should start conversation', async () => {
            const res = await chai.request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${testData.buyerToken}`)
                .send({
                    recipientId: testData.seller._id,
                    entityType: 'horse',
                    entityId: testData.horse._id
                });

            expect(res).to.have.status(201);
            testData.conversation = res.body.conversation;
        });

        it('should send message', async () => {
            const res = await chai.request(app)
                .post('/api/messaging/messages')
                .set('Authorization', `Bearer ${testData.buyerToken}`)
                .send({
                    conversationId: testData.conversation._id,
                    content: 'Is the horse still available?'
                });

            expect(res).to.have.status(201);
            expect(res.body.message.content).to.equal('Is the horse still available?');
        });
    });

    describe('7. Review System', () => {
        it('should create review', async () => {
            const res = await chai.request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${testData.buyerToken}`)
                .send({
                    entityType: 'horse',
                    entityId: testData.horse._id,
                    rating: {
                        overall: 5,
                        aspects: {
                            communication: 5,
                            accuracy: 4,
                            value: 5,
                            experience: 5
                        }
                    },
                    content: {
                        title: 'Excellent Horse',
                        description: 'Exactly as described. Very satisfied with the purchase.',
                        pros: ['Well trained', 'Good temperament'],
                        cons: ['None']
                    }
                });

            expect(res).to.have.status(201);
            testData.review = res.body.review;
        });

        it('should moderate review', async () => {
            const res = await chai.request(app)
                .put(`/api/reviews/${testData.review._id}/moderate`)
                .set('Authorization', `Bearer ${testData.adminToken}`)
                .send({
                    status: 'approved',
                    reason: 'Meets community guidelines'
                });

            expect(res).to.have.status(200);
            expect(res.body.review.status).to.equal('approved');
        });
    });

    describe('8. Analytics & Reporting', () => {
        it('should get seller dashboard stats', async () => {
            const res = await chai.request(app)
                .get('/api/seller/dashboard/stats')
                .set('Authorization', `Bearer ${testData.sellerToken}`);

            expect(res).to.have.status(200);
            expect(res.body.dashboard).to.have.property('listings');
            expect(res.body.dashboard).to.have.property('inquiries');
            expect(res.body.dashboard).to.have.property('transactions');
        });

        it('should get listing performance', async () => {
            const res = await chai.request(app)
                .get(`/api/analytics/listings/${testData.horse._id}`)
                .set('Authorization', `Bearer ${testData.sellerToken}`);

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property('metrics');
        });

        it('should get buyer engagement analytics', async () => {
            const res = await chai.request(app)
                .get('/api/analytics/engagement')
                .set('Authorization', `Bearer ${testData.sellerToken}`);

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property('buyerMetrics');
        });
    });

    describe('9. Admin Operations', () => {
        it('should get platform stats', async () => {
            const res = await chai.request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${testData.adminToken}`);

            expect(res).to.have.status(200);
            expect(res.body.stats).to.have.property('users');
            expect(res.body.stats).to.have.property('horses');
            expect(res.body.stats).to.have.property('transactions');
        });

        it('should get all transactions', async () => {
            const res = await chai.request(app)
                .get('/api/admin/transactions')
                .set('Authorization', `Bearer ${testData.adminToken}`);

            expect(res).to.have.status(200);
            expect(res.body.transactions).to.be.an('array');
        });
    });

    describe('10. Support System', () => {
        it('should create support ticket', async () => {
            const res = await chai.request(app)
                .post('/api/support/tickets')
                .set('Authorization', `Bearer ${testData.buyerToken}`)
                .send({
                    subject: 'Payment Issue',
                    category: 'payment',
                    priority: 'high',
                    description: 'Unable to complete payment transaction'
                });

            expect(res).to.have.status(201);
            expect(res.body.ticket).to.have.property('ticketNumber');
        });

        it('should update ticket status', async () => {
            const res = await chai.request(app)
                .put(`/api/support/tickets/${res.body.ticket._id}`)
                .set('Authorization', `Bearer ${testData.adminToken}`)
                .send({
                    status: 'in_progress',
                    message: 'We are looking into this issue'
                });

            expect(res).to.have.status(200);
            expect(res.body.ticket.status).to.equal('in_progress');
        });
    });
}); 