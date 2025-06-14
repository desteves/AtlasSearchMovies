import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faHome, faSearch, faStar, faFilter } from '@fortawesome/free-solid-svg-icons'

// Add icons to the library
library.add(faHome, faSearch, faStar, faFilter)

const app = createApp(App)

// Register Font Awesome component
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(router)

app.mount('#app')
