const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/server');
const { expect } = chai;
const {
    createTestUser,
    createTestSeller,
    createTestHorse,
    createTestInquiry,
    cleanupTestData
} = require('./test.utils');

chai.use(chaiHttp);

describe('Buyer Interaction Features', () => {
    let testUser, testToken, testSeller, testHorse, testInquiry;

    before(async () => {
        // Create test data
        testUser = await createTestUser('buyer@test.com');
        testToken = testUser.generateAuthToken();
        testSeller = await createTestSeller();
        testHorse = await createTestHorse(testSeller._id);
        testInquiry = await createTestInquiry(testUser._id, testHorse._id);
    });

    after(async () => {
        await cleanupTestData();
    });

    describe('Buyer Verification', () => {
        it('should verify buyer with basic level', async () => {
            const res = await chai.request(app)
                .post('/api/buyer/verify')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    level: 'basic',
                    documents: [
                        { type: 'email', value: 'buyer@test.com' },
                        { type: 'phone', value: '+1234567890' }
                    ]
                });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.verification.level).to.equal('basic');
            expect(res.body.verification.status).to.equal('verified');
        });

        it('should reject verification with missing documents', async () => {
            const res = await chai.request(app)
                .post('/api/buyer/verify')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    level: 'verified',
                    documents: [
                        { type: 'email', value: 'buyer@test.com' }
                    ]
                });

            expect(res).to.have.status(400);
            expect(res.body.success).to.be.false;
            expect(res.body.message).to.include('Missing required documents');
        });
    });

    describe('Contact Access', () => {
        it('should grant contact access to verified buyer', async () => {
            const res = await chai.request(app)
                .post(`/api/buyer/contact-access/${testSeller._id}`)
                .set('Authorization', `Bearer ${testToken}`);

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.contactInfo).to.exist;
        });

        it('should reject unverified buyer contact access request', async () => {
            const unverifiedUser = await createTestUser('unverified@test.com');
            const unverifiedToken = unverifiedUser.generateAuthToken();

            const res = await chai.request(app)
                .post(`/api/buyer/contact-access/${testSeller._id}`)
                .set('Authorization', `Bearer ${unverifiedToken}`);

            expect(res).to.have.status(403);
            expect(res.body.success).to.be.false;
        });
    });

    describe('Activity Tracking', () => {
        it('should track buyer viewing activity', async () => {
            const res = await chai.request(app)
                .post(`/api/buyer/activity/${testHorse._id}`)
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    action: 'VIEW_LISTING',
                    details: {
                        duration: 300,
                        sections: ['photos', 'description']
                    }
                });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.activity).to.exist;
        });

        it('should update user interests on view', async () => {
            const res = await chai.request(app)
                .post(`/api/buyer/activity/${testHorse._id}`)
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    action: 'VIEW_LISTING',
                    details: { duration: 180 }
                });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;

            // Verify user interests were updated
            const updatedUser = await chai.request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${testToken}`);

            expect(updatedUser.body.interests).to.include(testHorse.breed);
        });
    });

    describe('Inquiry Quality Scoring', () => {
        it('should allow seller to score inquiry quality', async () => {
            const sellerToken = testSeller.user.generateAuthToken();

            const res = await chai.request(app)
                .post(`/api/buyer/score-inquiry/${testInquiry._id}`)
                .set('Authorization', `Bearer ${sellerToken}`);

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.score.total).to.be.a('number');
            expect(res.body.score.breakdown).to.exist;
        });

        it('should reject unauthorized inquiry scoring', async () => {
            const unauthorizedUser = await createTestUser('unauthorized@test.com');
            const unauthorizedToken = unauthorizedUser.generateAuthToken();

            const res = await chai.request(app)
                .post(`/api/buyer/score-inquiry/${testInquiry._id}`)
                .set('Authorization', `Bearer ${unauthorizedToken}`);

            expect(res).to.have.status(403);
            expect(res.body.success).to.be.false;
        });
    });
}); 