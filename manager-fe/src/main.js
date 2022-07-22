import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import storage from './utils/storage';
import request from './utils/request';
import store from './store';
import api from './api';


// element 插件
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';

console.log('环境变量=>', import.meta.env);

// 先创建 app 
const app = createApp(App);

// 定义全局指令
app.directive('has', {
    beforeMount: (el, binding) => {
        // console.log(el, binding);
        // 获取按钮权限
        let actionList = storage.getItem('actionList')
        let value = binding.value;
        // includes() 方法用来判断一个数组是否包含一个指定的值，根据情况，如果包含则返回 true，否则返回 false。
        // 盘点列表中是否有对应按钮权限标识
        let hasPermission = actionList.includes(value)
        if (!hasPermission) {
            // 隐藏按钮
            el.style = "display:none"
            setTimeout(() => {
                // 删除按钮
                el.parentNode.removeChild(el)
            }, 0)
        }
    }
})

// 全局挂载 请求组件
app.config.globalProperties.$request = request;
app.config.globalProperties.$api = api;
app.config.globalProperties.$storage = storage;
app
    .use(router)
    .use(store)
    .use(ElementPlus, { size: 'small' })
    .mount('#app');
