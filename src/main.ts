import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './style.css';
import './utils/devTools';

const app = createApp(App);

app.use(createPinia());
app.use(router);
import * as LucideIcons from "lucide-vue-next";

Object.entries(LucideIcons).forEach(([name, component]) => {
  // Register each lucide component globally
  app.component(name, component as any);
});



app.mount('#app');

