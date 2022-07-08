import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import request from './utils/request';
import storage from './utils/storage';

// element 插件
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';

console.log('环境变量=>',import.meta.env);
const app = createApp(App);
// 全局挂载 请求组件
app.config.globalProperties.$request = request;
app.config.globalProperties.$storage = storage;
app.use(router)
.use(ElementPlus)
.mount('#app');
