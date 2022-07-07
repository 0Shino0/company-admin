import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// element 插件
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';

console.log('环境变量=>',import.meta.env);
const app = createApp(App);

app.use(router)
.use(ElementPlus)
.mount('#app');
