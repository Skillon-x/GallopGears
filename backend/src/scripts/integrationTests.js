const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/server');
const { expect } = chai;
const {
    createTestUser,
    createTestSeller,
    createTestHorse,
    cleanupTestData
} = require('./test.utils');

chai.use(chaiHttp);

describe('Complete System Integration Tests', () => {
    let buyer, buyerToken, seller, sellerToken, admin, adminToken;
    let horse, conversation, review, inquiry;

    before(async () => {
        // Create test users
        buyer = await createTestUser('buyer@test.com', 'user');
        buyerToken = buyer.generateAuthToken();
        seller = await createTestSeller();
        sellerToken = seller.user.generateAuthToken();
        admin = await createTestUser('admin@test.com', 'admin');
        adminToken = admin.generateAuthToken();

        // Set buyer preferences
        buyer.preferences = {
            breeds: ['Thoroughbred', 'Arabian'],
            priceRange: { min: 200000, max: 1000000 },
            location: { states: ['Maharashtra', 'Karnataka'] }
        };
        await buyer.save();
    });

    after(async () => {
        await cleanupTestData();
    });

    describe('1. Seller Journey', () => {
        it('should verify seller profile', async () => {
            const res = await chai.request(app)
                .post('/api/verification/submit')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send({
                    documents: [
                        { type: 'identity', url: 'https://example.com/id.jpg' },
                        { type: 'address', url: 'https://example.com/address.jpg' }
                    ]
                });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
        });

        it('should create a horse listing with photos', async () => {
            // First upload photos
            const photoRes = await chai.request(app)
                .post('/api/photos/upload')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send({
                    photos: [
                        {
                            url: 'https://example.com/horse1.jpg',
                            public_id: 'horse1',
                            type: 'main'
                        }
                    ]
                });

            expect(photoRes).to.have.status(200);

            // Create listing
            const listingRes = await chai.request(app)
                .post('/api/horses')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send({
                    name: 'Premium Horse',
                    breed: 'Thoroughbred',
                    age: { years: 5, months: 0 },
                    gender: 'Stallion',
                    price: 500000,
                    location: {
                        state: 'Maharashtra',
                        city: 'Mumbai'
                    },
                    photos: photoRes.body.photos,
                    specifications: {
                        training: 'Advanced',
                        discipline: ['Dressage', 'Show Jumping']
                    }
                });

            expect(listingRes).to.have.status(201);
            horse = listingRes.body.horse;
        });

        it('should boost listing visibility', async () => {
            const res = await chai.request(app)
                .post(`/api/visibility/spotlight/${horse._id}`)
                .set('Authorization', `Bearer ${sellerToken}`);

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
        });
    });

    describe('2. Buyer Journey', () => {
        it('should search and filter horses', async () => {
            const res = await chai.request(app)
                .post('/api/search')
                .send({
                    filters: {
                        breed: 'Thoroughbred',
                        priceRange: { min: 400000, max: 600000 },
                        location: { state: 'Maharashtra' }
                    }
                });

            expect(res).to.have.status(200);
            expect(res.body.data.horses).to.be.an('array');
            expect(res.body.data.horses.length).to.be.greaterThan(0);
        });

        it('should get personalized recommendations', async () => {
            const res = await chai.request(app)
                .get('/api/recommendations/personalized')
                .set('Authorization', `Bearer ${buyerToken}`);

            expect(res).to.have.status(200);
            expect(res.body.recommendations).to.be.an('array');
        });

        it('should create an inquiry', async () => {
            const res = await chai.request(app)
                .post('/api/inquiries')
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({
                    horse: horse._id,
                    message: 'Interested in this horse',
                    contactPreference: 'email'
                });

            expect(res).to.have.status(201);
            inquiry = res.body.inquiry;
        });

        it('should start a conversation', async () => {
            const res = await chai.request(app)
                .post('/api/messaging/conversations')
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({
                    recipientId: seller.user._id,
                    entityType: 'horse',
                    entityId: horse._id
                });

            expect(res).to.have.status(201);
            conversation = res.body.conversation;
        });

        it('should send a message', async () => {
            const res = await chai.request(app)
                .post('/api/messaging/messages')
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({
                    conversationId: conversation._id,
                    content: 'Hello, I am interested in your horse.'
                });

            expect(res).to.have.status(201);
        });
    });

    describe('3. Review and Rating', () => {
        it('should create a review', async () => {
            const res = await chai.request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({
                    entityType: 'horse',
                    entityId: horse._id,
                    rating: {
                        overall: 5,
                        aspects: {
                            communication: 5,
                            accuracy: 4,
                            value: 4
                        }
                    },
                    content: {
                        title: 'Excellent Horse',
                        description: 'Perfect match for what I was looking for.',
                        pros: ['Well trained', 'Good temperament'],
                        cons: ['None']
                    }
                });

            expect(res).to.have.status(201);
            review = res.body.review;
        });

        it('should moderate review', async () => {
            const res = await chai.request(app)
                .put(`/api/reviews/${review._id}/moderate`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'approved',
                    reason: 'Meets guidelines',
                    action: 'approve'
                });

            expect(res).to.have.status(200);
            expect(res.body.review.status).to.equal('approved');
        });
    });

    describe('4. Analytics and Performance', () => {
        it('should get seller dashboard stats', async () => {
            const res = await chai.request(app)
                .get('/api/seller/dashboard/stats')
                .set('Authorization', `Bearer ${sellerToken}`);

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.dashboard).to.exist;
        });

        it('should get listing performance', async () => {
            const res = await chai.request(app)
                .get(`/api/analytics/listings/${horse._id}`)
                .set('Authorization', `Bearer ${sellerToken}`);

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
        });

        it('should get buyer engagement metrics', async () => {
            const res = await chai.request(app)
                .get('/api/analytics/engagement')
                .set('Authorization', `Bearer ${sellerToken}`);

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
        });
    });

    describe('5. Admin Operations', () => {
        it('should get platform stats', async () => {
            const res = await chai.request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res).to.have.status(200);
            expect(res.body.stats).to.exist;
        });

        it('should verify seller', async () => {
            const res = await chai.request(app)
                .put(`/api/admin/sellers/${seller._id}/verification`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'verified',
                    badge: 'Premium Seller'
                });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
        });

        it('should get transaction reports', async () => {
            const res = await chai.request(app)
                .get('/api/admin/transactions')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res).to.have.status(200);
            expect(res.body.transactions).to.be.an('array');
        });
    });
}); 