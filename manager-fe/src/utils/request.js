/**
 * axios 封装 
 */
import axios from 'axios'
import config from './../config'
import { ElMessage } from 'element-plus'
import router from './../router'

const TOKEN_INVALID = 'Token认证失败, 请重新登录';
const NETWORK_ERROR = '网络请求异常，请稍后再试'

// 创建axios实例对象,添加全局配置
const service = axios.create({
    baseURl: config.baseApi,
    timeout: 8000
})

// 请求拦截
service.interceptors.request.use((req) => {
    // TO-DO
    const headers = req.headers;
    if(!headers.Authorization) headers.Authorization = 'BearJack';
    return req
})

// 响应拦截
service.interceptors.response.use((res) => {
    const {code, data , msg} = res.data;

    if(code === 200) {
        return data
    }else if(code === 40001) {
        ElMessage.error(TOKEN_INVALID);
        setTimeout(() => {
            router.push('/login');
        },15000)
        return Promise.reject(TOKEN_INVALID);
    }else{
        ElMessage.error(msg || NETWORK_ERROR);
        return Promise.reject(msg || NETWORK_ERROR)
    }
})

/**
 * 请求核心函数
 * @param {*} options 请求配置 
 * */
function request(options) {
    options.method = options.method || 'get';
    if(options.method.toLowerCase() === 'get'){
        options.params = options.data;
    }

    // 局部覆盖全局
    if(typeof options.mock != 'undefined'){
        config.mock = options.mock;
    }

    if(config.env === 'prod') {
        service.defaults.baseURL = config.baseApi;
        console.log(config.baseApi);
    }else {
        service.defaults.baseURL = config.mock ? config.mockApi:config.baseApi;
        console.log(config);
    }
    return service(options)
}

// 为 request 函数添加 下列方法'get','post','delete','patch'
['get','post','delete','patch'].forEach((item) => {
    request[item] = (url,data,options) => {
        return request({
            url,
            data,
            method:item,
            ...options
        })
    }
})

export default request;