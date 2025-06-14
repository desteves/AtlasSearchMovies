import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const searchMovies = async (query, filters) => {
  try {
    console.log('🔍 Regular search request:', {
      query,
      filters,
      timestamp: new Date().toISOString()
    })
    const response = await api.post('/api/search', {
      query,
      filters
    })
    console.log('✅ Regular search response:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    })
    return response.data
  } catch (error) {
    console.error('❌ Error searching movies:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    })
    throw error
  }
}

export const searchMoviesWithTitleWeight = async (query, titleWeight) => {
  try {
    console.log('🔍 Title weight search request:', {
      query,
      titleWeight,
      timestamp: new Date().toISOString()
    })
    const response = await api.post('/api/search/title-weight', {
      query,
      titleWeight
    })
    console.log('✅ Title weight search response:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    })
    return response.data
  } catch (error) {
    console.error('❌ Error searching movies with title weight:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    })
    throw error
  }
}

export const getAutocompleteSuggestions = async (query) => {
  try {
    console.log('🔍 Autocomplete request:', {
      query,
      timestamp: new Date().toISOString()
    })
    const response = await api.get('/api/autocomplete', {
      params: { query }
    })
    console.log('✅ Autocomplete response:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    })
    return response.data
  } catch (error) {
    console.error('❌ Error getting autocomplete suggestions:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    })
    throw error
  }
}