/**
 * api管理
 */
import request from './../utils/request'
export default {
    login(params){
        return request({
            url:'/users/login',
            method:'post',
            data:params
        })
    },
    noticeCount(params){
        return request({
            url:'/leave/count',
            method:'get',
            data:{},
            mock:true
        })
    },
    // getMenuList(params){
    //     return request({
    //         url:'/menu/list',
    //         method:'get',
    //         data:{},
    //         mock:true
    //     })
    // },
    /**
     * 获取用户数据
     */
    getUserList(params) {
        return request({
            url: '/user/list',
            method: 'get',
            data: params,
            mock: false
        })
    }

}