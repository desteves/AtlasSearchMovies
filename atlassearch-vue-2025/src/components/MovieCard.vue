<template>
  <div class="movie-card">
    <div class="poster-container">
      <img
        :src="movie.poster"
        class="poster-image"
        :alt="movie.title"
        @error="handleImageError"
      >
    </div>
    <div class="content">
      <h5 class="title">{{ movie.title }}</h5>
      <p class="plot">{{ movie.plot }}</p>
      <div class="details">
        <span>Year: {{ movie.year }}</span>
        <span>|</span>
        <span>Runtime: {{ movie.runtime }} min</span>
        <span>|</span>
        <span>IMDB: {{ movie.imdb.rating }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
})

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'
}
</script>

<style scoped>
.movie-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  overflow: hidden;
}

.movie-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.poster-container {
  position: relative;
  padding-bottom: 150%; /* 2:3 aspect ratio */
}

.poster-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  padding: 1rem;
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.plot {
  color: #374151;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6B7280;
}
</style>