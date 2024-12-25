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

describe('Recommendation Engine', () => {
    let user, userToken, seller, horses = [], review;

    before(async () => {
        // Create test data
        user = await createTestUser('recommender@test.com');
        userToken = user.generateAuthToken();
        seller = await createTestSeller();

        // Set user preferences
        user.preferences = {
            breeds: ['Thoroughbred', 'Arabian'],
            priceRange: { min: 200000, max: 1000000 },
            location: { states: ['Maharashtra', 'Karnataka'] },
            purposes: ['Dressage', 'Show Jumping'],
            ageRange: { min: 3, max: 8 }
        };
        await user.save();

        // Create multiple test horses
        const horseData = [
            {
                name: 'Perfect Match',
                breed: 'Thoroughbred',
                price: 500000,
                location: { state: 'Maharashtra' },
                specifications: { discipline: ['Dressage'] },
                age: { years: 5 }
            },
            {
                name: 'Partial Match',
                breed: 'Arabian',
                price: 300000,
                location: { state: 'Delhi' },
                specifications: { discipline: ['Trail Riding'] },
                age: { years: 4 }
            },
            {
                name: 'Similar Horse',
                breed: 'Thoroughbred',
                price: 550000,
                location: { state: 'Karnataka' },
                specifications: { discipline: ['Dressage', 'Show Jumping'] },
                age: { years: 6 }
            }
        ];

        for (const data of horseData) {
            const horse = await createTestHorse(seller._id, data);
            horses.push(horse);
        }

        // Create a review
        review = await chai.request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                entityType: 'horse',
                entityId: horses[0]._id,
                rating: { overall: 5 },
                content: {
                    description: 'Excellent horse, exactly what I was looking for.'
                }
            });
    });

    after(async () => {
        await cleanupTestData();
    });

    describe('Personalized Recommendations', () => {
        it('should get personalized recommendations based on preferences', async () => {
            const res = await chai.request(app)
                .get('/api/recommendations/personalized')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res).to.have.status(200);
            expect(res.body.success).to.be.true;
            expect(res.body.recommendations).to.be.an('array');
            expect(res.body.recommendations.length).to.be.greaterThan(0);

            // Verify recommendations match preferences
            const topRecommendation = res.body.recommendations[0];
            expect(user.preferences.breeds).to.include(topRecommendation.breed);
        });

        it('should exclude already viewed listings', async () => {
            // Log a view
            await chai.request(app)
                .post(`/api/buyer/activity/${horses[0]._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    action: 'VIEW_LISTING',
                    details: { duration: 300 }
                });

            const res = await chai.request(app)
                .get('/api/recommendations/personalized')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.body.recommendations.every(h => h._id !== horses[0]._id)).to.be.true;
        });
    });

    describe('Similar Listings', () => {
        it('should get similar listings for a horse', async () => {
            const res = await chai.request(app)
                .get(`/api/recommendations/similar/${horses[0]._id}`);

            expect(res).to.have.status(200);
            expect(res.body.similarListings).to.be.an('array');
            expect(res.body.similarListings.length).to.be.greaterThan(0);

            // Verify similarity criteria
            const similar = res.body.similarListings[0];
            expect(
                similar.breed === horses[0].breed ||
                similar.price >= horses[0].price * 0.8 ||
                similar.price <= horses[0].price * 1.2
            ).to.be.true;
        });

        it('should handle non-existent horse ID', async () => {
            const res = await chai.request(app)
                .get('/api/recommendations/similar/000000000000000000000000');

            expect(res).to.have.status(404);
        });
    });

    describe('Breed Recommendations', () => {
        it('should get breed-based recommendations', async () => {
            const res = await chai.request(app)
                .get('/api/recommendations/breeds')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res).to.have.status(200);
            expect(res.body.recommendations).to.be.an('array');
            expect(res.body.recommendations.length).to.be.greaterThan(0);

            // Verify breed matches user preferences
            const recommendation = res.body.recommendations[0];
            expect(user.preferences.breeds).to.include(recommendation.breed);
        });
    });

    describe('Price Range Matches', () => {
        it('should get horses within user\'s price range', async () => {
            const res = await chai.request(app)
                .get('/api/recommendations/price-matches')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res).to.have.status(200);
            expect(res.body.matches).to.be.an('array');
            expect(res.body.matches.length).to.be.greaterThan(0);

            // Verify price range
            const match = res.body.matches[0];
            expect(match.price).to.be.within(
                user.preferences.priceRange.min,
                user.preferences.priceRange.max
            );
        });

        it('should handle missing price range preferences', async () => {
            // Remove price range preference
            user.preferences.priceRange = undefined;
            await user.save();

            const res = await chai.request(app)
                .get('/api/recommendations/price-matches')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res).to.have.status(400);
            expect(res.body.success).to.be.false;
        });
    });
}); 