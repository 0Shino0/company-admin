/**
 * 环境变量配置 
 */
const env = import.meta.env.MODE || 'prod';
const EnvConfig = {
    dev:{
        baseApi:'/',
        mockApi: 'https://www.fastmock.site/mock/bdc39fe45bc0f9e22ae8dec88aeff8fe/api'
    },
    test:{
        baseApi:'//test.xxx',
        mockApi: 'https://www.fastmock.site/mock/bdc39fe45bc0f9e22ae8dec88aeff8fe/api'
    },
    prod:{
        baseApi:'//test.xxx',
        mockApi: 'https://www.fastmock.site/mock/bdc39fe45bc0f9e22ae8dec88aeff8fe/api'
    }
}
export default {
    env: 'dev',
    mock: true,
    ...EnvConfig[env]
}