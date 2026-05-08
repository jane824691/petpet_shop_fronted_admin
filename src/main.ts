import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './pinia'
import './style.css'
import 'ant-design-vue/dist/reset.css';
import 'primeicons/primeicons.css'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faTrash, faPenToSquare )

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

createApp(App).use(router).use(pinia).use(vuetify).component('font-awesome-icon', FontAwesomeIcon).mount('#app')