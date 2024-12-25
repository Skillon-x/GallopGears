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

describe('Search and Filter Features', () => {
    let testUser, testToken, testSeller, testHorses = [];

    before(async () => {
        // Create test data
        testUser = await createTestUser('searcher@test.com');
        testToken = testUser.generateAuthToken();
        testSeller = await createTestSeller();

        // Create multiple test horses with different attributes
        const horseData = [
            {
                name: 'Premium Stallion',
                breed: 'Thoroughbred',
                gender: 'Stallion',
                price: 1000000,
                age: { years: 5, months: 0 },
                location: { state: 'Maharashtra', city: 'Mumbai' }
            },
            {
                name: 'Budget Mare',
                breed: 'Arabian',
                gender: 'Mare',
                price: 200000,
                age: { years: 3, months: 6 },
                location: { state: 'Karnataka', city: 'Bangalore' }
            },
            {
                name: 'Show Horse',
                breed: 'Hanoverian',
                gender: 'Gelding',
                price: 500000,
                age: { years: 7, months: 0 },
                location: { state: 'Delhi', city: 'New Delhi' }
            }
        ];

        for (const data of horseData) {
            const horse = await createTestHorse(testSeller._id, data);
            testHorses.push(horse);
        }
    });

    after(async () => {
        await cleanupTestData();
    });

    describe('Advanced Search', () => {
        it('should search horses with multiple filters', async () => {
            const res = await chai.request(app)
                .post('/api/search')
                .send({
                    filters: {
                        price: { min: 100000, max: 600000 },
                        gender: ['Mare', 'Gelding'],
                        location: { state: 'Karnataka' }
                    }
                });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.horses).to.be.an('array');
            expect(res.body.data.horses.length).to.be.greaterThan(0);
            expect(res.body.data.pagination).to.exist;
        });

        it('should handle pagination correctly', async () => {
            const res = await chai.request(app)
                .post('/api/search')
                .send({
                    filters: {},
                    page: 1,
                    limit: 2
                });

            expect(res).to.have.status(200);
            expect(res.body.data.horses.length).to.be.at.most(2);
            expect(res.body.data.pagination.hasMore).to.exist;
        });

        it('should sort results correctly', async () => {
            const res = await chai.request(app)
                .post('/api/search')
                .send({
                    filters: {},
                    sort: { price: -1 }
                });

            expect(res).to.have.status(200);
            const prices = res.body.data.horses.map(h => h.price);
            expect(prices).to.equal(prices.sort((a, b) => b - a));
        });
    });

    describe('Search Preferences', () => {
        it('should save user search preferences', async () => {
            const preferences = {
                breeds: ['Thoroughbred', 'Arabian'],
                priceRange: { min: 200000, max: 1000000 },
                location: { states: ['Maharashtra', 'Karnataka'] }
            };

            const res = await chai.request(app)
                .post('/api/search/preferences')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ preferences });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.preferences).to.deep.include(preferences);
        });

        it('should get saved searches', async () => {
            const res = await chai.request(app)
                .get('/api/search/saved')
                .set('Authorization', `Bearer ${testToken}`);

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.savedSearches).to.be.an('array');
        });
    });

    describe('Search Suggestions', () => {
        it('should get breed suggestions', async () => {
            const res = await chai.request(app)
                .get('/api/search/suggestions')
                .query({
                    type: 'breed',
                    query: 'Arab'
                });

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.suggestions).to.be.an('array');
            expect(res.body.suggestions).to.include('Arabian');
        });

        it('should get location suggestions', async () => {
            const res = await chai.request(app)
                .get('/api/search/suggestions')
                .query({
                    type: 'location',
                    query: 'Mum'
                });

            expect(res).to.have.status(200);
            expect(res.body.suggestions).to.include('Mumbai');
        });

        it('should get price range suggestions', async () => {
            const res = await chai.request(app)
                .get('/api/search/suggestions')
                .query({ type: 'price' });

            expect(res).to.have.status(200);
            expect(res.body.suggestions).to.be.an('array');
            expect(res.body.suggestions[0]).to.have.property('range');
            expect(res.body.suggestions[0]).to.have.property('count');
        });
    });
}); 