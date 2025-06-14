<template>
  <div class="app-container">
    <header class="header">
      <div class="logo">
        <img src="./assets/logo.png" alt="Atlas Search Movies" class="logo-image">
      </div>
      <div class="search-section">
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search movies..."
            @keyup.enter="handleSearch"
          >
          <button
            class="search-button"
            @click="handleSearch"
          >
            Search
          </button>
        </div>
        <div class="search-actions">
          <div class="title-weight-control">
            <label>Title Weight: {{ titleWeight }}</label>
            <input
              v-model.number="titleWeight"
              type="range"
              min="0"
              max="20"
              class="title-weight-slider"
            >
            <button
              class="weight-button"
              @click="handleTitleWeightSearch"
            >
              Apply Weight
            </button>
          </div>
          <button
            class="filter-button"
            @click="toggleFacets"
            type="button"
          >
            {{ showFacets ? 'Hide Advanced Filters' : 'Advanced Filters' }}
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div v-show="showFacets" class="filters-panel">
        <h3>Filters</h3>
        <div class="filter-group">
          <label>Runtime (minutes)</label>
          <input
            v-model.number="runtime"
            type="range"
            min="0"
            max="240"
            step="5"
          >
          <span>{{ runtime }} min</span>
        </div>

        <div class="filter-group">
          <label>IMDB Rating</label>
          <input
            v-model.number="rating"
            type="range"
            min="0"
            max="10"
            step="0.1"
          >
          <span>{{ rating }}</span>
        </div>

        <div class="filter-group">
          <label>Genre</label>
          <select v-model="selectedGenre">
            <option value="All">All Genres</option>
            <option v-for="genre in genres" :key="genre" :value="genre">
              {{ genre }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Release Date Range</label>
          <div class="date-inputs">
            <input
              v-model="startDate"
              type="date"
              :max="endDate || '2024-12-31'"
            >
            <span>to</span>
            <input
              v-model="endDate"
              type="date"
              :min="startDate || '1900-01-01'"
            >
          </div>
        </div>

        <button
          class="apply-filters-button"
          @click="performSearch"
        >
          Apply Filters
        </button>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
      </div>

      <div v-else>
        <div v-if="bestMatch" class="best-match">
          <h2>Best Match</h2>
          <MovieCard :movie="bestMatch" />
        </div>

        <div v-if="movies.length > 0" class="movie-grid">
          <MovieCard
            v-for="movie in movies"
            :key="movie._id"
            :movie="movie"
          />
        </div>
        <div v-else-if="!loading" class="no-results">
          <p>No movies found. Try adjusting your search criteria.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { searchMovies, searchMoviesWithTitleWeight } from './services/api'
import MovieCard from './components/MovieCard.vue'

// Types
interface Movie {
  _id: string
  title: string
  plot: string
  year: number
  runtime: number
  poster: string
  'imdb.rating': number
  genres: string[]
  score?: number
}

interface SearchFilters {
  runtime: number
  rating: number
  genre: string
  startDate: string
  endDate: string
}

// Router setup
const router = useRouter()
const route = useRoute()

// State
const searchQuery = ref('')
const loading = ref(false)
const movies = ref<Movie[]>([])
const bestMatch = ref<Movie | null>(null)
const showFacets = ref(true)

// Filter state
const runtime = ref(240)
const rating = ref(0)
const selectedGenre = ref('All')
const startDate = ref('')
const endDate = ref('')
const titleWeight = ref(0)

// Constants
const genres = ref([
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
  'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
])

// Lifecycle hooks
onMounted(() => {
  console.log('🎬 App mounted')
  console.log('Initial state:', {
    searchQuery: searchQuery.value,
    titleWeight: titleWeight.value,
    filters: {
      runtime: runtime.value,
      rating: rating.value,
      genre: selectedGenre.value,
      startDate: startDate.value,
      endDate: endDate.value
    },
    showFacets: showFacets.value
  })
})

// Methods
const performSearch = async () => {
  if (!searchQuery.value.trim()) return

  console.log('🔍 Starting search:', {
    query: searchQuery.value,
    titleWeight: titleWeight.value,
    filters: {
      runtime: runtime.value,
      rating: rating.value,
      genre: selectedGenre.value,
      startDate: startDate.value,
      endDate: endDate.value
    },
    timestamp: new Date().toISOString()
  })

  loading.value = true
  try {
    const searchFunction = titleWeight.value > 0 ? searchMoviesWithTitleWeight : searchMovies
    const searchParams = titleWeight.value > 0
      ? [searchQuery.value, titleWeight.value]
      : [searchQuery.value, {
          runtime: runtime.value,
          rating: rating.value,
          genre: selectedGenre.value,
          startDate: startDate.value,
          endDate: endDate.value
        }]

    console.log('Using search function:', {
      function: titleWeight.value > 0 ? 'searchMoviesWithTitleWeight' : 'searchMovies',
      params: searchParams
    })

    const result = await searchFunction(...searchParams)
    console.log('✅ Search completed:', {
      bestMatch: result.bestMatch,
      movieCount: result.movies.length,
      timestamp: new Date().toISOString()
    })

    bestMatch.value = result.bestMatch
    movies.value = result.movies
  } catch (error) {
    console.error('❌ Search failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/', query: { q: searchQuery.value } })
    performSearch()
  }
}

const toggleFacets = () => {
  console.log('🔄 Toggling filters:', {
    beforeToggle: showFacets.value,
    timestamp: new Date().toISOString()
  })
  showFacets.value = !showFacets.value
  console.log('After toggle:', {
    afterToggle: showFacets.value,
    timestamp: new Date().toISOString()
  })
}

const handleTitleWeightSearch = () => {
  if (!searchQuery.value.trim()) return

  console.log('🔍 Starting title weight search:', {
    query: searchQuery.value,
    titleWeight: titleWeight.value,
    timestamp: new Date().toISOString()
  })

  loading.value = true
  searchMoviesWithTitleWeight(searchQuery.value, titleWeight.value)
    .then(result => {
      console.log('✅ Title weight search completed:', {
        bestMatch: result.bestMatch,
        movieCount: result.movies.length,
        timestamp: new Date().toISOString()
      })
      bestMatch.value = result.bestMatch
      movies.value = result.movies
    })
    .catch(error => {
      console.error('❌ Title weight search failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    })
    .finally(() => {
      loading.value = false
    })
}

// Watchers
watch(() => route.query.q, (query) => {
  console.log('🔄 Route query changed:', {
    oldQuery: route.query.q,
    newQuery: query,
    timestamp: new Date().toISOString()
  })

  if (query) {
    searchQuery.value = query as string
    performSearch()
  }
}, { immediate: true })

watch(titleWeight, (newValue, oldValue) => {
  console.log('⚖️ Title weight changed:', {
    oldValue,
    newValue,
    timestamp: new Date().toISOString()
  })
})

// Watch all filter changes
watch([runtime, rating, selectedGenre, startDate, endDate], (newValues, oldValues) => {
  console.log('🔧 Filters changed:', {
    oldValues: {
      runtime: oldValues[0],
      rating: oldValues[1],
      genre: oldValues[2],
      startDate: oldValues[3],
      endDate: oldValues[4]
    },
    newValues: {
      runtime: newValues[0],
      rating: newValues[1],
      genre: newValues[2],
      startDate: newValues[3],
      endDate: newValues[4]
    },
    timestamp: new Date().toISOString()
  })
}, { deep: true })
</script>

<style>
.app-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  margin-bottom: 1rem;
}

.logo-image {
  height: 40px;
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-container {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  font-size: 1rem;
}

.search-button,
.filter-button,
.apply-filters-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button {
  background-color: #4CAF50;
  color: black;
}

.search-button:hover {
  background-color: #45a049;
}

.filter-button {
  background-color: #2196F3;
  color: black;
}

.filter-button:hover {
  background-color: #1976D2;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.best-match {
  margin-bottom: 2rem;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  padding: 1.5rem 0;
}

@media (min-width: 640px) {
  .movie-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .movie-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .movie-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.no-results {
  text-align: center;
  padding: 3rem 0;
  color: #6B7280;
}

.filters-panel {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.filter-group input[type="range"] {
  width: 100%;
  margin: 0.5rem 0;
}

.filter-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}

.date-inputs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.date-inputs input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}

.apply-filters-button {
  width: 100%;
  background-color: #4CAF50;
  color: black;
  padding: 0.75rem;
  margin-top: 1rem;
}

.apply-filters-button:hover {
  background-color: #45a049;
}

.title-weight-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-right: 1rem;
}

.title-weight-slider {
  width: 150px;
}

.weight-button {
  padding: 0.5rem 1rem;
  background-color: #2196F3;
  color: black;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.weight-button:hover {
  background-color: #1976D2;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
