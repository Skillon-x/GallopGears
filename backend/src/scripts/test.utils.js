const mongoose = require('mongoose');
const colors = require('colors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const connectDB = require('../config/database');

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';
let server;
let dbConnection;

// Utility functions
const log = {
    success: (msg) => console.log('✓'.green, msg),
    error: (msg) => console.log('✗'.red, msg),
    info: (msg) => console.log('ℹ'.blue, msg),
    header: (msg) => console.log('\n' + '='.repeat(50).yellow + '\n' + msg + '\n' + '='.repeat(50).yellow)
};

// Helper function for making requests
async function makeRequest(method, endpoint, data = null, token = null, isFormData = false) {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await axios({
            method,
            url: `${BASE_URL}${endpoint}`,
            data: data || {},
            headers
        });
        return response.data;
    } catch (error) {
        if (process.env.DEBUG) {
            console.error('Request failed:', {
                method,
                endpoint,
                error: error.response?.data || error.message
            });
        }
        throw {
            message: error.response?.data?.message || error.message,
            status: error.response?.status,
            data: error.response?.data
        };
    }
}

// Connect to database
async function connectToDatabase() {
    try {
        // Close existing connection if any
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        // Connect to MongoDB
        await connectDB();

        // Wait for connection to be ready
        await new Promise((resolve) => {
            if (mongoose.connection.readyState === 1) {
                resolve();
            } else {
                mongoose.connection.once('connected', resolve);
            }
        });

        log.success('Connected to MongoDB');
        dbConnection = mongoose.connection;
        return dbConnection;
    } catch (error) {
        log.error('MongoDB connection error:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Database cleanup function
async function cleanupDatabase() {
    try {
        log.info('Cleaning up database...');
        
        // Connect to MongoDB if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                await collection.deleteMany({});
                await collection.dropIndexes();
            } catch (error) {
                // Ignore collection doesn't exist errors
                if (!error.message.includes('ns not found')) {
                    console.error(`Error with collection ${collection.collectionName}:`, error);
                }
            }
        }

        // Recreate indexes
        const models = [
            require('../models/User'),
            require('../models/Seller'),
            require('../models/Horse'),
            require('../models/Transaction'),
            require('../models/Inquiry'),
            require('../models/Review'),
            require('../models/Message'),
            require('../models/Conversation')
        ];

        for (const model of models) {
            if (model.collection) {
                try {
                    // Use createIndexes with error handling for conflicts
                    const indexes = await model.listIndexes();
                    const existingIndexNames = indexes.map(index => index.name);
                    
                    await model.schema.eachPath((pathName, schemaType) => {
                        if (schemaType.options.index) {
                            const indexName = `${pathName}_1`;
                            if (!existingIndexNames.includes(indexName)) {
                                return model.collection.createIndex(
                                    { [pathName]: 1 },
                                    {
                                        ...schemaType.options,
                                        background: true
                                    }
                                );
                            }
                        }
                    });
                } catch (error) {
                    // Handle index conflict errors gracefully
                    if (error.code === 86) {
                        log.info(`Indexes already exist for ${model.modelName}, skipping...`);
                    } else {
                        console.error(`Error creating indexes for ${model.modelName}:`, error);
                    }
                }
            }
        }

        log.success('Database cleaned');
    } catch (error) {
        log.error('Database cleanup failed:');
        console.error(error);
        process.exit(1);
    }
}
// Start server
async function startServer() {
    try {
        // Set test environment
        process.env.NODE_ENV = 'test';

        // Connect to database if not connected
        if (!dbConnection || mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Import server app
        const app = require('../../server');

        // Close existing server if any
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }

        // Create new server
        const PORT = process.env.PORT || 5000;
        return new Promise((resolve, reject) => {
            try {
                server = app.listen(PORT, () => {
                    log.info(`Test server running on port ${PORT}`);
                    resolve(server);
                });

                server.on('error', (error) => {
                    log.error('Server startup error:');
                    console.error(error);
                    reject(error);
                });
            } catch (error) {
                log.error('Failed to create server:');
                console.error(error);
                reject(error);
            }
        });
    } catch (error) {
        log.error('Failed to start server:');
        console.error(error);
        process.exit(1);
    }
}

// Stop server
async function stopServer() {
    try {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
            server = null;
        }
        if (dbConnection) {
            await mongoose.connection.close();
            dbConnection = null;
        }
    } catch (error) {
        log.error('Failed to stop server:');
        console.error(error);
        process.exit(1);
    }
}

// Wait for server to be ready
async function waitForServer(maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            await axios.get(`${BASE_URL}/auth/health`);
            return true;
        } catch (error) {
            if (i === maxAttempts - 1) {
                log.error('Server not ready:');
                console.error(error);
                throw new Error('Server not ready');
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return false;
}

// Test runner function
async function runTests(testSuites) {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    try {
        // Clean database before tests
        await cleanupDatabase();

        // Start server and wait for it to be ready
        await startServer();
        await waitForServer();

        for (const suite of testSuites) {
            log.header(`Test Suite: ${suite.name}`);
            
            for (const test of suite.tests) {
                totalTests++;
                try {
                    const startTime = Date.now();
                    await test.run();
                    const duration = Date.now() - startTime;
                    log.success(`${test.name} (${duration}ms)`);
                    passedTests++;
                } catch (error) {
                    log.error(`${test.name} - ${error.message}`);
                    if (process.env.DEBUG) {
                        console.error(error);
                    }
                    failedTests++;
                }
            }
        }

        log.header('Test Summary');
        log.info(`Total Tests: ${totalTests}`);
        log.success(`Passed: ${passedTests}`);
        if (failedTests > 0) {
            log.error(`Failed: ${failedTests}`);
        }

    } catch (error) {
        log.error('Test execution failed:');
        console.error(error);
    } finally {
        // Cleanup after tests
        await cleanupDatabase();
        await stopServer();
        process.exit(failedTests > 0 ? 1 : 0);
    }
}

module.exports = {
    log,
    makeRequest,
    cleanupDatabase,
    runTests,
    BASE_URL,
    waitForServer,
    startServer,
    stopServer,
    connectToDatabase
}; 