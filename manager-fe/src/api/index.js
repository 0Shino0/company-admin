/**
 * api管理
 */
import request from './../utils/request'
export default {
    login(params) {
        return request({
            url: '/users/login',
            method: 'post',
            data: params
        })
    },
    noticeCount() {
        return request({
            url: '/leave/count',
            method: 'get',
            data: {},
            mock: false
        })
    },
    // 获取用户权限数据
    getPermissionList() {
        return request({
            url: '/users/getPermissionList',
            method: 'get',
            data: {},
            mock: false
        })
    },
    /**
    * 获取用户数据
    */
    getUserList(params) {
        return request({
            url: '/users/list',
            method: 'get',
            data: params
        })
    },
    getAllUserList() {
        return request({
            url: '/users/all/list',
            method: 'get',
            data: {},
            mock: false
        })
    },
    /**
     * 删除用户
     */
    userDel(params) {
        return request({
            url: '/users/delete',
            method: 'post',
            data: params
        })
    },
    getDeptList(params) {
        return request({
            url: '/dept/list',
            method: 'get',
            data: params,
            mock: false
        })
    },
    deptOperate(params) {
        return request({
            url: '/dept/operate',
            method: 'post',
            data: params,
            mock: false
        })
    },
    userSubmit(params) {
        return request({
            url: '/users/operate',
            method: 'post',
            data: params,
            mock: false
        })
    },
    getMenuList(params) {
        return request({
            url: '/menu/list',
            method: 'get',
            data: params,
            mock: false
        })
    },
    // 菜单
    menuSubmit(params) {
        return request({
            url: '/menu/operate',
            method: 'post',
            data: params,
            mock: false
        })
    },
    getRoleAllList() {
        return request({
            url: '/roles/allList',
            method: 'get',
            data: {},
            mock: false
        })
    },
    getRoleList(params) {
        return request({
            url: '/roles/list',
            method: 'get',
            data: params,
            mock: false
        })
    },
    roleOperate(params) {
        return request({
            url: '/roles/operate',
            method: 'post',
            data: params,
            mock: false

        })
    },
    updatePermission(params) {
        return request({
            url: '/roles/update/permission',
            method: 'post',
            data: params,
            mock: false
        })
    },
    // 休假管理
    getLeaveList(params) {
        return request({
            url: '/leave/list',
            method: 'get',
            data: params,
            mock: false
        })
    },
    leaveOperate(params) {
        return request({
            url: '/leave/operate',
            method: 'post',
            data: params,
            mock: false
        })
    },
    leaveApprove(params) {
        return request({
            url: '/leave/approve',
            method: 'post',
            data: params,
            mock: false
        })
    }
}