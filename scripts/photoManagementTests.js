const { log, makeRequest, runTests } = require('./test.utils');
const fs = require('fs');
const path = require('path');

// Debug function
const debug = (message, data = null) => {
    if (process.env.DEBUG) {
        console.log('\n[DEBUG]', message);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
};

// Test data storage
let testData = {
    sellerToken: '',
    horseId: '',
    uploadedPhotos: []
};

const testSuites = [
    {
        name: 'Photo Management Tests',
        tests: [
            {
                name: 'Setup Test Seller',
                run: async () => {
                    debug('Registering new seller');
                    const registerResult = await makeRequest('POST', '/auth/register', {
                        name: 'Photo Test Seller',
                        email: 'phototest@seller.com',
                        password: 'test123',
                        role: 'user'
                    });

                    debug('Registration response:', registerResult);
                    if (!registerResult.success) {
                        throw new Error('Failed to register seller');
                    }
                    testData.sellerToken = registerResult.token;

                    debug('Creating seller profile');
                    const profileResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Photo Test Stables',
                        description: 'Test stable for photo management',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        contactDetails: {
                            phone: '9876543210',
                            email: 'phototest@stables.com',
                            whatsapp: '9876543210'
                        },
                        businessDocuments: {
                            gst: 'TESTGST123',
                            pan: 'TESTPAN123'
                        }
                    }, testData.sellerToken);

                    debug('Profile creation response:', profileResult);
                    if (!profileResult.success) {
                        throw new Error('Failed to create seller profile');
                    }

                    debug('Subscribing to Royal Stallion package');
                    const subscribeResult = await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Royal Stallion',
                        duration: 30
                    }, testData.sellerToken);

                    debug('Subscription response:', subscribeResult);
                    if (!subscribeResult.success) {
                        throw new Error('Failed to subscribe seller');
                    }

                    // Wait for subscription to be active
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Verify subscription is active
                    const subCheckResult = await makeRequest('GET', '/sellers/subscription', null, testData.sellerToken);
                    debug('Subscription check response:', subCheckResult);
                    if (!subCheckResult.success || !subCheckResult.subscription || subCheckResult.subscription.status !== 'active') {
                        throw new Error('Royal Stallion subscription not active');
                    }
                }
            },
            {
                name: 'Create Test Horse Listing',
                run: async () => {
                    debug('Creating test horse listing');
                    const result = await makeRequest('POST', '/horses', {
                        name: 'Photo Test Horse',
                        breed: 'Thoroughbred',
                        age: { years: 5, months: 0 },
                        gender: 'Stallion',
                        color: 'Bay',
                        price: 100000,
                        description: 'Test horse for photo management',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        specifications: {
                            training: 'Basic',
                            discipline: ['Dressage'],
                            temperament: 'Calm',
                            healthStatus: 'Good',
                            vaccination: true,
                            papers: true
                        }
                    }, testData.sellerToken);

                    debug('Horse listing creation response:', result);
                    if (!result.success || !result.horse) {
                        throw new Error('Failed to create horse listing');
                    }
                    testData.horseId = result.horse._id;
                    debug('Stored horse ID:', { horseId: testData.horseId });
                }
            },
            {
                name: 'Upload Photos',
                run: async () => {
                    debug('Uploading test photos');
                    // Create test photos with base64 content
                    const testPhotos = [
                        {
                            name: 'test1.jpg',
                            content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
                            size: 1024 * 1024 // 1MB
                        },
                        {
                            name: 'test2.jpg',
                            content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
                            size: 1024 * 1024 // 1MB
                        }
                    ];

                    const result = await makeRequest('POST', `/photos/upload/${testData.horseId}`, {
                        photos: testPhotos
                    }, testData.sellerToken);

                    debug('Photo upload response:', result);
                    if (!result.success || !result.images) {
                        throw new Error('Failed to upload photos');
                    }

                    testData.uploadedPhotos = result.images;
                    debug('Stored uploaded photos:', { count: testData.uploadedPhotos.length });
                }
            },
            {
                name: 'Reorder Photos',
                run: async () => {
                    if (testData.uploadedPhotos.length < 2) {
                        debug('Skipping reorder test - not enough photos');
                        return;
                    }

                    debug('Reordering photos');
                    // Reverse the order
                    const photoIds = testData.uploadedPhotos.map(p => p.public_id).reverse();
                    
                    const result = await makeRequest('PUT', `/photos/${testData.horseId}/reorder`, {
                        photoIds
                    }, testData.sellerToken);

                    debug('Reorder response:', result);
                    if (!result.success) {
                        throw new Error('Failed to reorder photos');
                    }

                    // Verify order
                    const horse = await makeRequest('GET', `/horses/${testData.horseId}`, null, testData.sellerToken);
                    const newOrder = horse.horse.images.map(img => img.public_id);
                    if (JSON.stringify(newOrder) !== JSON.stringify(photoIds)) {
                        throw new Error('Photos not reordered correctly');
                    }
                }
            },
            {
                name: 'Delete Photo',
                run: async () => {
                    if (testData.uploadedPhotos.length === 0) {
                        debug('Skipping delete test - no photos');
                        return;
                    }

                    debug('Deleting photo');
                    const photoToDelete = testData.uploadedPhotos[0];
                    const result = await makeRequest('DELETE', `/photos/${testData.horseId}/${photoToDelete.public_id.split('/')[1]}`, null, testData.sellerToken);

                    debug('Delete response:', result);
                    if (!result.success) {
                        throw new Error('Failed to delete photo');
                    }

                    // Verify deletion
                    const horse = await makeRequest('GET', `/horses/${testData.horseId}`, null, testData.sellerToken);
                    const photoStillExists = horse.horse.images.some(img => img.public_id === photoToDelete.public_id);
                    if (photoStillExists) {
                        throw new Error('Photo not deleted from listing');
                    }

                    // Remove from test data
                    testData.uploadedPhotos = testData.uploadedPhotos.filter(p => p.public_id !== photoToDelete.public_id);
                    debug('Updated photo count:', { count: testData.uploadedPhotos.length });
                }
            },
            {
                name: 'Verify Photo Limits',
                run: async () => {
                    debug('Testing photo limits');
                    // Create 21 test photos (exceeding Royal Stallion limit of 20)
                    const testPhotos = Array(21).fill({
                        name: 'test.jpg',
                        content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
                        size: 1024 * 1024 // 1MB
                    });

                    debug('Attempting to upload more than limit');
                    try {
                        await makeRequest('POST', `/photos/upload/${testData.horseId}`, {
                            photos: testPhotos
                        }, testData.sellerToken);
                        throw new Error('Should not allow uploading more than package limit');
                    } catch (error) {
                        if (!error.message.includes('Cannot upload more than 20 photos')) {
                            throw error;
                        }
                        debug('Successfully prevented exceeding photo limit');
                    }
                }
            }
        ]
    }
];

// Add command line arguments handling
const args = process.argv.slice(2);
if (args.includes('--debug')) {
    process.env.DEBUG = 'true';
}

// Run tests
runTests(testSuites); 