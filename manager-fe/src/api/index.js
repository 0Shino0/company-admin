/**
 * api管理
 */
import request from './../utils/request'
export default {
    login(params){
        return request({
            url:'/user/login',
            method:'post',
            data:params,
        })
    }
}