const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

// MongoDB Connection
async function connectToMongo() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    // Verify we're connected to sample_mflix
    const db = client.db('sample_mflix');
    if (db.databaseName !== 'sample_mflix') {
      console.error('Error: Not connected to sample_mflix database!');
      await client.close();
      process.exit(1);
    }

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define the indexes
const indexes = [
  {
    "name": "movies",
    "definition": {
      "mappings": {
        "dynamic": false,
        "fields": {
          "title": {
            "type": "autocomplete",
            "minGrams": 2,
            "maxGrams": 20,
          },
          "plot": {
            "type": "string"
          },
          "year": {
            "type": "number"
          },
          "runtime": {
            "type": "number"
          },
          "imdb.rating": {
            "type": "number"
          },
          "genres": {
            "type": "string"
          }
        }
      }
    }
  },
  {
    "name": "movies_title_weight",
    "definition": {
      "mappings": {
        "dynamic": false,
        "fields": {
          "title": {
            "type": "autocomplete",
            "minGrams": 2,
            "maxGrams": 20,

          },
          "plot": {
            "type": "string"
          }
        }
      }
    }
  },
  {
    "name": "movies_autocomplete",
    "definition": {
      "mappings": {
        "dynamic": false,
        "fields": {
          "title": {
            "type": "autocomplete",
            "minGrams": 2,
            "maxGrams": 20,
          }
        }
      }
    }
  }
];

// Create the indexes
async function createIndexes() {
  let client;
  try {
    // Connect to MongoDB
    const { client: mongoClient, db } = await connectToMongo();
    client = mongoClient;
    const moviesCollection = db.collection('movies');

    // Check if collection exists
    const collections = await db.listCollections().toArray();
    const moviesExists = collections.some(col => col.name === 'movies');

    if (!moviesExists) {
      console.error('Error: movies collection does not exist in sample_mflix database');
      process.exit(1);
    }

    const result = await moviesCollection.createSearchIndexes(indexes);
    console.log(result);

    console.log('\nAll indexes processed');
  } catch (error) {
    console.error('Error in createIndexes:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\nMongoDB connection closed');
    }
  }
}

// Run the script
createIndexes().catch(console.error);