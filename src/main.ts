import { createApp } from "vue";
import { createPinia } from "pinia";
import { Quasar } from "quasar";
import router from "./router";
import App from "./App.vue";
// Import Quasar CSS
import "quasar/dist/quasar.css";
// Import icon libraries (optional - choose what you need)
import "@quasar/extras/material-icons/material-icons.css";
import "./style.css";
import "./utils/devTools";


const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
});

app.mount("#app");
