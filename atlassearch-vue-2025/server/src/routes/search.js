const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Search movies (POST)
router.post('/search', searchController.searchMovies);

// Search movies with title weight (POST)
router.post('/search/title-weight', searchController.searchMoviesWithTitleWeight);

// Get autocomplete suggestions (GET)
router.get('/autocomplete', searchController.getAutocompleteSuggestions);

module.exports = router;