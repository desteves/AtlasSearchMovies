const request = require('supertest');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

let app;
let client;
let db;

// Mock data
const mockMovies = [
  {
    _id: '1',
    title: 'Star Wars',
    plot: 'A long time ago in a galaxy far, far away...',
    year: 1977,
    runtime: 121,
    'imdb.rating': 8.6,
    genres: ['Action', 'Adventure', 'Fantasy']
  },
  {
    _id: '2',
    title: 'Star Trek',
    plot: 'Space, the final frontier...',
    year: 1966,
    runtime: 50,
    'imdb.rating': 8.3,
    genres: ['Action', 'Adventure', 'Sci-Fi']
  }
];

// Setup before all tests
beforeAll(async () => {
  // Connect to test database
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db('sample_mflix_test');

  // Create test collection and insert mock data
  const moviesCollection = db.collection('movies');
  await moviesCollection.insertMany(mockMovies);

  // Import app after database setup
  app = require('../index');
});

// Cleanup after all tests
afterAll(async () => {
  // Drop test collection
  await db.collection('movies').drop();

  // Close database connection
  await client.close();
});

describe('Search Routes', () => {
  describe('GET /api/search', () => {
    it('should return movies matching the search query', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ query: 'star' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('movies');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.movies)).toBe(true);
      expect(response.body.movies.length).toBeGreaterThan(0);
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ query: 'star', page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.movies.length).toBeLessThanOrEqual(1);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('pages');
    });
  });

  describe('GET /api/search/title-weight', () => {
    it('should return movies with title-weighted search results', async () => {
      const response = await request(app)
        .get('/api/search/title-weight')
        .query({ query: 'star' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('movies');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.movies)).toBe(true);
      expect(response.body.movies.length).toBeGreaterThan(0);
    });

    it('should prioritize title matches', async () => {
      const response = await request(app)
        .get('/api/search/title-weight')
        .query({ query: 'star' });

      expect(response.status).toBe(200);
      // First result should have 'star' in the title
      expect(response.body.movies[0].title.toLowerCase()).toContain('star');
    });
  });

  describe('GET /api/search/autocomplete', () => {
    it('should return autocomplete suggestions', async () => {
      const response = await request(app)
        .get('/api/search/autocomplete')
        .query({ query: 'sta' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('score');
    });

    it('should limit suggestions to 10 results', async () => {
      const response = await request(app)
        .get('/api/search/autocomplete')
        .query({ query: 'sta' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid search queries', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ query: '' });

      expect(response.status).toBe(200);
      expect(response.body.movies).toHaveLength(0);
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ query: 'star', page: -1, limit: 0 });

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pages).toBeGreaterThan(0);
    });
  });
});