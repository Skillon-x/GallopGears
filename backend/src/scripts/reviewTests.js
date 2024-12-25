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

describe('Review and Rating System', () => {
    let buyer, buyerToken, seller, sellerToken, horse, admin, adminToken, review;

    before(async () => {
        // Create test data
        buyer = await createTestUser('reviewer@test.com');
        buyerToken = buyer.generateAuthToken();
        seller = await createTestSeller();
        sellerToken = seller.user.generateAuthToken();
        horse = await createTestHorse(seller._id);
        admin = await createTestUser('admin@test.com', 'admin');
        adminToken = admin.generateAuthToken();
    });

    after(async () => {
        await cleanupTestData();
    });

    describe('Review Creation', () => {
        it('should create a new review', async () => {
            const res = await chai.request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({
                    entityType: 'horse',
                    entityId: horse._id,
                    rating: {
                        overall: 4,
                        aspects: {
                            communication: 5,
                            accuracy: 4,
                            value: 4,
                            experience: 4
                        }
                    },
                    content: {
                        title: 'Great Horse',
                        description: 'This horse exceeded my expectations in many ways.',
                        pros: ['Well trained', 'Good temperament'],
                        cons: ['Slightly overpriced']
                    }
                });

            expect(res).to.have.status(201);
            expect(res.body.success).to.be.true;
            expect(res.body.review).to.exist;
            expect(res.body.review.rating.overall).to.equal(4);

            review = res.body.review;
        });

        it('should prevent duplicate reviews', async () => {
            const res = await chai.request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({
                    entityType: 'horse',
                    entityId: horse._id,
                    rating: { overall: 5 },
                    content: {
                        description: 'Another review'
                    }
                });

            expect(res).to.have.status(400);
            expect(res.body.success).to.be.false;
        });
    });

    describe('Review Retrieval', () => {
        it('should get entity reviews with stats', async () => {
            const res = await chai.request(app)
                .get(`/api/reviews/horse/${horse._id}`);

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.reviews).to.be.an('array');
            expect(res.body.data.stats).to.exist;
            expect(res.body.data.stats.averageRating).to.be.a('number');
        });

        it('should filter reviews correctly', async () => {
            const res = await chai.request(app)
                .get(`/api/reviews/horse/${horse._id}`)
                .query({ filter: 'verified' });

            expect(res).to.have.status(200);
            expect(res.body.data.reviews.every(r => r.verified)).to.be.true;
        });
    });

    describe('Review Moderation', () => {
        it('should allow admin to moderate review', async () => {
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

        it('should prevent non-admin moderation', async () => {
            const res = await chai.request(app)
                .put(`/api/reviews/${review._id}/moderate`)
                .set('Authorization', `Bearer ${buyerToken}`)
                .send({
                    status: 'approved',
                    reason: 'Looks good',
                    action: 'approve'
                });

            expect(res).to.have.status(403);
        });
    });

    describe('Review Interaction', () => {
        it('should allow voting on review helpfulness', async () => {
            const res = await chai.request(app)
                .post(`/api/reviews/${review._id}/vote`)
                .set('Authorization', `Bearer ${sellerToken}`)
                .send({ helpful: true });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
        });

        it('should allow reporting inappropriate reviews', async () => {
            const res = await chai.request(app)
                .post(`/api/reviews/${review._id}/report`)
                .set('Authorization', `Bearer ${sellerToken}`)
                .send({
                    reason: 'Inappropriate content',
                    details: 'Contains misleading information'
                });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
        });
    });
}); 