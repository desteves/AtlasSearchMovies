const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB Connection
async function connectToMongo() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('sample_mflix');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Search movies by topic
exports.searchMovies = async (req, res) => {
  let client;
  try {
    console.log('📥 Received search request:', {
      body: req.body,
      query: req.query,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    const { query, filters = {} } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    console.log('🔍 Search parameters:', {
      query,
      filters,
      page,
      limit,
      skip,
      timestamp: new Date().toISOString()
    });

    const { client: mongoClient, db } = await connectToMongo();
    client = mongoClient;
    const moviesCollection = db.collection('movies');

    const searchPipeline = [
      {
        $search: {
          index: "movies",
          compound: {
            must: [
              {
                text: {
                  query: query,
                  path: ["title", "plot"],
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 2
                  }
                }
              }
            ],
            filter: [
              ...(filters.runtime ? [{
                range: {
                  path: "runtime",
                  lte: filters.runtime
                }
              }] : []),
              ...(filters.rating ? [{
                range: {
                  path: "imdb.rating",
                  gte: filters.rating
                }
              }] : []),
              ...(filters.startDate && filters.endDate ? [{
                range: {
                  path: "year",
                  gte: new Date(filters.startDate).getFullYear(),
                  lte: new Date(filters.endDate).getFullYear()
                }
              }] : [])
            ]
          }
        }
      },
      {
        $match: filters.genre && filters.genre !== 'All' ? { genres: filters.genre } : {}
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                title: 1,
                year: 1,
                plot: 1,
                poster: 1,
                runtime: 1,
                "imdb.rating": 1,
                genres: 1,
                score: { $meta: "searchScore" }
              }
            }
          ]
        }
      }
    ];

    console.log('🔍 MongoDB pipeline:', JSON.stringify(searchPipeline, null, 2));

    const result = await moviesCollection.aggregate(searchPipeline).toArray();
    console.log('📊 Search results:', {
      total: result[0]?.metadata[0]?.total || 0,
      resultsCount: result[0]?.data?.length || 0,
      timestamp: new Date().toISOString()
    });

    const total = result[0]?.metadata[0]?.total || 0;
    const movies = result[0]?.data || [];

    // Separate best match and other results
    const bestMatch = movies[0];
    const otherMovies = movies.slice(1);

    console.log('📤 Sending response:', {
      bestMatch: bestMatch ? { title: bestMatch.title, score: bestMatch.score } : null,
      moviesCount: otherMovies.length,
      timestamp: new Date().toISOString()
    });

    res.json({
      bestMatch,
      movies: otherMovies,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Search error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Error searching movies' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Search movies with title weight
exports.searchMoviesWithTitleWeight = async (req, res) => {
  let client;
  try {
    console.log('📥 Received title weight search request:', {
      body: req.body,
      query: req.query,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    const { query, titleWeight = 3 } = req.body;
    const numericTitleWeight = Number(titleWeight);

    if (isNaN(numericTitleWeight)) {
      console.error('❌ Invalid title weight:', { titleWeight });
      return res.status(400).json({ error: 'Title weight must be a number' });
    }

    console.log('🔍 Title weight search parameters:', {
      query,
      titleWeight: numericTitleWeight,
      timestamp: new Date().toISOString()
    });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const { client: mongoClient, db } = await connectToMongo();
    client = mongoClient;
    const moviesCollection = db.collection('movies');

    const searchPipeline = [
      {
        $search: {
          index: "movies_title_weight",
          compound: {
            should: [
              {
                text: {
                  query: query,
                  path: "title",
                  score: { boost: { value: numericTitleWeight } }
                }
              },
              {
                text: {
                  query: query,
                  path: "plot"
                }
              }
            ],
            minimumShouldMatch: 1
          }
        }
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                title: 1,
                year: 1,
                plot: 1,
                poster: 1,
                runtime: 1,
                "imdb.rating": 1,
                genres: 1,
                score: { $meta: "searchScore" }
              }
            }
          ]
        }
      }
    ];

    console.log('🔍 MongoDB pipeline:', JSON.stringify(searchPipeline, null, 2));

    const result = await moviesCollection.aggregate(searchPipeline).toArray();
    console.log('📊 Search results:', {
      total: result[0]?.metadata[0]?.total || 0,
      resultsCount: result[0]?.data?.length || 0,
      timestamp: new Date().toISOString()
    });

    const total = result[0]?.metadata[0]?.total || 0;
    const movies = result[0]?.data || [];

    // Separate best match and other results
    const bestMatch = movies[0];
    const otherMovies = movies.slice(1);

    console.log('📤 Sending response:', {
      bestMatch: bestMatch ? { title: bestMatch.title, score: bestMatch.score } : null,
      moviesCount: otherMovies.length,
      timestamp: new Date().toISOString()
    });

    res.json({
      bestMatch,
      movies: otherMovies,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Title weight search error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      error: 'Error searching movies with title weight',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Get autocomplete suggestions
exports.getAutocompleteSuggestions = async (req, res) => {
  let client;
  try {
    const { query } = req.query;

    const { client: mongoClient, db } = await connectToMongo();
    client = mongoClient;
    const moviesCollection = db.collection('movies');

    const searchPipeline = [
      {
        $search: {
          index: "movies_autocomplete",
          autocomplete: {
            query: query,
            path: "title",
            fuzzy: {
              maxEdits: 1,
              prefixLength: 2
            }
          }
        }
      },
      {
        $limit: 30
      },
      {
        $project: {
          _id: 1,
          title: 1,
          score: { $meta: "searchScore" }
        }
      }
    ];

    const suggestions = await moviesCollection.aggregate(searchPipeline).toArray();
    res.json({ suggestions });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Error getting suggestions' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};