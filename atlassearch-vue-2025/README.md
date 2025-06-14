# AtlasSearchMovies Vue

A modern Vue 3 application that uses MongoDB Atlas Search to find movies based on a topic or title. Features include:
* Autocomplete search suggestions
* Fuzzy matching
* Title field score boosting
* Faceting across dates and numerics
* Modern UI with Bootstrap 5
* Responsive design

## Features

- **Modern Search**: Utilizes MongoDB Atlas Search for powerful and flexible movie search
- **Autocomplete**: Real-time search suggestions as you type
- **Fuzzy Matching**: Find movies even with typos or similar terms
- **Title Boost**: Adjust the weight of title matches in search results
- **Faceted Search**: Filter results by:
  - Runtime
  - IMDB Rating
  - Genre
  - Release Date Range
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- MongoDB Atlas account with sample_mflix database

## Setup

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/atlassearch-vue.git
   cd atlassearch-vue
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a .env file in the root directory:
   \`\`\`
   VITE_API_URL=http://localhost:3000
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Building for Production

To build the application for production:

\`\`\`bash
npm run build
\`\`\`

The built files will be in the \`dist\` directory.

## API Endpoints

The application expects the following API endpoints:

- \`POST /api/search\`: Search movies with filters
- \`POST /api/search/title-weight\`: Search movies with title weight adjustment
- \`GET /api/autocomplete\`: Get search suggestions

## Technologies Used

- Vue 3
- Vue Router
- Bootstrap 5
- Font Awesome
- Axios
- MongoDB Atlas Search

## License

MIT
