/**
 * 环境变量配置 
 */
const env = import.meta.env.MODE || 'prod';
const EnvConfig = {
    development:{
        baseApi:'/api',
        mockApi:'https://www.fastmock.site/mock/bdc39fe45bc0f9e22ae8dec88aeff8fe/api'
    },
    test:{
        baseApi:'//test.futurefe.com/api',
        mockApi:'https://www.fastmock.site/mock/bdc39fe45bc0f9e22ae8dec88aeff8fe/api'
    },
    prod:{
        baseApi:'//futurefe.com/api',
        mockApi:'https://www.fastmock.site/mock/bdc39fe45bc0f9e22ae8dec88aeff8fe/api'
    }
}

export default {
    env,
    mock:false,
    namespace:'manager',
    ...EnvConfig[env]
}